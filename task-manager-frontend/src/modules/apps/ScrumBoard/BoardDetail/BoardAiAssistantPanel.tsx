import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Input,
  List,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  MessageOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { getDataApi, postDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import type {
  AiBoardChatMessageDto,
  AiBoardChatResponseDto,
  AiBoardSuggestionDto,
  AiChatRole,
} from "@crema/types/models/apps/ScrumbBoard";

type BoardAiAssistantPanelProps = {
  boardId: number;
  boardName: string;
  mode?: 'fixed' | 'header';
};

const getSeverityColor = (severity?: string) => {
  if (!severity) {
    return "default";
  }

  const normalized = severity.trim().toUpperCase();
  if (normalized === "HIGH") {
    return "red";
  }
  if (normalized === "MEDIUM") {
    return "gold";
  }
  if (normalized === "LOW") {
    return "blue";
  }
  return "default";
};

type ChatMessage = {
  id: string;
  role: AiChatRole;
  content: string;
};

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const QUICK_QUESTIONS = [
  "Thẻ nào cần ưu tiên nhất hôm nay?",
  "Rủi ro lớn nhất hiện tại của board là gì?",
  "Nên phân công công việc nào trước?",
];

const BoardAiAssistantPanel: React.FC<BoardAiAssistantPanelProps> = ({
  boardId,
  boardName,
  mode = 'fixed',
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [open, setOpen] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [suggestion, setSuggestion] = useState<AiBoardSuggestionDto | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
    setLoadingSuggestion(false);
    setSendingQuestion(false);
    setError(null);
    setChatError(null);
    setQuestion("");
    setSuggestion(null);
    setMessages([]);
  }, [boardId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, sendingQuestion, open]);

  const loadSuggestions = async () => {
    setLoadingSuggestion(true);
    setError(null);

    try {
      const data = await getDataApi<AiBoardSuggestionDto>(
        `/scrumboard/board/${boardId}/ai-suggestions`,
        infoViewActionsContext,
        {},
        true
      );
      setSuggestion(data);
    } catch (apiError: unknown) {
      const errorMessage =
        typeof apiError === "object" &&
        apiError !== null &&
        "message" in apiError &&
        typeof (apiError as { message?: string }).message === "string"
          ? (apiError as { message: string }).message
          : "Không thể lấy tư vấn AI cho board này.";

      setError(errorMessage);
      setSuggestion(null);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const sendQuestion = async (inputQuestion?: string) => {
    const text = (inputQuestion ?? question).trim();
    if (!text || sendingQuestion) {
      return;
    }

    setChatError(null);

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
    };

    const previousMessages = [...messages, userMessage];
    setMessages(previousMessages);
    setQuestion("");
    setSendingQuestion(true);

    try {
      const history: AiBoardChatMessageDto[] = messages.map((item) => ({
        role: item.role,
        content: item.content,
      }));

      const response = await postDataApi<AiBoardChatResponseDto>(
        `/scrumboard/board/${boardId}/ai-chat`,
        infoViewActionsContext,
        {
          question: text,
          history,
        }
      );

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.answer,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (apiError: unknown) {
      const errorMessage =
        typeof apiError === "object" &&
        apiError !== null &&
        "message" in apiError &&
        typeof (apiError as { message?: string }).message === "string"
          ? (apiError as { message: string }).message
          : "Không thể gửi câu hỏi tới AI lúc này.";

      setChatError(errorMessage);
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            "Xin lỗi, mình chưa thể phản hồi ngay lúc này. Bạn thử lại sau vài giây nhé.",
        },
      ]);
    } finally {
      setSendingQuestion(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!suggestion && !loadingSuggestion) {
      void loadSuggestions();
    }
  };

  const handleAskQuickQuestion = (text: string) => {
    void sendQuestion(text);
  };

  const renderTrigger = () => {
    if (mode === 'header') {
      return (
        <Button
          type="text"
          icon={<MessageOutlined />}
          onClick={handleOpen}
          style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.05)' }}
        >
          AI Tư vấn
        </Button>
      );
    }

    return (
      <Button
        type="primary"
        shape="round"
        size="large"
        icon={<MessageOutlined />}
        onClick={handleOpen}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1400,
          height: 48,
          paddingInline: 18,
          boxShadow: "0 10px 24px rgba(24, 144, 255, 0.35)",
          border: "none",
        }}
      >
        AI tư vấn
      </Button>
    );
  };

  return (
    <>
      {renderTrigger()}

      <Drawer
        title={`AI trợ lý - ${boardName}`}
        width={500}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Button
            icon={<ReloadOutlined />}
            loading={loadingSuggestion}
            onClick={() => void loadSuggestions()}
          >
            Làm mới
          </Button>
        }
      >
        {loadingSuggestion ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <Spin tip="Đang phân tích board..." />
          </div>
        ) : null}

        {!loadingSuggestion && error ? (
          <Alert
            type="error"
            showIcon
            message="Không thể lấy tư vấn AI"
            description={error}
            action={
              <Button size="small" onClick={() => void loadSuggestions()}>
                Thử lại
              </Button>
            }
          />
        ) : null}

        {!loadingSuggestion && !error && !suggestion ? (
          <Empty description="Chưa có dữ liệu tư vấn" />
        ) : null}

        {!loadingSuggestion && suggestion ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div>
              <Typography.Title level={5}>Tổng quan</Typography.Title>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {suggestion.summary}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Title level={5}>Hành động tiếp theo</Typography.Title>
              <List
                size="small"
                bordered
                dataSource={suggestion.nextActions || []}
                locale={{ emptyText: "Không có hành động đề xuất." }}
                renderItem={(action, index) => (
                  <List.Item key={`${action}-${index}`}>
                    <Typography.Text>{`${index + 1}. ${action}`}</Typography.Text>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <Typography.Title level={5}>Ưu tiên</Typography.Title>
              <List
                size="small"
                bordered
                dataSource={suggestion.priorities || []}
                locale={{ emptyText: "Không có thẻ ưu tiên cao." }}
                renderItem={(item) => (
                  <List.Item key={`priority-${item.cardId}`}>
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{item.cardTitle}</Typography.Text>
                      <Typography.Text type="secondary">
                        List: {item.listName} | Điểm: {item.score}
                      </Typography.Text>
                      <Typography.Text>{item.reason}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <Typography.Title level={5}>Rủi ro</Typography.Title>
              <List
                size="small"
                bordered
                dataSource={suggestion.risks || []}
                locale={{ emptyText: "Không có rủi ro đáng chú ý." }}
                renderItem={(item) => (
                  <List.Item key={`risk-${item.cardId}`}>
                    <Space direction="vertical" size={0}>
                      <Space size={8}>
                        <Typography.Text strong>{item.cardTitle}</Typography.Text>
                        <Tag color={getSeverityColor(item.severity)}>
                          {item.severity}
                        </Tag>
                      </Space>
                      <Typography.Text type="secondary">
                        List: {item.listName} | Điểm: {item.score}
                      </Typography.Text>
                      <Typography.Text>{item.reason}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <Typography.Title level={5}>Gợi ý phân công</Typography.Title>
              <List
                size="small"
                bordered
                dataSource={suggestion.assignments || []}
                locale={{ emptyText: "Không có đề xuất phân công mới." }}
                renderItem={(item) => (
                  <List.Item key={`assignment-${item.cardId}`}>
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{item.cardTitle}</Typography.Text>
                      <Typography.Text type="secondary">
                        Gợi ý: {item.suggestedUserName} | Tải hiện tại: {item.currentLoad}
                      </Typography.Text>
                      <Typography.Text>{item.reason}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>
                Chat với AI
              </Typography.Title>

              <Space wrap size={8} style={{ marginBottom: 10 }}>
                {QUICK_QUESTIONS.map((quickQuestion) => (
                  <Button
                    key={quickQuestion}
                    size="small"
                    icon={<RobotOutlined />}
                    onClick={() => handleAskQuickQuestion(quickQuestion)}
                    disabled={sendingQuestion}
                  >
                    {quickQuestion}
                  </Button>
                ))}
              </Space>

              <div
                ref={chatContainerRef}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  backgroundColor: "#fafafa",
                  padding: 12,
                  minHeight: 180,
                  maxHeight: 340,
                  overflowY: "auto",
                }}
              >
                {messages.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Hãy hỏi AI về ưu tiên, rủi ro hoặc phân công của board này"
                  />
                ) : (
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    {messages.map((message) => {
                      const isUser = message.role === "user";

                      return (
                        <div
                          key={message.id}
                          style={{
                            display: "flex",
                            justifyContent: isUser ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "85%",
                              padding: "10px 12px",
                              borderRadius: 12,
                              whiteSpace: "pre-wrap",
                              backgroundColor: isUser ? "#dbeafe" : "#ffffff",
                              border: isUser
                                ? "1px solid #93c5fd"
                                : "1px solid #e5e7eb",
                            }}
                          >
                            <Typography.Text
                              strong={!isUser}
                              style={{ display: "block", marginBottom: 4 }}
                            >
                              {isUser ? "Bạn" : "AI"}
                            </Typography.Text>
                            <Typography.Text>{message.content}</Typography.Text>
                          </div>
                        </div>
                      );
                    })}

                    {sendingQuestion ? (
                      <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div
                          style={{
                            padding: "10px 12px",
                            borderRadius: 12,
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <Spin size="small" />
                          <Typography.Text style={{ marginLeft: 8 }}>
                            AI đang trả lời...
                          </Typography.Text>
                        </div>
                      </div>
                    ) : null}
                  </Space>
                )}
              </div>

              {chatError ? (
                <Alert
                  style={{ marginTop: 10 }}
                  type="error"
                  showIcon
                  message="Không gửi được câu hỏi"
                  description={chatError}
                />
              ) : null}

              <Space.Compact style={{ width: "100%", marginTop: 10 }}>
                <Input.TextArea
                  value={question}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  placeholder="Nhập câu hỏi của bạn... (ví dụ: Việc nào nên làm trước?)"
                  onChange={(event) => setQuestion(event.target.value)}
                  onPressEnter={(event) => {
                    if (!event.shiftKey) {
                      event.preventDefault();
                      void sendQuestion();
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={sendingQuestion}
                  onClick={() => void sendQuestion()}
                >
                  Gửi
                </Button>
              </Space.Compact>
            </div>
          </Space>
        ) : null}
      </Drawer>
    </>
  );
};

export default BoardAiAssistantPanel;