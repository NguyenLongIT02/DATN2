package vn.nguyenlong.taskmanager.scrumboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.scrumboard.config.AiAssistantConfig;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.AiBoardChatRequestDto;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.AiBoardChatResponseDto;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.AiBoardSuggestionDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardMemberEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardMemberEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardMemberRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.ListRepository;
import vn.nguyenlong.taskmanager.scrumboard.security.AuthzService;
import vn.nguyenlong.taskmanager.scrumboard.service.CardService;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.CreateCardRequest;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.websocket.service.WebSocketBroadcastService;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.CardDto;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
@Transactional
public class BoardAiSuggestionService {

    private static final int MAX_ITEMS = 3;

    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final CardRepository cardRepository;
    private final AuthzService authzService;
    private final CardService cardService;
    private final ListRepository listRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final AiAssistantConfig aiAssistantConfig;
    private final WebSocketBroadcastService webSocketBroadcastService;
    private final RestTemplate restTemplate;

    public BoardAiSuggestionService(
            BoardRepository boardRepository,
            BoardMemberRepository boardMemberRepository,
            CardRepository cardRepository,
            AuthzService authzService,
            CardService cardService,
            ListRepository listRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            AiAssistantConfig aiAssistantConfig,
            WebSocketBroadcastService webSocketBroadcastService
    ) {
        this.boardRepository = boardRepository;
        this.boardMemberRepository = boardMemberRepository;
        this.cardRepository = cardRepository;
        this.authzService = authzService;
        this.cardService = cardService;
        this.listRepository = listRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.aiAssistantConfig = aiAssistantConfig;
        this.webSocketBroadcastService = webSocketBroadcastService;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(aiAssistantConfig.getTimeoutMs());
        requestFactory.setReadTimeout(aiAssistantConfig.getTimeoutMs());
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public AiBoardSuggestionDto generateBoardSuggestions(Long boardId, Long currentUserId) {
        if (!authzService.isBoardMember(currentUserId, boardId)) {
            throw new AccessDeniedException("Chỉ thành viên board mới được dùng AI tư vấn");
        }

        BoardEntity board = boardRepository.findById(boardId)
                .orElseThrow(() -> new NotFoundException("Board not found with id: " + boardId));

        List<BoardMemberEntity> activeMembers = boardMemberRepository.findActiveByBoardId(boardId);
        List<CardEntity> cards = fetchCardsWithAllDetails(boardId);

        Map<Long, Integer> workloadByUser = initializeWorkload(activeMembers, cards);
        List<CardInsight> insights = buildCardInsights(cards);

        List<AiBoardSuggestionDto.PriorityItem> priorities = buildPriorities(insights);
        List<AiBoardSuggestionDto.RiskItem> risks = buildRisks(insights);
        List<AiBoardSuggestionDto.AssignmentItem> assignments =
                buildAssignments(insights, activeMembers, workloadByUser);

        String ruleSummary = buildRuleSummary(board.getName(), cards.size(), priorities.size(), risks.size(), assignments.size());
        List<String> ruleActions = buildDefaultActions(priorities, risks, assignments);

        String summary = ruleSummary;
        List<String> nextActions = ruleActions;
        Set<String> groundedTerms = collectGroundedTerms(board.getName(), activeMembers, priorities, risks, assignments);

        boolean aiConfigured = aiAssistantConfig.hasApiKey();
        boolean aiUsed = false;
        String fallbackReason = null;

        if (aiAssistantConfig.isReady()) {
            try {
                AiNarrativeResult aiNarrative = requestAiNarrative(
                        board.getName(),
                        cards.size(),
                        activeMembers,
                        priorities,
                        risks,
                        assignments,
                        ruleSummary,
                        ruleActions
                );

                if (aiNarrative != null) {
                    GroundedNarrative groundedNarrative = applyGroundedNarrative(
                            aiNarrative,
                            ruleSummary,
                            ruleActions,
                            groundedTerms
                    );

                    summary = groundedNarrative.getSummary();
                    nextActions = groundedNarrative.getNextActions();
                    aiUsed = groundedNarrative.isAiContributionAccepted();

                    if (!groundedNarrative.isAiContributionAccepted()) {
                        fallbackReason = "Phản hồi AI không bám dữ liệu thật của board, hệ thống chuyển sang gợi ý theo rule.";
                    } else if (groundedNarrative.isPartiallyAccepted()) {
                        fallbackReason = "Phản hồi AI có chi tiết chưa xác minh; hệ thống chỉ giữ phần bám dữ liệu.";
                    }
                } else {
                    fallbackReason = "AI không trả nội dung, hệ thống chuyển sang gợi ý theo rule.";
                }
            } catch (Exception ex) {
                log.warn("AI suggestion call failed for board {}: {}", boardId, ex.getMessage());
                fallbackReason = "Gọi AI thất bại, hệ thống chuyển sang gợi ý theo rule.";
            }
        } else if (!aiAssistantConfig.isEnabled()) {
            fallbackReason = "AI assistant đang bị tắt trong cấu hình.";
        } else if (!aiConfigured) {
            fallbackReason = "Thiếu AI API key. Hãy cấu hình GROQ_API_KEY (hoặc AI_API_KEY) để bật AI tư vấn.";
        }

        return AiBoardSuggestionDto.builder()
                .boardName(board.getName())
                .aiConfigured(aiConfigured)
                .aiUsed(aiUsed)
                .provider(aiAssistantConfig.getProvider())
                .model(aiAssistantConfig.getModel())
                .generatedAt(Instant.now().toString())
                .summary(summary)
                .nextActions(nextActions)
                .fallbackReason(fallbackReason)
                .priorities(priorities)
                .risks(risks)
                .assignments(assignments)
                .build();
    }

    private List<CardEntity> fetchCardsWithAllDetails(Long boardId) {
        // Step 1: Fetch cards with members
        List<CardEntity> cards = cardRepository.findByBoardIdWithMembers(boardId);
        if (cards.isEmpty()) return cards;
        
        // Step 2: Fetch labels (Hibernate will merge into existing cards)
        cardRepository.findByBoardIdWithLabels(boardId);
        
        // Step 3: Fetch comments
        cardRepository.findByBoardIdWithComments(boardId);
        
        // Step 4: Fetch checklists
        cardRepository.findByBoardIdWithChecklists(boardId);
        
        return cards;
    }

    public AiBoardChatResponseDto answerBoardQuestion(
            Long boardId,
            Long currentUserId,
            AiBoardChatRequestDto request
    ) {
        if (!authzService.isBoardMember(currentUserId, boardId)) {
            throw new AccessDeniedException("Chỉ thành viên board mới được chat với AI");
        }

        BoardEntity board = boardRepository.findById(boardId)
                .orElseThrow(() -> new NotFoundException("Board not found with id: " + boardId));

        List<BoardMemberEntity> activeMembers = boardMemberRepository.findActiveByBoardId(boardId);
        List<CardEntity> cards = fetchCardsWithAllDetails(boardId);

        Map<Long, Integer> workloadByUser = initializeWorkload(activeMembers, cards);
        List<CardInsight> insights = buildCardInsights(cards);

        List<AiBoardSuggestionDto.PriorityItem> priorities = buildPriorities(insights);
        List<AiBoardSuggestionDto.RiskItem> risks = buildRisks(insights);
        List<AiBoardSuggestionDto.AssignmentItem> assignments =
                buildAssignments(insights, activeMembers, workloadByUser);

        String ruleSummary = buildRuleSummary(board.getName(), cards.size(), priorities.size(), risks.size(), assignments.size());
        List<String> ruleActions = buildDefaultActions(priorities, risks, assignments);

        String question = request != null && request.getQuestion() != null
                ? request.getQuestion().trim()
                : "";

        Set<String> groundedTerms = collectGroundedTermsForChat(
                board.getName(),
                activeMembers,
                cards,
                priorities,
                risks,
                assignments
        );

        FallbackChatResult fallbackChatResult = buildFallbackChatAnswer(
                question,
                board.getName(),
                cards.size(),
                priorities,
                risks,
                assignments
        );

        String answer = fallbackChatResult.getAnswer();
        List<Long> referencedCardIds = fallbackChatResult.getReferencedCardIds();
        List<Long> referencedUserIds = fallbackChatResult.getReferencedUserIds();
        List<String> referencedListNames = fallbackChatResult.getReferencedListNames();
        List<AiBoardChatResponseDto.ActionCommandDto> actionCommands = new ArrayList<>();

        boolean aiConfigured = aiAssistantConfig.hasApiKey();
        boolean aiUsed = false;
        String fallbackReason = null;

        if (aiAssistantConfig.isReady()) {
            try {
                AiChatResult aiChatResult = requestAiChatAnswer(
                        board.getName(),
                        question,
                        request != null ? request.getHistory() : null,
                        activeMembers,
                        cards,
                        priorities,
                        risks,
                        assignments,
                        ruleSummary,
                        ruleActions
                );

                if (aiChatResult != null) {
                    GroundedChatResult groundedChatResult = applyGroundedChatResult(
                            aiChatResult,
                            groundedTerms,
                            activeMembers,
                            cards
                    );

                    if (groundedChatResult.isAccepted()) {
                        answer = groundedChatResult.getAnswer();
                        referencedCardIds = groundedChatResult.getReferencedCardIds();
                        referencedUserIds = groundedChatResult.getReferencedUserIds();
                        referencedListNames = groundedChatResult.getReferencedListNames();
                        aiUsed = true;

                        // Execute agentic actions
                        if (aiChatResult.getActionCommands() != null) {
                            for (ActionCommand cmd : aiChatResult.getActionCommands()) {
                                AiBoardChatResponseDto.ActionCommandDto dto = executeActionCommand(boardId, cmd);
                                actionCommands.add(dto);
                                if (dto.isExecuted()) {
                                    answer += "\n\n✅ " + dto.getResultMessage();
                                } else {
                                    answer += "\n\n❌ Lỗi khi thực hiện lệnh: " + dto.getResultMessage();
                                }
                            }
                        }

                        if (groundedChatResult.isPartiallyAccepted()) {
                            fallbackReason = "Phản hồi chat AI có tham chiếu chưa xác minh; hệ thống chỉ giữ tham chiếu bám dữ liệu.";
                        }
                    } else {
                        fallbackReason = "Phản hồi chat AI không bám dữ liệu thật của board, hệ thống chuyển sang câu trả lời theo rule.";
                    }
                } else {
                    fallbackReason = "AI không trả nội dung chat, hệ thống chuyển sang câu trả lời theo rule.";
                }
            } catch (Exception ex) {
                log.warn("AI chat call failed for board {}: {}", boardId, ex.getMessage());
                fallbackReason = "Gọi AI chat thất bại, hệ thống chuyển sang câu trả lời theo rule.";
            }
        } else if (!aiAssistantConfig.isEnabled()) {
            fallbackReason = "AI assistant đang bị tắt trong cấu hình.";
        } else if (!aiConfigured) {
            fallbackReason = "Thiếu AI API key. Hãy cấu hình GROQ_API_KEY (hoặc AI_API_KEY) để bật AI chat.";
        }

        return AiBoardChatResponseDto.builder()
                .boardName(board.getName())
                .aiConfigured(aiConfigured)
                .aiUsed(aiUsed)
                .provider(aiAssistantConfig.getProvider())
                .model(aiAssistantConfig.getModel())
                .generatedAt(Instant.now().toString())
                .answer(answer)
                .fallbackReason(fallbackReason)
                .referencedCardIds(referencedCardIds)
                .referencedUserIds(referencedUserIds)
                .referencedListNames(referencedListNames)
                .actionCommands(actionCommands)
                .build();
    }

    private Map<Long, Integer> initializeWorkload(List<BoardMemberEntity> members, List<CardEntity> cards) {
        Map<Long, Integer> workload = new LinkedHashMap<>();

        for (BoardMemberEntity member : members) {
            User user = member.getUser();
            if (user != null && user.getId() != null) {
                workload.put(user.getId(), 0);
            }
        }

        for (CardEntity card : cards) {
            if (card.getMembers() == null) {
                continue;
            }

            for (CardMemberEntity cardMember : card.getMembers()) {
                if (cardMember.getUser() == null || cardMember.getUser().getId() == null) {
                    continue;
                }

                Long userId = cardMember.getUser().getId();
                Integer current = workload.containsKey(userId) ? workload.get(userId) : 0;
                workload.put(userId, current + 1);
            }
        }

        return workload;
    }

    private List<CardInsight> buildCardInsights(List<CardEntity> cards) {
        List<CardInsight> insights = new ArrayList<>();

        for (CardEntity card : cards) {
            insights.add(evaluateCard(card));
        }

        return insights;
    }

    private CardInsight evaluateCard(CardEntity card) {
        Instant now = Instant.now();
        String listName = card.getList() != null ? card.getList().getName() : "Unknown";
        boolean doneCard = isDoneListName(listName);
        int assigneeCount = card.getMembers() == null ? 0 : card.getMembers().size();
        boolean noAssignee = assigneeCount == 0;

        int priorityScore = 0;
        int riskScore = 0;
        List<String> reasons = new ArrayList<>();

        Instant dueDate = card.getDate();
        if (!doneCard && dueDate != null) {
            if (dueDate.isBefore(now)) {
                priorityScore += 3;
                riskScore += 3;
                reasons.add("Quá hạn");
            } else if (dueDate.isBefore(now.plus(24, ChronoUnit.HOURS))) {
                priorityScore += 3;
                riskScore += 2;
                reasons.add("Đến hạn trong 24 giờ");
            }
        }

        if (!doneCard && noAssignee) {
            priorityScore += 2;
            riskScore += 2;
            reasons.add("Chưa có người phụ trách");
        }

        Instant updatedAt = card.getUpdatedAt();
        if (!doneCard && updatedAt != null && updatedAt.isBefore(now.minus(72, ChronoUnit.HOURS))) {
            priorityScore += 1;
            riskScore += 2;
            reasons.add("Không cập nhật hơn 3 ngày");
        }

        if (doneCard) {
            priorityScore = Math.max(0, priorityScore - 2);
            riskScore = Math.max(0, riskScore - 1);
        }

        if (reasons.isEmpty()) {
            reasons.add(doneCard ? "Đã ở danh sách hoàn thành" : "Chưa có tín hiệu rủi ro mạnh");
        }

        return new CardInsight(card, listName, priorityScore, riskScore, reasons, noAssignee, assigneeCount, dueDate, doneCard);
    }

    private List<AiBoardSuggestionDto.PriorityItem> buildPriorities(List<CardInsight> insights) {
        List<CardInsight> candidates = new ArrayList<>();
        for (CardInsight insight : insights) {
            if (!insight.isDoneCard() && insight.getPriorityScore() > 0) {
                candidates.add(insight);
            }
        }

        Collections.sort(candidates, new Comparator<CardInsight>() {
            @Override
            public int compare(CardInsight a, CardInsight b) {
                int byPriority = Integer.compare(b.getPriorityScore(), a.getPriorityScore());
                if (byPriority != 0) {
                    return byPriority;
                }
                return Integer.compare(b.getRiskScore(), a.getRiskScore());
            }
        });

        List<AiBoardSuggestionDto.PriorityItem> result = new ArrayList<>();
        for (CardInsight insight : candidates) {
            if (result.size() >= MAX_ITEMS) {
                break;
            }

            result.add(AiBoardSuggestionDto.PriorityItem.builder()
                    .cardId(insight.getCard().getId())
                    .cardTitle(insight.getCard().getTitle())
                    .listName(insight.getListName())
                    .score(insight.getPriorityScore())
                    .reason(joinReasons(insight.getReasons()))
                    .dueDate(insight.getDueDate() != null ? insight.getDueDate().toString() : null)
                    .assigneeCount(insight.getAssigneeCount())
                    .build());
        }

        return result;
    }

    private List<AiBoardSuggestionDto.RiskItem> buildRisks(List<CardInsight> insights) {
        List<CardInsight> candidates = new ArrayList<>();
        for (CardInsight insight : insights) {
            if (!insight.isDoneCard() && insight.getRiskScore() > 0) {
                candidates.add(insight);
            }
        }

        Collections.sort(candidates, new Comparator<CardInsight>() {
            @Override
            public int compare(CardInsight a, CardInsight b) {
                int byRisk = Integer.compare(b.getRiskScore(), a.getRiskScore());
                if (byRisk != 0) {
                    return byRisk;
                }
                return Integer.compare(b.getPriorityScore(), a.getPriorityScore());
            }
        });

        List<AiBoardSuggestionDto.RiskItem> result = new ArrayList<>();
        for (CardInsight insight : candidates) {
            if (result.size() >= MAX_ITEMS) {
                break;
            }

            result.add(AiBoardSuggestionDto.RiskItem.builder()
                    .cardId(insight.getCard().getId())
                    .cardTitle(insight.getCard().getTitle())
                    .listName(insight.getListName())
                    .score(insight.getRiskScore())
                    .severity(toSeverity(insight.getRiskScore()))
                    .reason(joinReasons(insight.getReasons()))
                    .build());
        }

        return result;
    }

    private List<AiBoardSuggestionDto.AssignmentItem> buildAssignments(
            List<CardInsight> insights,
            List<BoardMemberEntity> activeMembers,
            Map<Long, Integer> workloadByUser
    ) {
        if (activeMembers == null || activeMembers.isEmpty()) {
            return Collections.emptyList();
        }

        List<CardInsight> candidates = new ArrayList<>();
        for (CardInsight insight : insights) {
            if (!insight.isDoneCard() && insight.isNoAssignee()) {
                candidates.add(insight);
            }
        }

        Collections.sort(candidates, new Comparator<CardInsight>() {
            @Override
            public int compare(CardInsight a, CardInsight b) {
                int byPriority = Integer.compare(b.getPriorityScore(), a.getPriorityScore());
                if (byPriority != 0) {
                    return byPriority;
                }
                return Integer.compare(b.getRiskScore(), a.getRiskScore());
            }
        });

        Map<Long, Integer> predictedLoad = new LinkedHashMap<>(workloadByUser);
        List<AiBoardSuggestionDto.AssignmentItem> result = new ArrayList<>();

        for (CardInsight insight : candidates) {
            if (result.size() >= MAX_ITEMS) {
                break;
            }

            BoardMemberEntity suggestedMember = pickLeastLoadedMember(activeMembers, predictedLoad);
            if (suggestedMember == null || suggestedMember.getUser() == null || suggestedMember.getUser().getId() == null) {
                continue;
            }

            Long userId = suggestedMember.getUser().getId();
            int currentLoad = predictedLoad.containsKey(userId) ? predictedLoad.get(userId) : 0;

            String displayName = suggestedMember.getUser().getFullName();
            if (displayName == null || displayName.trim().isEmpty()) {
                displayName = suggestedMember.getUser().getUsername();
            }

            String assignmentReason = "Chưa có người phụ trách";
            if (insight.getDueDate() != null && insight.getDueDate().isBefore(Instant.now().plus(24, ChronoUnit.HOURS))) {
                assignmentReason = assignmentReason + ", sắp đến hạn";
            }

            result.add(AiBoardSuggestionDto.AssignmentItem.builder()
                    .cardId(insight.getCard().getId())
                    .cardTitle(insight.getCard().getTitle())
                    .listName(insight.getListName())
                    .suggestedUserId(userId)
                    .suggestedUserName(displayName)
                    .currentLoad(currentLoad)
                    .reason(assignmentReason)
                    .build());

            predictedLoad.put(userId, currentLoad + 1);
        }

        return result;
    }

    private BoardMemberEntity pickLeastLoadedMember(List<BoardMemberEntity> members, Map<Long, Integer> workloadByUser) {
        BoardMemberEntity selected = null;
        int minLoad = Integer.MAX_VALUE;

        for (BoardMemberEntity member : members) {
            if (member.getUser() == null || member.getUser().getId() == null) {
                continue;
            }

            Long userId = member.getUser().getId();
            int load = workloadByUser.containsKey(userId) ? workloadByUser.get(userId) : 0;

            if (selected == null || load < minLoad) {
                selected = member;
                minLoad = load;
            }
        }

        return selected;
    }

    private String buildRuleSummary(
            String boardName,
            int totalCards,
            int priorityCount,
            int riskCount,
            int assignmentCount
    ) {
        if (totalCards == 0) {
            return "Chào bạn! Hiện tại board \"" + boardName + "\" chưa có thẻ công việc nào đâu. Bạn hãy thêm vài thẻ để mình có dữ liệu phân tích và tư vấn cho bạn nhé! 😊";
        }

        if (priorityCount == 0 && riskCount == 0 && assignmentCount == 0) {
            return "Board \"" + boardName + "\" hiện đang ở trạng thái khá ổn định với " + totalCards + " thẻ. Mình chưa thấy có vấn đề gì khẩn cấp hay rủi ro cao cần xử lý ngay lúc này. Bạn cứ duy trì tiến độ nhé!";
        }

        return String.format(
                Locale.ROOT,
                "Chào bạn! Mình đã xem qua board \"%s\" (%d thẻ). Hiện tại có %d việc cần ưu tiên, %d vấn đề rủi ro và %d gợi ý phân công để tối ưu công việc cho team bạn đấy.",
                boardName,
                totalCards,
                priorityCount,
                riskCount,
                assignmentCount
        );
    }

    private List<String> buildDefaultActions(
            List<AiBoardSuggestionDto.PriorityItem> priorities,
            List<AiBoardSuggestionDto.RiskItem> risks,
            List<AiBoardSuggestionDto.AssignmentItem> assignments
    ) {
        List<String> actions = new ArrayList<>();

        if (assignments != null && !assignments.isEmpty()) {
            AiBoardSuggestionDto.AssignmentItem a = assignments.get(0);
            actions.add("Phân công \"" + a.getCardTitle() + "\" cho " + a.getSuggestedUserName() + ".");
        }

        if (priorities != null && !priorities.isEmpty()) {
            AiBoardSuggestionDto.PriorityItem p = priorities.get(0);
            actions.add("Ưu tiên xử lý trước \"" + p.getCardTitle() + "\" trong list \"" + p.getListName() + "\".");
        }

        if (risks != null && !risks.isEmpty()) {
            AiBoardSuggestionDto.RiskItem r = risks.get(0);
            actions.add("Rà soát rủi ro ở thẻ \"" + r.getCardTitle() + "\" (" + r.getSeverity() + ").");
        }

        if (actions.isEmpty()) {
            actions.add("Tiếp tục theo dõi và cập nhật tiến độ các thẻ hiện tại.");
            actions.add("Trao đổi với team về kế hoạch cho các task tiếp theo.");
        }

        if (actions.size() > MAX_ITEMS) {
            return new ArrayList<>(actions.subList(0, MAX_ITEMS));
        }

        return actions;
    }

    private Set<String> collectGroundedTerms(
            String boardName,
            List<BoardMemberEntity> activeMembers,
            List<AiBoardSuggestionDto.PriorityItem> priorities,
            List<AiBoardSuggestionDto.RiskItem> risks,
            List<AiBoardSuggestionDto.AssignmentItem> assignments
    ) {
        Set<String> terms = new LinkedHashSet<>();

        addTerm(terms, boardName);

        if (activeMembers != null) {
            for (BoardMemberEntity member : activeMembers) {
                if (member == null || member.getUser() == null) {
                    continue;
                }
                addTerm(terms, member.getUser().getFullName());
                addTerm(terms, member.getUser().getUsername());
            }
        }

        if (priorities != null) {
            for (AiBoardSuggestionDto.PriorityItem priority : priorities) {
                if (priority == null) {
                    continue;
                }
                addTerm(terms, priority.getCardTitle());
                addTerm(terms, priority.getListName());
            }
        }

        if (risks != null) {
            for (AiBoardSuggestionDto.RiskItem risk : risks) {
                if (risk == null) {
                    continue;
                }
                addTerm(terms, risk.getCardTitle());
                addTerm(terms, risk.getListName());
            }
        }

        if (assignments != null) {
            for (AiBoardSuggestionDto.AssignmentItem assignment : assignments) {
                if (assignment == null) {
                    continue;
                }
                addTerm(terms, assignment.getCardTitle());
                addTerm(terms, assignment.getListName());
                addTerm(terms, assignment.getSuggestedUserName());
            }
        }

        return terms;
    }

    private GroundedNarrative applyGroundedNarrative(
            AiNarrativeResult aiNarrative,
            String fallbackSummary,
            List<String> fallbackActions,
            Set<String> groundedTerms
    ) {
        String summary = fallbackSummary;
        List<String> nextActions = new ArrayList<>(fallbackActions);
        boolean acceptedAny = false;
        boolean rejectedAny = false;

        String aiSummary = aiNarrative.getSummary();
        if (aiSummary != null && !aiSummary.trim().isEmpty()) {
            String trimmedSummary = aiSummary.trim();
            // REMOVED: areQuotedTermsPreserved check to allow AI to rephrase naturally.
            // We only check if AI is not hallucinating unknown terms.
            if (allQuotedTermsKnown(trimmedSummary, groundedTerms) && trimmedSummary.length() < 1000) {
                summary = trimmedSummary;
                acceptedAny = true;
            } else {
                rejectedAny = true;
            }
        }

        List<String> aiActions = aiNarrative.getNextActions();
        if (aiActions != null && !aiActions.isEmpty()) {
            List<String> validAiActions = new ArrayList<>();
            for (String action : aiActions) {
                if (action != null && !action.trim().isEmpty() && allQuotedTermsKnown(action.trim(), groundedTerms)) {
                    validAiActions.add(action.trim());
                }
            }

            if (!validAiActions.isEmpty()) {
                nextActions = validAiActions;
                acceptedAny = true;
            } else {
                rejectedAny = true;
            }
        }

        return new GroundedNarrative(summary, nextActions, acceptedAny, acceptedAny && rejectedAny);
    }

    private boolean isGroundedSummary(String candidate, String fallbackSummary, Set<String> groundedTerms) {
        if (candidate == null || candidate.trim().isEmpty()) {
            return false;
        }
        if (candidate.length() > 600) {
            return false;
        }
        // Allow AI to rephrase facts naturally; only enforce named-entity grounding, not exact number matching.
        if (!areQuotedTermsPreserved(candidate, fallbackSummary)) {
            return false;
        }
        return allQuotedTermsKnown(candidate, groundedTerms);
    }

    private boolean isGroundedAction(String candidate, String fallbackAction, Set<String> groundedTerms) {
        if (candidate == null || candidate.trim().isEmpty()) {
            return false;
        }
        if (candidate.length() > 220) {
            return false;
        }
        if (!areQuotedTermsPreserved(candidate, fallbackAction)) {
            return false;
        }
        if (!areReferencedTermsPreserved(candidate, fallbackAction, groundedTerms)) {
            return false;
        }
        return allQuotedTermsKnown(candidate, groundedTerms);
    }

    private boolean hasSameNumbers(String textA, String textB) {
        List<String> numbersA = extractNumbers(textA);
        List<String> numbersB = extractNumbers(textB);
        if (numbersA.size() != numbersB.size()) {
            return false;
        }

        for (int i = 0; i < numbersA.size(); i++) {
            if (!numbersA.get(i).equals(numbersB.get(i))) {
                return false;
            }
        }

        return true;
    }

    private List<String> extractNumbers(String text) {
        List<String> numbers = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            return numbers;
        }

        StringBuilder current = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (Character.isDigit(ch)) {
                current.append(ch);
            } else if (current.length() > 0) {
                numbers.add(current.toString());
                current.setLength(0);
            }
        }

        if (current.length() > 0) {
            numbers.add(current.toString());
        }

        return numbers;
    }

    private boolean areQuotedTermsPreserved(String candidate, String fallbackText) {
        List<String> requiredTerms = extractQuotedTerms(fallbackText);
        for (String required : requiredTerms) {
            if (!containsIgnoreCase(candidate, required)) {
                return false;
            }
        }
        return true;
    }

    private boolean areReferencedTermsPreserved(String candidate, String fallbackText, Set<String> groundedTerms) {
        if (groundedTerms == null || groundedTerms.isEmpty()) {
            return true;
        }

        for (String term : groundedTerms) {
            if (term == null || term.length() < 3) {
                continue;
            }

            if (containsIgnoreCase(fallbackText, term) && !containsIgnoreCase(candidate, term)) {
                return false;
            }
        }

        return true;
    }

    private boolean allQuotedTermsKnown(String text, Set<String> groundedTerms) {
        List<String> quotedTerms = extractQuotedTerms(text);
        for (String quoted : quotedTerms) {
            if (!termExistsIgnoreCase(groundedTerms, quoted)) {
                return false;
            }
        }
        return true;
    }

    private List<String> extractQuotedTerms(String text) {
        List<String> terms = new ArrayList<>();
        if (text == null || text.isEmpty()) {
            return terms;
        }

        int cursor = 0;
        while (cursor < text.length()) {
            int start = text.indexOf('"', cursor);
            if (start < 0) {
                break;
            }

            int end = text.indexOf('"', start + 1);
            if (end < 0) {
                break;
            }

            String candidate = text.substring(start + 1, end).trim();
            if (!candidate.isEmpty()) {
                terms.add(candidate);
            }
            cursor = end + 1;
        }

        return terms;
    }

    private boolean termExistsIgnoreCase(Set<String> terms, String value) {
        if (terms == null || terms.isEmpty() || value == null) {
            return false;
        }

        for (String term : terms) {
            if (term != null && term.equalsIgnoreCase(value)) {
                return true;
            }
        }

        return false;
    }

    private boolean containsIgnoreCase(String source, String target) {
        if (source == null || target == null) {
            return false;
        }
        return source.toLowerCase(Locale.ROOT).contains(target.toLowerCase(Locale.ROOT));
    }

    private void addTerm(Set<String> terms, String value) {
        if (terms == null || value == null) {
            return;
        }

        String normalized = value.trim();
        if (!normalized.isEmpty()) {
            terms.add(normalized);
        }
    }

    private Set<String> collectGroundedTermsForChat(
            String boardName,
            List<BoardMemberEntity> activeMembers,
            List<CardEntity> cards,
            List<AiBoardSuggestionDto.PriorityItem> priorities,
            List<AiBoardSuggestionDto.RiskItem> risks,
            List<AiBoardSuggestionDto.AssignmentItem> assignments
    ) {
        Set<String> terms = collectGroundedTerms(boardName, activeMembers, priorities, risks, assignments);

        if (cards != null) {
            for (CardEntity card : cards) {
                if (card == null) {
                    continue;
                }

                addTerm(terms, card.getTitle());
                addTerm(terms, card.getList() != null ? card.getList().getName() : null);
                if (card.getId() != null) {
                    addTerm(terms, String.valueOf(card.getId()));
                }

                if (card.getLabels() != null) {
                    for (var cardLabel : card.getLabels()) {
                        if (cardLabel.getLabel() != null && cardLabel.getLabel().getName() != null) {
                            addTerm(terms, cardLabel.getLabel().getName());
                        }
                    }
                }
                if (card.getComments() != null) {
                    for (var comment : card.getComments()) {
                        if (comment.getContent() != null && !comment.getContent().isBlank()) {
                            addTerm(terms, comment.getContent());
                        }
                    }
                }
            }
        }

        return terms;
    }

    private FallbackChatResult buildFallbackChatAnswer(
            String question,
            String boardName,
            int totalCards,
            List<AiBoardSuggestionDto.PriorityItem> priorities,
            List<AiBoardSuggestionDto.RiskItem> risks,
            List<AiBoardSuggestionDto.AssignmentItem> assignments
    ) {
        String normalizedQuestion = question == null ? "" : question.trim().toLowerCase(Locale.ROOT);

        List<String> parts = new ArrayList<>();
        List<Long> referencedCardIds = new ArrayList<>();
        List<Long> referencedUserIds = new ArrayList<>();
        List<String> referencedListNames = new ArrayList<>();

        boolean handledByKeyword = false;

        if (containsAny(normalizedQuestion, "ưu tiên", "uu tien", "priority")) {
            handledByKeyword = true;
            if (priorities == null || priorities.isEmpty()) {
                parts.add("Dựa trên dữ liệu board \"" + boardName + "\", hiện tại mình chưa thấy có thẻ nào có độ ưu tiên đặc biệt cao (như quá hạn hoặc chưa gán người). Bạn có thể tiếp tục theo dõi và cập nhật tiến độ các thẻ hiện tại nhé.");
            } else {
                AiBoardSuggestionDto.PriorityItem top = priorities.get(0);
                String priorityReason = top.getReason() == null || top.getReason().isBlank()
                        ? "chưa có tín hiệu rủi ro mạnh"
                        : top.getReason();
                parts.add("Trong board \"" + boardName + "\", thẻ cần được ưu tiên nhất lúc này là **\"" + top.getCardTitle() + "\"** (đang ở list \""
                        + top.getListName() + "\"). Lý do là: " + priorityReason + ".");
                addLongReference(referencedCardIds, top.getCardId());
                addStringReference(referencedListNames, top.getListName());
            }
        }

        if (containsAny(normalizedQuestion, "rủi ro", "rui ro", "risk")) {
            handledByKeyword = true;
            if (risks == null || risks.isEmpty()) {
                parts.add("Tin tốt là hiện tại mình chưa phát hiện rủi ro nào đáng lo ngại trên board cả. Team đang làm rất tốt!");
            } else {
                AiBoardSuggestionDto.RiskItem top = risks.get(0);
                String riskReason = top.getReason() == null || top.getReason().isBlank()
                        ? "chưa có mô tả chi tiết"
                        : top.getReason();
                parts.add("Có một vấn đề bạn nên lưu ý ở thẻ **\"" + top.getCardTitle() + "\"** (list \""
                        + top.getListName() + "\"). Thẻ này đang có mức rủi ro: " + top.getSeverity()
                        + " vì " + riskReason + ".");
                addLongReference(referencedCardIds, top.getCardId());
                addStringReference(referencedListNames, top.getListName());
            }
        }

        if (containsAny(normalizedQuestion, "phân công", "phan cong", "assign")) {
            handledByKeyword = true;
            if (assignments == null || assignments.isEmpty()) {
                parts.add("Hiện tại mình thấy các thẻ đều đã có người phụ trách hoặc khối lượng công việc của team đang khá cân bằng, chưa cần phân công thêm.");
            } else {
                AiBoardSuggestionDto.AssignmentItem top = assignments.get(0);
                String assignmentReason = top.getReason() == null || top.getReason().isBlank()
                        ? "khối lượng công việc hiện tại phù hợp"
                        : top.getReason();
                parts.add("Mình gợi ý bạn nên giao thẻ **\"" + top.getCardTitle() + "\"** cho **"
                        + top.getSuggestedUserName() + "**. Lý do: " + assignmentReason + ".");
                addLongReference(referencedCardIds, top.getCardId());
                addLongReference(referencedUserIds, top.getSuggestedUserId());
                addStringReference(referencedListNames, top.getListName());
            }
        }

        if (!handledByKeyword) {
            parts.add("Board \"" + boardName + "\" đang có " + totalCards + " thẻ công việc.");

            if (priorities != null && !priorities.isEmpty()) {
                AiBoardSuggestionDto.PriorityItem topPriority = priorities.get(0);
                parts.add("Việc quan trọng nhất hiện tại là: **\"" + topPriority.getCardTitle() + "\"**.");
                addLongReference(referencedCardIds, topPriority.getCardId());
                addStringReference(referencedListNames, topPriority.getListName());
            } else {
                parts.add("Hiện tại chưa có việc gì quá khẩn cấp, bạn có thể tập trung hoàn thành các task đang thực hiện.");
            }
        }

        return new FallbackChatResult(
                String.join(" ", parts),
                referencedCardIds,
                referencedUserIds,
                referencedListNames
        );
    }

    private boolean containsAny(String text, String... keywords) {
        if (text == null || keywords == null || keywords.length == 0) {
            return false;
        }

        for (String keyword : keywords) {
            if (keyword != null && !keyword.isBlank() && text.contains(keyword.toLowerCase(Locale.ROOT))) {
                return true;
            }
        }

        return false;
    }

    private void addLongReference(List<Long> values, Long value) {
        if (values == null || value == null) {
            return;
        }
        if (!values.contains(value)) {
            values.add(value);
        }
    }

    private void addStringReference(List<String> values, String value) {
        if (values == null || value == null || value.isBlank()) {
            return;
        }

        for (String existing : values) {
            if (existing != null && existing.equalsIgnoreCase(value)) {
                return;
            }
        }

        values.add(value);
    }

    private GroundedChatResult applyGroundedChatResult(
            AiChatResult aiChatResult,
            Set<String> groundedTerms,
            List<BoardMemberEntity> activeMembers,
            List<CardEntity> cards
    ) {
        if (aiChatResult == null || aiChatResult.getAnswer() == null) {
            return new GroundedChatResult(false, false, null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        String trimmedAnswer = aiChatResult.getAnswer().trim();
        if (trimmedAnswer.isEmpty() || trimmedAnswer.length() > 2000) {
            return new GroundedChatResult(false, false, null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        // Relaxed strict check to allow for smarter, more descriptive AI reasoning.
        // We still rely on the references verification below to ensure data grounding.
        /*
        if (!allQuotedTermsKnown(trimmedAnswer, groundedTerms)) {
            return new GroundedChatResult(false, false, null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }
        */

        Set<Long> validCardIds = new LinkedHashSet<>();
        Set<Long> validUserIds = new LinkedHashSet<>();
        Map<String, String> validListNameMap = new LinkedHashMap<>();

        if (cards != null) {
            for (CardEntity card : cards) {
                if (card == null) {
                    continue;
                }

                if (card.getId() != null) {
                    validCardIds.add(card.getId());
                }

                if (card.getList() != null && card.getList().getName() != null) {
                    String rawListName = card.getList().getName().trim();
                    if (!rawListName.isEmpty()) {
                        validListNameMap.put(rawListName.toLowerCase(Locale.ROOT), rawListName);
                    }
                }
            }
        }

        if (activeMembers != null) {
            for (BoardMemberEntity member : activeMembers) {
                if (member == null || member.getUser() == null || member.getUser().getId() == null) {
                    continue;
                }
                validUserIds.add(member.getUser().getId());
            }
        }

        boolean droppedReference = false;

        List<Long> acceptedCardIds = new ArrayList<>();
        if (aiChatResult.getReferencedCardIds() != null) {
            for (Long cardId : aiChatResult.getReferencedCardIds()) {
                if (cardId == null) {
                    continue;
                }
                if (validCardIds.contains(cardId)) {
                    addLongReference(acceptedCardIds, cardId);
                } else {
                    droppedReference = true;
                }
            }
        }

        List<Long> acceptedUserIds = new ArrayList<>();
        if (aiChatResult.getReferencedUserIds() != null) {
            for (Long userId : aiChatResult.getReferencedUserIds()) {
                if (userId == null) {
                    continue;
                }
                if (validUserIds.contains(userId)) {
                    addLongReference(acceptedUserIds, userId);
                } else {
                    droppedReference = true;
                }
            }
        }

        List<String> acceptedListNames = new ArrayList<>();
        if (aiChatResult.getReferencedListNames() != null) {
            for (String listName : aiChatResult.getReferencedListNames()) {
                if (listName == null || listName.isBlank()) {
                    continue;
                }

                String canonical = findCanonicalListName(listName, validListNameMap);
                if (canonical != null) {
                    addStringReference(acceptedListNames, canonical);
                } else {
                    droppedReference = true;
                }
            }
        }

        // STRICT VALIDATION: Reject nếu AI tham chiếu cardId nhưng KHÔNG có cardId nào hợp lệ
        if (aiChatResult.getReferencedCardIds() != null 
                && !aiChatResult.getReferencedCardIds().isEmpty() 
                && acceptedCardIds.isEmpty()) {
            log.warn("AI referenced invalid cardIds: {}. Falling back to rule-based answer.", 
                    aiChatResult.getReferencedCardIds());
            return new GroundedChatResult(false, false, null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        // STRICT VALIDATION: Reject nếu answer chứa pattern "thẻ [số]" hoặc "card [số]" với ID không hợp lệ
        if (containsInvalidCardIdPattern(trimmedAnswer, validCardIds)) {
            log.warn("AI answer contains invalid card ID patterns. Falling back to rule-based answer.");
            return new GroundedChatResult(false, false, null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        // STRICT VALIDATION: Reject nếu answer chứa list name không tồn tại
        if (containsInvalidListNamePattern(trimmedAnswer, validListNameMap)) {
            log.warn("AI answer contains invalid list name patterns. Falling back to rule-based answer.");
            return new GroundedChatResult(false, false, null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        // STRICT VALIDATION: Reject nếu AI hallucinate về dữ liệu không tồn tại
        if (containsHallucinatedClaims(trimmedAnswer, cards)) {
            log.warn("AI answer contains hallucinated claims about data. Falling back to rule-based answer.");
            return new GroundedChatResult(false, false, null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        // Reject nếu answer quá ngắn và không có reference hợp lệ
        if (droppedReference
                && acceptedCardIds.isEmpty()
                && acceptedUserIds.isEmpty()
                && acceptedListNames.isEmpty()
                && trimmedAnswer.length() < 20) {
            return new GroundedChatResult(false, false, null, Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }

        // Log warning nếu có một số reference không hợp lệ nhưng vẫn có valid references
        if (droppedReference) {
            log.warn("AI response partially accepted. Some references were invalid but answer has valid content.");
        }

        return new GroundedChatResult(
                true,
                droppedReference,
                trimmedAnswer,
                acceptedCardIds,
                acceptedUserIds,
                acceptedListNames
        );
    }

    /**
     * Kiểm tra xem answer có chứa pattern card ID không hợp lệ không.
     * Tìm pattern như "thẻ **46**", "card 123", "ID 456" và kiểm tra validity.
     * Trả về true nếu tìm thấy invalid ID → cần reject response.
     */
    private boolean containsInvalidCardIdPattern(String answer, Set<Long> validCardIds) {
        if (answer == null || answer.isEmpty()) {
            return false;
        }

        // Pattern để tìm: "thẻ **số**", "card **số**", "thẻ số", "ID số", etc.
        // Matches: "thẻ **46**", "thẻ 46", "card 123", "ID 456"
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "(thẻ|card)\\s+\\*\\*?(\\d+)\\*\\*?",
            java.util.regex.Pattern.CASE_INSENSITIVE
        );
        
        java.util.regex.Matcher matcher = pattern.matcher(answer);
        
        while (matcher.find()) {
            try {
                Long cardId = Long.parseLong(matcher.group(2));
                if (!validCardIds.contains(cardId)) {
                    log.warn("Found invalid card ID {} in AI answer: {}", cardId, matcher.group(0));
                    return true;  // Tìm thấy invalid ID → reject
                }
            } catch (NumberFormatException e) {
                // Ignore nếu không parse được
            }
        }
        
        return false;  // Không tìm thấy invalid ID → OK
    }

    /**
     * Kiểm tra xem answer có chứa list name không tồn tại không.
     * Tìm các common list names như "To Do", "In Progress", "Done" và kiểm tra với list thực tế.
     * Trả về true nếu tìm thấy list name không hợp lệ → cần reject response.
     */
    private boolean containsInvalidListNamePattern(String answer, Map<String, String> validListNameMap) {
        if (answer == null || answer.isEmpty() || validListNameMap == null || validListNameMap.isEmpty()) {
            return false;
        }

        // Danh sách các common list names mà AI hay hallucinate
        String[] commonListNames = {
            "To Do", "Todo", "TODO", 
            "In Progress", "In-Progress", "Doing", 
            "Done", "Completed", "Complete",
            "Backlog", "Review", "Testing", "QA"
        };

        for (String commonName : commonListNames) {
            // Check nếu answer có mention list name này
            if (containsIgnoreCase(answer, "list " + commonName) 
                    || containsIgnoreCase(answer, "danh sách " + commonName)
                    || containsIgnoreCase(answer, "trong " + commonName)) {
                
                // Kiểm tra xem list name này có tồn tại trong board không
                String normalized = commonName.trim().toLowerCase(Locale.ROOT);
                if (!validListNameMap.containsKey(normalized)) {
                    log.warn("Found invalid list name '{}' in AI answer. Valid lists: {}", 
                            commonName, validListNameMap.values());
                    return true;  // Tìm thấy invalid list name → reject
                }
            }
        }
        
        return false;  // Không tìm thấy invalid list name → OK
    }

    /**
     * Kiểm tra xem AI có hallucinate về dữ liệu không tồn tại không.
     * Detect các claims mơ hồ như "nhiều thảo luận", "quá hạn" khi dữ liệu không support.
     */
    private boolean containsHallucinatedClaims(String answer, List<CardEntity> cards) {
        if (answer == null || answer.isEmpty()) {
            return false;
        }

        String lowerAnswer = answer.toLowerCase(Locale.ROOT);

        // Check 1: AI nói "nhiều thảo luận" hoặc "có thảo luận" nhưng không có comment nào
        if (containsAny(lowerAnswer, "nhiều thảo luận", "có thảo luận", "thảo luận về", "bàn luận về")) {
            boolean hasAnyComments = false;
            if (cards != null) {
                for (CardEntity card : cards) {
                    if (card.getComments() != null && !card.getComments().isEmpty()) {
                        hasAnyComments = true;
                        break;
                    }
                }
            }
            if (!hasAnyComments) {
                log.warn("AI claims 'có thảo luận' but no cards have comments");
                return true;  // Hallucination detected
            }
        }

        // Check 2: AI nói "quá hạn" nhưng không có card nào quá hạn
        if (containsAny(lowerAnswer, "quá hạn", "qua hạn", "đã hết hạn")) {
            boolean hasOverdueCard = false;
            Instant now = Instant.now();
            if (cards != null) {
                for (CardEntity card : cards) {
                    if (card.getDate() != null && card.getDate().isBefore(now)) {
                        hasOverdueCard = true;
                        break;
                    }
                }
            }
            if (!hasOverdueCard) {
                log.warn("AI claims 'quá hạn' but no cards are actually overdue");
                return true;  // Hallucination detected
            }
        }

        // Check 3: AI nói "có mô tả quan trọng" nhưng description null/empty
        if (containsAny(lowerAnswer, "mô tả quan trọng", "mô tả chi tiết", "có mô tả")) {
            boolean hasAnyDescription = false;
            if (cards != null) {
                for (CardEntity card : cards) {
                    if (card.getDescription() != null && !card.getDescription().trim().isEmpty()) {
                        hasAnyDescription = true;
                        break;
                    }
                }
            }
            if (!hasAnyDescription) {
                log.warn("AI claims 'có mô tả' but no cards have description");
                return true;  // Hallucination detected
            }
        }

        return false;  // No hallucination detected
    }

    private String findCanonicalListName(String rawListName, Map<String, String> validListNameMap) {
        if (rawListName == null || validListNameMap == null || validListNameMap.isEmpty()) {
            return null;
        }

        String normalized = rawListName.trim().toLowerCase(Locale.ROOT);
        return validListNameMap.get(normalized);
    }

    private AiChatResult requestAiChatAnswer(
            String boardName,
            String question,
            List<AiBoardChatRequestDto.ChatMessage> history,
            List<BoardMemberEntity> members,
            List<CardEntity> cards,
            List<AiBoardSuggestionDto.PriorityItem> priorities,
            List<AiBoardSuggestionDto.RiskItem> risks,
            List<AiBoardSuggestionDto.AssignmentItem> assignments,
            String fallbackSummary,
            List<String> fallbackActions
    ) throws Exception {
        String systemPrompt = "Bạn là trợ lý phân tích board Kanban. "
                + "Bạn phải trả lời bằng tiếng Việt. "
                + "\n\n"
                + "NGUYÊN TẮC QUAN TRỌNG NHẤT - CHỈ NÓI VỀ DỮ LIỆU THỰC TẾ:\n"
                + "1. CHỈ được phân tích dựa trên dữ liệu CÓ TRONG JSON được cung cấp.\n"
                + "2. TUYỆT ĐỐI KHÔNG suy đoán, giả định, hoặc bịa đặt thông tin.\n"
                + "3. Nếu dữ liệu không có (null, empty, []), KHÔNG được nói về nó.\n"
                + "4. Nếu không chắc chắn, tốt hơn là KHÔNG NÓI.\n"
                + "\n"
                + "CÁC TRƯỜNG HỢP CỤ THỂ:\n"
                + "- Nếu comments: [] → KHÔNG được nói \"có nhiều thảo luận\"\n"
                + "- Nếu description: null → KHÔNG được nói \"có mô tả quan trọng\"\n"
                + "- Nếu dueDate: null → KHÔNG được nói \"quá hạn\" hoặc \"sắp đến hạn\"\n"
                + "- Nếu assigneeNames: [] → CHỈ nói \"chưa có người phụ trách\"\n"
                + "- Nếu labels: [] → KHÔNG được nói về nhãn\n"
                + "\n"
                + "QUY TẮC KHI NHẮC ĐẾN THẺ:\n"
                + "1. BẮT BUỘC dùng TÊN THẺ (title) thay vì ID số.\n"
                + "2. Format: **\"Tên thẻ\"** (không được viết **46**).\n"
                + "3. Chỉ tham chiếu thẻ có trong dữ liệu cards.\n"
                + "4. Đưa ID vào \"references.cardIds\".\n"
                + "\n"
                + "QUY TẮC KHI NHẮC ĐẾN LIST:\n"
                + "1. CHỈ dùng tên list có trong cards.listName.\n"
                + "2. KHÔNG bịa \"To Do\", \"In Progress\", \"Done\".\n"
                + "3. Dùng ĐÚNG tên list (ví dụ: \"111\", \"222\").\n"
                + "\n"
                + "QUY TẮC KHI PHÂN TÍCH:\n"
                + "1. Chỉ nói về thông tin CÓ TRONG dữ liệu.\n"
                + "2. Nếu dueDate có giá trị → so sánh với ngày hiện tại để xác định quá hạn.\n"
                + "3. Nếu comments có nội dung → đếm số lượng, KHÔNG suy luận nội dung.\n"
                + "4. Nếu description có text → mention có mô tả, KHÔNG diễn giải.\n"
                + "\n"
                + "VÍ DỤ ĐÚNG (dựa trên dữ liệu thực tế):\n"
                + "- \"Thẻ **\\\"Fix bug\\\"** đã quá hạn 2 ngày (dueDate: 2026-04-23, hôm nay: 2026-04-25)\"\n"
                + "- \"Thẻ **\\\"Task A\\\"** chưa có người phụ trách (assigneeNames: [])\"\n"
                + "- \"Thẻ **\\\"Task B\\\"** có 3 comments\"\n"
                + "\n"
                + "VÍ DỤ SAI (bịa đặt):\n"
                + "- \"Thẻ **46** cần ưu tiên\" ❌ (dùng ID)\n"
                + "- \"có nhiều thảo luận về lỗi\" ❌ (khi comments: [])\n"
                + "- \"quá hạn\" ❌ (khi dueDate: null)\n"
                + "- \"list To Do\" ❌ (khi không có list tên này)\n"
                + "\n"
                + "OUTPUT FORMAT:\n"
                + "BẠN PHẢI TRẢ LỜI DƯỚI DẠNG JSON:\n"
                + "{\n"
                + "  \"answer\": \"Câu trả lời dựa trên dữ liệu thực tế\",\n"
                + "  \"references\": {\n"
                + "    \"cardIds\": [123],\n"
                + "    \"userIds\": [],\n"
                + "    \"listNames\": [\"111\"]\n"
                + "  }\n"
                + "}\n"
                + "\n"
                + "Chỉ xuất ra JSON thuần túy, không bọc trong code block.";

        Map<String, Object> promptData = new LinkedHashMap<>();
        promptData.put("boardName", boardName);
        promptData.put("members", buildMemberSnapshot(members));
        promptData.put("cards", buildCardSnapshot(cards));
        promptData.put("priorities", priorities);
        promptData.put("risks", risks);
        promptData.put("assignments", assignments);
        promptData.put("fallbackSummary", fallbackSummary);
        promptData.put("fallbackActions", fallbackActions);

        String contextPrompt = "Board context (JSON, read-only): " + objectMapper.writeValueAsString(promptData);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", aiAssistantConfig.getModel());
        requestBody.put("temperature", aiAssistantConfig.getTemperature());
        requestBody.put("max_tokens", aiAssistantConfig.getMaxTokens());

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMessage = new LinkedHashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);
        messages.add(systemMessage);

        Map<String, String> contextMessage = new LinkedHashMap<>();
        contextMessage.put("role", "user");
        contextMessage.put("content", contextPrompt);
        messages.add(contextMessage);

        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 8);
            for (int i = start; i < history.size(); i++) {
                AiBoardChatRequestDto.ChatMessage chatMessage = history.get(i);
                if (chatMessage == null || chatMessage.getContent() == null || chatMessage.getContent().isBlank()) {
                    continue;
                }

                Map<String, String> historyMessage = new LinkedHashMap<>();
                historyMessage.put("role", normalizeChatRole(chatMessage.getRole()));
                historyMessage.put("content", chatMessage.getContent().trim());
                messages.add(historyMessage);
            }
        }

        Map<String, String> questionMessage = new LinkedHashMap<>();
        questionMessage.put("role", "user");
        questionMessage.put("content", "Current question: " + question);
        messages.add(questionMessage);

        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(aiAssistantConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<JsonNode> response = restTemplate.exchange(
                aiAssistantConfig.getChatCompletionsUrl(),
                HttpMethod.POST,
                entity,
                JsonNode.class
        );

        JsonNode body = response.getBody();
        if (body == null) {
            return null;
        }

        JsonNode contentNode = body.path("choices").path(0).path("message").path("content");
        if (contentNode.isMissingNode() || contentNode.isNull()) {
            return null;
        }

        String content = contentNode.isTextual() ? contentNode.asText() : contentNode.toString();
        if (content == null || content.trim().isEmpty()) {
            return null;
        }

        JsonNode aiJson = parseAiJsonContent(content);
        if (aiJson == null) {
            return null;
        }

        String answer = safeText(aiJson.path("answer"));
        if (answer == null || answer.trim().isEmpty()) {
            return null;
        }

        JsonNode referencesNode = aiJson.path("references");
        List<Long> referencedCardIds = readLongList(referencesNode.path("cardIds"));
        List<Long> referencedUserIds = readLongList(referencesNode.path("userIds"));
        List<String> referencedListNames = readStringList(referencesNode.path("listNames"));

        List<ActionCommand> actionCommands = new ArrayList<>();
        JsonNode actionsNode = aiJson.path("actionCommands");
        if (actionsNode.isArray()) {
            for (JsonNode actionNode : actionsNode) {
                String type = safeText(actionNode.path("type"));
                JsonNode payloadNode = actionNode.path("payload");
                if (type != null && payloadNode.isObject()) {
                    Map<String, Object> payload = objectMapper.convertValue(payloadNode, Map.class);
                    actionCommands.add(new ActionCommand(type, payload));
                }
            }
        }

        return new AiChatResult(answer.trim(), referencedCardIds, referencedUserIds, referencedListNames, actionCommands);
    }

    private List<Map<String, Object>> buildMemberSnapshot(List<BoardMemberEntity> members) {
        List<Map<String, Object>> snapshot = new ArrayList<>();

        if (members == null) {
            return snapshot;
        }

        for (BoardMemberEntity member : members) {
            if (member == null || member.getUser() == null || member.getUser().getId() == null) {
                continue;
            }

            Map<String, Object> memberData = new LinkedHashMap<>();
            memberData.put("id", member.getUser().getId());
            memberData.put("fullName", member.getUser().getFullName());
            memberData.put("username", member.getUser().getUsername());
            snapshot.add(memberData);
        }

        return snapshot;
    }

    private List<Map<String, Object>> buildCardSnapshot(List<CardEntity> cards) {
        List<Map<String, Object>> snapshot = new ArrayList<>();

        if (cards == null) {
            return snapshot;
        }

        for (CardEntity card : cards) {
            if (card == null || card.getId() == null) {
                continue;
            }

            Map<String, Object> cardData = new LinkedHashMap<>();
            cardData.put("id", card.getId());
            cardData.put("title", card.getTitle());
            cardData.put("listName", card.getList() != null ? card.getList().getName() : null);
            cardData.put("dueDate", card.getDate() != null ? card.getDate().toString() : null);

            cardData.put("description", card.getDescription());

            List<String> commentTexts = new ArrayList<>();
            if (card.getComments() != null) {
                for (var comment : card.getComments()) {
                    if (comment.getContent() != null && !comment.getContent().isBlank()) {
                        String author = comment.getUser() != null ? comment.getUser().getFullName() : "Unknown";
                        commentTexts.add(author + ": " + comment.getContent());
                    }
                }
            }
            cardData.put("comments", commentTexts);

            List<String> labelNames = new ArrayList<>();
            if (card.getLabels() != null) {
                for (var cardLabel : card.getLabels()) {
                    if (cardLabel.getLabel() != null && cardLabel.getLabel().getName() != null) {
                        labelNames.add(cardLabel.getLabel().getName());
                    }
                }
            }
            cardData.put("labels", labelNames);

            List<Long> assigneeIds = new ArrayList<>();
            List<String> assigneeNames = new ArrayList<>();

            if (card.getMembers() != null) {
                for (var cardMember : card.getMembers()) {
                    if (cardMember == null || cardMember.getUser() == null || cardMember.getUser().getId() == null) {
                        continue;
                    }

                    addLongReference(assigneeIds, cardMember.getUser().getId());

                    String displayName = cardMember.getUser().getFullName();
                    if (displayName == null || displayName.isBlank()) {
                        displayName = cardMember.getUser().getUsername();
                    }
                    addStringReference(assigneeNames, displayName);
                }
            }

            List<String> checklistTexts = new ArrayList<>();
            if (card.getChecklistItems() != null) {
                for (var item : card.getChecklistItems()) {
                    String status = item.isChecked() ? "[Done]" : "[Pending]";
                    checklistTexts.add(status + " " + item.getTitle());
                }
            }
            cardData.put("checklist", checklistTexts);

            cardData.put("assigneeIds", assigneeIds);
            cardData.put("assigneeNames", assigneeNames);
            snapshot.add(cardData);
        }

        return snapshot;
    }

    private String normalizeChatRole(String role) {
        if (role == null || role.isBlank()) {
            return "user";
        }

        String normalized = role.trim().toLowerCase(Locale.ROOT);
        if ("assistant".equals(normalized)) {
            return "assistant";
        }

        return "user";
    }

    private AiNarrativeResult requestAiNarrative(
            String boardName,
            int totalCards,
            List<BoardMemberEntity> members,
            List<AiBoardSuggestionDto.PriorityItem> priorities,
            List<AiBoardSuggestionDto.RiskItem> risks,
            List<AiBoardSuggestionDto.AssignmentItem> assignments,
            String fallbackSummary,
            List<String> fallbackActions
    ) throws Exception {
        String systemPrompt = "Bạn là một giám đốc dự án dày dạn kinh nghiệm và là trợ lý phân tích board thông minh. "
                + "Bạn phải trả lời bằng tiếng Việt. "
                + "Tất cả các phân tích của bạn phải dựa trên dữ liệu board thực tế được cung cấp. "
                + "Mục tiêu của bạn là tạo ra một bản tóm tắt sức khỏe của board thật thông minh, ngắn gọn và 3 bước hành động cụ thể. "
                + "Hãy phân tích dữ liệu một cách phản biện: xác định các điểm nghẽn lớn nhất, nêu bật sự mất cân bằng khối lượng công việc, gắn cờ các thẻ quá hạn hoặc chưa được phân công. "
                + "Sử dụng mô tả thẻ, bình luận, nhãn và danh sách kiểm tra (checklist) để hiểu sâu ngữ cảnh. Đừng chỉ lặp lại dữ liệu, hãy đưa ra nhận định tại sao một thẻ lại quan trọng hoặc đang bị kẹt. "
                + "Trả về DUY NHẤT mã JSON với đúng hai khóa: \"summary\" (chuỗi tóm tắt, tối đa 300 ký tự) và \"nextActions\" (mảng đúng 3 chuỗi hành động ngắn gọn, mỗi chuỗi tối đa 120 ký tự). "
                + "Chỉ xuất ra mã JSON thuần túy, không bọc trong dấu code block.";

        Map<String, Object> promptData = new LinkedHashMap<>();
        promptData.put("boardName", boardName);
        promptData.put("totalCards", totalCards);
        promptData.put("activeMemberCount", members != null ? members.size() : 0);
        promptData.put("memberNames", members != null ? members.stream()
                .filter(m -> m != null && m.getUser() != null)
                .map(m -> m.getUser().getFullName() != null && !m.getUser().getFullName().isBlank()
                        ? m.getUser().getFullName() : m.getUser().getUsername())
                .toList() : List.of());
        promptData.put("priorities", priorities);
        promptData.put("risks", risks);
        promptData.put("assignments", assignments);
        promptData.put("ruleBasedSummary", fallbackSummary);
        promptData.put("ruleBasedActions", fallbackActions);

        String userPrompt = "Analyze this board data and produce a smarter, more insightful summary and 3 actionable next steps in Vietnamese. "
                + "Focus on the most critical issues (overdue cards, unassigned high-priority items, workload imbalance). "
                + "Be specific — mention card titles and member names from the data. "
                + "Data: " + objectMapper.writeValueAsString(promptData);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", aiAssistantConfig.getModel());
        requestBody.put("temperature", aiAssistantConfig.getTemperature());
        requestBody.put("max_tokens", aiAssistantConfig.getMaxTokens());

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> systemMessage = new LinkedHashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);
        messages.add(systemMessage);

        Map<String, String> userMessage = new LinkedHashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", userPrompt);
        messages.add(userMessage);

        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(aiAssistantConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<JsonNode> response = restTemplate.exchange(
                aiAssistantConfig.getChatCompletionsUrl(),
                HttpMethod.POST,
                entity,
                JsonNode.class
        );

        JsonNode body = response.getBody();
        if (body == null) {
            return null;
        }

        JsonNode contentNode = body.path("choices").path(0).path("message").path("content");
        if (contentNode.isMissingNode() || contentNode.isNull()) {
            return null;
        }

        String content = contentNode.isTextual() ? contentNode.asText() : contentNode.toString();
        if (content == null || content.trim().isEmpty()) {
            return null;
        }

        JsonNode aiJson = parseAiJsonContent(content);
        if (aiJson == null) {
            return null;
        }
        String summary = safeText(aiJson.path("summary"));
        List<String> nextActions = readActionList(aiJson.path("nextActions"));

        if ((summary == null || summary.trim().isEmpty()) && nextActions.isEmpty()) {
            return null;
        }

        return new AiNarrativeResult(summary, nextActions);
    }

    private JsonNode parseAiJsonContent(String content) {
        if (content == null) {
            return null;
        }

        String trimmed = content.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.readTree(trimmed);
        } catch (Exception ignored) {
            // Continue with best-effort extraction.
        }

        String withoutFence = trimmed;
        if (withoutFence.startsWith("```")) {
            int firstLineEnd = withoutFence.indexOf('\n');
            if (firstLineEnd > 0) {
                withoutFence = withoutFence.substring(firstLineEnd + 1);
            }
            if (withoutFence.endsWith("```")) {
                withoutFence = withoutFence.substring(0, withoutFence.length() - 3);
            }
            withoutFence = withoutFence.trim();
        }

        int start = withoutFence.indexOf('{');
        int end = withoutFence.lastIndexOf('}');
        if (start < 0 || end <= start) {
            return null;
        }

        String jsonSegment = withoutFence.substring(start, end + 1);
        try {
            return objectMapper.readTree(jsonSegment);
        } catch (Exception ex) {
            log.warn("Could not parse AI JSON content: {}", ex.getMessage());
            return null;
        }
    }

    private List<String> readActionList(JsonNode actionsNode) {
        if (actionsNode == null || !actionsNode.isArray()) {
            return Collections.emptyList();
        }

        List<String> actions = new ArrayList<>();
        for (JsonNode node : actionsNode) {
            if (actions.size() >= MAX_ITEMS) {
                break;
            }
            String action = safeText(node);
            if (action != null && !action.trim().isEmpty()) {
                actions.add(action.trim());
            }
        }
        return actions;
    }

    private List<Long> readLongList(JsonNode valuesNode) {
        if (valuesNode == null || !valuesNode.isArray()) {
            return Collections.emptyList();
        }

        List<Long> values = new ArrayList<>();
        for (JsonNode node : valuesNode) {
            if (node == null || node.isNull()) {
                continue;
            }

            Long value = null;
            if (node.isNumber()) {
                value = node.asLong();
            } else if (node.isTextual()) {
                try {
                    value = Long.parseLong(node.asText().trim());
                } catch (Exception ignored) {
                    // Ignore invalid entry.
                }
            }

            if (value != null) {
                addLongReference(values, value);
            }
        }

        return values;
    }

    private List<String> readStringList(JsonNode valuesNode) {
        if (valuesNode == null || !valuesNode.isArray()) {
            return Collections.emptyList();
        }

        List<String> values = new ArrayList<>();
        for (JsonNode node : valuesNode) {
            String value = safeText(node);
            if (value == null || value.isBlank()) {
                continue;
            }
            addStringReference(values, value.trim());
        }

        return values;
    }

    private String safeText(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        return node.asText();
    }

    private String joinReasons(List<String> reasons) {
        if (reasons == null || reasons.isEmpty()) {
            return "";
        }
        return String.join("; ", reasons);
    }

    private String toSeverity(int riskScore) {
        if (riskScore >= 5) {
            return "HIGH";
        }
        if (riskScore >= 3) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private boolean isDoneListName(String listName) {
        if (listName == null) {
            return false;
        }

        String normalized = listName.trim().toLowerCase(Locale.ROOT);
        return normalized.contains("done")
                || normalized.contains("complete")
                || normalized.contains("completed")
                || normalized.contains("closed")
                || normalized.contains("archive");
    }

    private static class CardInsight {
        private final CardEntity card;
        private final String listName;
        private final int priorityScore;
        private final int riskScore;
        private final List<String> reasons;
        private final boolean noAssignee;
        private final int assigneeCount;
        private final Instant dueDate;
        private final boolean doneCard;

        private CardInsight(
                CardEntity card,
                String listName,
                int priorityScore,
                int riskScore,
                List<String> reasons,
                boolean noAssignee,
                int assigneeCount,
                Instant dueDate,
                boolean doneCard
        ) {
            this.card = card;
            this.listName = listName;
            this.priorityScore = priorityScore;
            this.riskScore = riskScore;
            this.reasons = reasons;
            this.noAssignee = noAssignee;
            this.assigneeCount = assigneeCount;
            this.dueDate = dueDate;
            this.doneCard = doneCard;
        }

        private CardEntity getCard() {
            return card;
        }

        private String getListName() {
            return listName;
        }

        private int getPriorityScore() {
            return priorityScore;
        }

        private int getRiskScore() {
            return riskScore;
        }

        private List<String> getReasons() {
            return reasons;
        }

        private boolean isNoAssignee() {
            return noAssignee;
        }

        private int getAssigneeCount() {
            return assigneeCount;
        }

        private Instant getDueDate() {
            return dueDate;
        }

        private boolean isDoneCard() {
            return doneCard;
        }
    }

    private static class AiNarrativeResult {
        private final String summary;
        private final List<String> nextActions;

        private AiNarrativeResult(String summary, List<String> nextActions) {
            this.summary = summary;
            this.nextActions = nextActions;
        }

        private String getSummary() {
            return summary;
        }

        private List<String> getNextActions() {
            return nextActions;
        }
    }

    private static class GroundedNarrative {
        private final String summary;
        private final List<String> nextActions;
        private final boolean aiContributionAccepted;
        private final boolean partiallyAccepted;

        private GroundedNarrative(
                String summary,
                List<String> nextActions,
                boolean aiContributionAccepted,
                boolean partiallyAccepted
        ) {
            this.summary = summary;
            this.nextActions = nextActions;
            this.aiContributionAccepted = aiContributionAccepted;
            this.partiallyAccepted = partiallyAccepted;
        }

        private String getSummary() {
            return summary;
        }

        private List<String> getNextActions() {
            return nextActions;
        }

        private boolean isAiContributionAccepted() {
            return aiContributionAccepted;
        }

        private boolean isPartiallyAccepted() {
            return partiallyAccepted;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    private static class AiChatResult {
        private String answer;
        private List<Long> referencedCardIds;
        private List<Long> referencedUserIds;
        private List<String> referencedListNames;
        private List<ActionCommand> actionCommands;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionCommand {
        private String type;
        private Map<String, Object> payload;
    }

    @Transactional
    protected AiBoardChatResponseDto.ActionCommandDto executeActionCommand(Long boardId, ActionCommand cmd) {
        AiBoardChatResponseDto.ActionCommandDto result = AiBoardChatResponseDto.ActionCommandDto.builder()
                .type(cmd.getType())
                .payload(cmd.getPayload())
                .executed(false)
                .build();

        try {
            if ("CREATE_CARD".equals(cmd.getType())) {
                Map<String, Object> payload = cmd.getPayload();
                if (payload == null) {
                    result.setResultMessage("Lệnh không chứa payload.");
                    return result;
                }
                String title = (String) payload.get("title");
                String description = (String) payload.get("description");
                String listName = (String) payload.get("listName");
                String assigneeUsername = (String) payload.get("assigneeUsername");

                if (title == null || title.isBlank()) {
                    result.setResultMessage("Thiếu tiêu đề thẻ");
                    return result;
                }

                if (assigneeUsername == null || assigneeUsername.isBlank()) {
                    result.setResultMessage("Tạo thẻ thất bại: Bắt buộc phải có người được giao. Bạn hãy cho AI biết cần giao cho ai nhé.");
                    return result;
                }

                // Find list
                Long laneId = null;
                List<vn.nguyenlong.taskmanager.scrumboard.entity.ListEntity> lists = listRepository.findByBoardIdOrderByCreatedAt(boardId);
                if (lists.isEmpty()) {
                    result.setResultMessage("Board chưa có danh sách nào để tạo thẻ");
                    return result;
                }
                
                if (listName != null && !listName.isBlank()) {
                    for (vn.nguyenlong.taskmanager.scrumboard.entity.ListEntity list : lists) {
                        if (list.getName().equalsIgnoreCase(listName.trim())) {
                            laneId = list.getId();
                            break;
                        }
                    }
                }
                if (laneId == null) {
                    laneId = lists.get(0).getId(); // Default to first list
                }

                List<Long> memberIds = new java.util.ArrayList<>();
                if (assigneeUsername != null && !assigneeUsername.isBlank()) {
                    userRepository.findByUsername(assigneeUsername)
                            .ifPresent(user -> memberIds.add(user.getId()));
                }

                CreateCardRequest req = CreateCardRequest.builder()
                        .title(title)
                        .description(description)
                        .laneId(laneId)
                        .memberIds(memberIds)
                        .build();

                CardDto createdCard = cardService.createCard(req);
                webSocketBroadcastService.broadcastCardCreated(boardId, createdCard.getId(), createdCard);
                
                result.setExecuted(true);
                result.setResultMessage("Đã tạo thẻ '" + title + "' thành công.");
            } else {
                result.setResultMessage("Loại lệnh không được hỗ trợ: " + cmd.getType());
            }
        } catch (Exception e) {
            log.error("Lỗi khi thực thi AI command", e);
            result.setResultMessage("Lỗi: " + e.getMessage());
        }

        return result;
    }

    private static class GroundedChatResult {
        private final boolean accepted;
        private final boolean partiallyAccepted;
        private final String answer;
        private final List<Long> referencedCardIds;
        private final List<Long> referencedUserIds;
        private final List<String> referencedListNames;

        private GroundedChatResult(
                boolean accepted,
                boolean partiallyAccepted,
                String answer,
                List<Long> referencedCardIds,
                List<Long> referencedUserIds,
                List<String> referencedListNames
        ) {
            this.accepted = accepted;
            this.partiallyAccepted = partiallyAccepted;
            this.answer = answer;
            this.referencedCardIds = referencedCardIds;
            this.referencedUserIds = referencedUserIds;
            this.referencedListNames = referencedListNames;
        }

        private boolean isAccepted() {
            return accepted;
        }

        private boolean isPartiallyAccepted() {
            return partiallyAccepted;
        }

        private String getAnswer() {
            return answer;
        }

        private List<Long> getReferencedCardIds() {
            return referencedCardIds;
        }

        private List<Long> getReferencedUserIds() {
            return referencedUserIds;
        }

        private List<String> getReferencedListNames() {
            return referencedListNames;
        }
    }

    private static class FallbackChatResult {
        private final String answer;
        private final List<Long> referencedCardIds;
        private final List<Long> referencedUserIds;
        private final List<String> referencedListNames;

        private FallbackChatResult(
                String answer,
                List<Long> referencedCardIds,
                List<Long> referencedUserIds,
                List<String> referencedListNames
        ) {
            this.answer = answer;
            this.referencedCardIds = referencedCardIds;
            this.referencedUserIds = referencedUserIds;
            this.referencedListNames = referencedListNames;
        }

        private String getAnswer() {
            return answer;
        }

        private List<Long> getReferencedCardIds() {
            return referencedCardIds;
        }

        private List<Long> getReferencedUserIds() {
            return referencedUserIds;
        }

        private List<String> getReferencedListNames() {
            return referencedListNames;
        }
    }
}
