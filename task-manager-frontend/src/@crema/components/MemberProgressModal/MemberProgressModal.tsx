import React, { useEffect, useState } from "react";
import {
  Modal,
  Avatar,
  Tag,
  Progress,
  Spin,
  Empty,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider,
  Checkbox,
  Button,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UnorderedListOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { jwtAxios } from "@crema/services/auth/jwt-auth";
import { getRoleColor, getRoleDisplayName, getRoleIcon } from "@crema/helpers/roleUtils";
import { TeamMember } from "@crema/services/PermissionService";
import { renderHtmlToPdf } from "@crema/helpers/exportMembersPdf";


// ─────────────────────────── Types ───────────────────────────
interface ChecklistItem {
  id: number;
  title: string;
  checked: boolean;
}

interface CardProgress {
  id: number;
  title: string;
  listName: string;
  isDone: boolean; // true nếu nằm trong cột "hoàn thành"
  dueDate?: string;
  checkedList: ChecklistItem[];
  labels?: { id: number; name: string; color: string }[];
}

interface MemberProgressData {
  totalCards: number;
  todoCards: CardProgress[];
  inProgressCards: CardProgress[];
  doneCards: CardProgress[];
  otherCards: CardProgress[];
}

interface MemberProgressModalProps {
  visible: boolean;
  member: TeamMember | null;
  boardId?: number;
  boardName?: string;
  onClose: () => void;
}

// ─────────────────────────── Helpers ─────────────────────────
const TODO_KEYWORDS       = ["to do", "todo", "chua lam", "can lam", "chưa làm", "cần làm", "backlog"];
const IN_PROGRESS_KEYWORDS = ["in progress", "dang lam", "doing", "in_progress", "đang làm"];
const DONE_KEYWORDS       = ["done", "hoan thanh", "completed", "finish", "hoàn thành"];

const classifyCard = (listName: string): "todo" | "inprogress" | "done" | "other" => {
  const lower = listName.toLowerCase();
  if (DONE_KEYWORDS.some((k) => lower.includes(k))) return "done";
  if (IN_PROGRESS_KEYWORDS.some((k) => lower.includes(k))) return "inprogress";
  if (TODO_KEYWORDS.some((k) => lower.includes(k))) return "todo";
  return "other";
};

const getCheckedProgress = (items: ChecklistItem[]) => {
  if (!items || items.length === 0) return null;
  const done = items.filter((i) => i.checked).length;
  return { done, total: items.length, percent: Math.round((done / items.length) * 100) };
};

/** Chỉ tính quá hạn khi card CHƯA hoàn thành */
const isOverdue = (dueDate?: string, isDone?: boolean) => {
  if (!dueDate || isDone) return false;
  return new Date(dueDate) < new Date();
};

const CardItem: React.FC<{ card: CardProgress }> = ({ card }) => {
  const [expanded, setExpanded] = useState(false);
  const checkProgress = getCheckedProgress(card.checkedList);
  const overdue = isOverdue(card.dueDate, card.isDone);

  return (
    <div
      style={{
        padding: "12px 14px",
        marginBottom: 10,
        borderRadius: 8,
        border: "1px solid #e8e8e8",
        backgroundColor: "#fff",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 600, fontSize: 14, flex: 1, wordBreak: "break-word", color: "#222" }}>
          {card.title}
        </div>
        {overdue && (
          <Tooltip title="Quá hạn">
            <ExclamationCircleOutlined style={{ color: "#ff4d4f", marginLeft: 8, flexShrink: 0 }} />
          </Tooltip>
        )}
      </div>

      {/* Due date */}
      {card.dueDate && (
        <div style={{ fontSize: 12, color: overdue ? "#ff4d4f" : "#888", marginTop: 6 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(card.dueDate).toLocaleDateString("vi-VN")}
          {overdue && <span style={{ marginLeft: 6, fontWeight: 600 }}>— Quá hạn</span>}
        </div>
      )}

      {/* Checklist section */}
      {checkProgress && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              color: "#555",
              cursor: "pointer",
              userSelect: "none",
              marginBottom: 4,
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <span>
              <UnorderedListOutlined style={{ marginRight: 4 }} />
              Checklist ({checkProgress.done}/{checkProgress.total})
            </span>
            <span style={{ fontSize: 11, color: "#1890ff" }}>{expanded ? "Thu gọn ▲" : "Xem chi tiết ▼"}</span>
          </div>

          <Progress
            percent={checkProgress.percent}
            size="small"
            strokeColor={checkProgress.percent === 100 ? "#52c41a" : "#1890ff"}
            showInfo={false}
          />

          {expanded && (
            <div style={{ marginTop: 8, paddingLeft: 4 }}>
              {card.checkedList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "3px 0",
                    fontSize: 13,
                    color: item.checked ? "#888" : "#333",
                    textDecoration: item.checked ? "line-through" : "none",
                  }}
                >
                  <Checkbox checked={item.checked} disabled />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// ─────────────────────────── CardColumn ─────────────────────
interface ColumnProps {
  title: string;
  count: number;
  cards: CardProgress[];
}

const CardColumn: React.FC<ColumnProps> = ({ title, count, cards }) => (
  <div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 12,
        padding: "8px 12px",
        borderRadius: 6,
        backgroundColor: "#f5f5f5",
        border: "1px solid #ddd",
      }}
    >
      <span style={{ fontWeight: 700, color: "#333", fontSize: 14 }}>{title}</span>
      <Badge count={count} style={{ backgroundColor: "#888", marginLeft: 8 }} />
    </div>
    {cards.length === 0 ? (
      <div style={{ textAlign: "center", color: "#bbb", padding: "16px 0", fontSize: 13 }}>
        Không có công việc
      </div>
    ) : (
      cards.map((card) => <CardItem key={card.id} card={card} />)
    )}
  </div>
);

// ─────────────────────────── PDF Export (html2canvas) ──────────────────────
const exportProgressToPdf = async (
  member: TeamMember,
  progress: MemberProgressData,
  boardName: string
) => {
  const pct =
    progress.totalCards > 0
      ? Math.round((progress.doneCards.length / progress.totalCards) * 100)
      : 0;

  const roleLabel =
    member.role === "PM" || member.role === "Project Manager"
      ? "Project Manager"
      : member.role === "TEAM_LEAD" || member.role === "Team Lead"
      ? "Team Lead"
      : "Member";

  const renderCards = (cards: CardProgress[], sectionIndex: number) =>
    cards
      .map((card, cardIndex) => {
        const cp = getCheckedProgress(card.checkedList);
        const dueDateText = card.dueDate
          ? new Date(card.dueDate).toLocaleDateString("vi-VN")
          : "";
        const overdue = isOverdue(card.dueDate, card.isDone);

        const checklistItems = (card.checkedList || [])
          .map(
            (item) =>
              `<div style="margin:2px 0 2px 16px;font-size:12pt;">
                ${item.checked
                  ? `<span style="text-decoration:line-through;color:#555;">&check; ${item.title}</span>`
                  : `<span>&square; ${item.title}</span>`
                }
              </div>`
          )
          .join("");

        return `
          <div style="margin-bottom:12px;padding-left:16px;">
            <div style="font-weight:bold;font-size:13pt;">
              ${sectionIndex}.${cardIndex + 1}. ${card.title}
            </div>
            ${dueDateText
              ? `<div style="font-size:12pt;margin-top:2px;">
                  <em>Hạn chót:</em> ${dueDateText}
                  ${overdue ? `<strong style="color:#cc0000;"> — Quá hạn</strong>` : ""}
                </div>`
              : ""}
            ${cp
              ? `<div style="font-size:12pt;margin-top:4px;">
                  <em>Checklist (${cp.done}/${cp.total}):</em>
                  ${checklistItems}
                </div>`
              : ""}
          </div>`;
      })
      .join("");

  const sectionHtml = (title: string, cards: CardProgress[], index: number) => {
    if (cards.length === 0) return "";
    return `
      <div style="margin-bottom:18px;">
        <div style="font-size:13pt;font-weight:bold;text-decoration:underline;margin-bottom:6px;">
          ${title} (${cards.length} công việc)
        </div>
        ${renderCards(cards, index)}
      </div>`;
  };

  const html = `
    <div id="pdf-root" style="
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      color: #000;
      background: #fff;
      padding: 60px 70px;
      width: 794px;
      box-sizing: border-box;
      line-height: 1.6;
    ">
      <!-- Tiêu đề -->
      <h1 style="text-align:center;font-size:15pt;font-weight:bold;text-transform:uppercase;margin:0 0 4px 0;letter-spacing:0.5px;">
        Báo cáo tiến độ công việc
      </h1>
      <p style="text-align:center;font-size:13pt;font-style:italic;margin:0 0 20px 0;">
        Dự án: ${boardName}
      </p>


      <!-- Thông tin -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12pt;">
        <tr>
          <td style="width:50%;padding:2px 0;"><strong>Họ và tên:</strong> ${member.name}</td>
          <td style="width:50%;padding:2px 0;"><strong>Vai trò:</strong> ${roleLabel}</td>
        </tr>
        <tr>
          <td style="padding:2px 0;"><strong>Email:</strong> ${member.email || "—"}</td>
          <td style="padding:2px 0;"><strong>Ngày xuất:</strong> ${new Date().toLocaleString("vi-VN")}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:2px 0;">
            <strong>Tổng tiến độ:</strong>
            ${progress.totalCards} công việc —
            Chưa làm: ${progress.todoCards.length} |
            Đang làm: ${progress.inProgressCards.length} |
            Hoàn thành: ${progress.doneCards.length} (${pct}%)
          </td>
        </tr>
      </table>

      <hr style="border:none;border-top:1px solid #000;margin:12px 0 20px 0;" />

      ${sectionHtml("I. CHƯA LÀM", progress.todoCards, 1)}
      ${sectionHtml("II. ĐANG LÀM", progress.inProgressCards, 2)}
      ${sectionHtml("III. HOÀN THÀNH", progress.doneCards, 3)}
      ${progress.otherCards.length > 0 ? sectionHtml("IV. KHÁC", progress.otherCards, 4) : ""}

      <hr style="border:none;border-top:1px solid #000;margin:20px 0 16px 0;" />

      <!-- Ký tên -->
      <table style="width:100%;margin-top:24px;font-size:12pt;">
        <tr>
          <td style="width:50%;text-align:center;font-style:italic;">Người thực hiện</td>
          <td style="width:50%;text-align:center;font-style:italic;">Project Manager</td>
        </tr>
        <tr>
          <td style="text-align:center;font-size:10pt;color:#555;">(Ký, ghi rõ họ tên)</td>
          <td style="text-align:center;font-size:10pt;color:#555;">(Ký, ghi rõ họ tên)</td>
        </tr>
      </table>
    </div>`;

  const safeMember = member.name.replace(/\s+/g, "_");
  const safeBoard  = boardName.replace(/\s+/g, "_");
  await renderHtmlToPdf(
    html,
    `tien-do_${safeMember}_${safeBoard}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
};


// ─────────────────────────── Main Modal ──────────────────────
const MemberProgressModal: React.FC<MemberProgressModalProps> = ({
  visible,
  member,
  boardId,
  boardName,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<MemberProgressData | null>(null);

  useEffect(() => {
    if (!visible || !member || !boardId) return;
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, member, boardId]);

  const fetchProgress = async () => {
    if (!member || !boardId) return;
    setLoading(true);
    try {
      const response = await jwtAxios.get(`/scrumboard/board/${boardId}`);
      const boardData = response.data?.data;

      if (!boardData) {
        setProgress({ totalCards: 0, todoCards: [], inProgressCards: [], doneCards: [], otherCards: [] });
        return;
      }

      const allCards: CardProgress[] = [];
      for (const list of boardData.list || []) {
        const cls = classifyCard(list.name as string);
        for (const card of list.cards || []) {
          const isAssigned = (card.members || []).some((m: { id: number }) => m.id === member.id);
          if (isAssigned) {
            allCards.push({
              id: card.id,
              title: card.title,
              listName: list.name,
              isDone: cls === "done",
              dueDate: card.date,
              checkedList: card.checkedList || [],
              labels: card.label || [],
            });
          }
        }
      }

      const todoCards: CardProgress[] = [];
      const inProgressCards: CardProgress[] = [];
      const doneCards: CardProgress[] = [];
      const otherCards: CardProgress[] = [];

      for (const card of allCards) {
        const cls = classifyCard(card.listName);
        if (cls === "todo") todoCards.push(card);
        else if (cls === "inprogress") inProgressCards.push(card);
        else if (cls === "done") doneCards.push(card);
        else otherCards.push(card);
      }

      setProgress({ totalCards: allCards.length, todoCards, inProgressCards, doneCards, otherCards });
    } catch (err) {
      console.error("Failed to fetch member progress:", err);
      setProgress({ totalCards: 0, todoCards: [], inProgressCards: [], doneCards: [], otherCards: [] });
    } finally {
      setLoading(false);
    }
  };

  const overallPercent =
    progress && progress.totalCards > 0
      ? Math.round((progress.doneCards.length / progress.totalCards) * 100)
      : 0;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      title={null}
      style={{ top: 20 }}
      styles={{ body: { padding: 0 } }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "24px 28px 20px",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar
            src={member?.avatar}
            size={60}
            icon={<UserOutlined />}
            style={{ border: "3px solid rgba(255,255,255,0.5)", flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ color: "#fff", margin: 0, fontSize: 20 }}>{member?.name}</h2>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 }}>
              {member?.email}
            </div>
            <Tag style={{ marginTop: 6, border: "none" }} color={getRoleColor(member?.role || "")}>
              {getRoleIcon(member?.role || "")} {getRoleDisplayName(member?.role || "")}
            </Tag>
          </div>

          {/* Nút PDF */}
          {progress && progress.totalCards > 0 && (
            <Tooltip title="Xuất tiến độ ra PDF">
              <Button
                icon={<FilePdfOutlined />}
                onClick={async () => {
                  await exportProgressToPdf(member!, progress, boardName || `Board #${boardId}`);
                }}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  borderRadius: 20,
                }}
              >
                Xuất PDF
              </Button>
            </Tooltip>
          )}

          {/* Progress circle */}
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 4 }}>
              Tiến độ tổng thể
            </div>
            <Progress
              type="circle"
              percent={overallPercent}
              width={68}
              strokeColor="#52c41a"
              trailColor="rgba(255,255,255,0.2)"
              format={(p) => (
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{p}%</span>
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "20px 28px 24px", maxHeight: "72vh", overflowY: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 12, color: "#888" }}>Đang tải tiến độ...</div>
          </div>
        ) : !progress || progress.totalCards === 0 ? (
          <Empty
            description={
              <span>
                <b>{member?.name}</b> chưa được giao công việc nào trong dự án này
              </span>
            }
            style={{ padding: 40 }}
          />
        ) : (
          <>
            {/* Stats */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col xs={6}>
                <Statistic
                  title="Tổng công việc"
                  value={progress.totalCards}
                />
              </Col>
              <Col xs={6}>
                <Statistic
                  title="Chưa làm"
                  value={progress.todoCards.length}
                />
              </Col>
              <Col xs={6}>
                <Statistic
                  title="Đang làm"
                  value={progress.inProgressCards.length}
                />
              </Col>
              <Col xs={6}>
                <Statistic
                  title="Hoàn thành"
                  value={progress.doneCards.length}
                />
              </Col>
            </Row>

            <Divider style={{ margin: "0 0 18px 0" }} />

            {/* Columns */}
            <Row gutter={[20, 20]}>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Chưa làm"
                  count={progress.todoCards.length}
                  cards={progress.todoCards}
                />
              </Col>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Đang làm"
                  count={progress.inProgressCards.length}
                  cards={progress.inProgressCards}
                />
              </Col>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Hoàn thành"
                  count={progress.doneCards.length}
                  cards={progress.doneCards}
                />
              </Col>
              {progress.otherCards.length > 0 && (
                <Col xs={24}>
                  <CardColumn
                    title="Khác"
                    count={progress.otherCards.length}
                    cards={progress.otherCards}
                  />
                </Col>
              )}
            </Row>
          </>
        )}
      </div>
    </Modal>
  );
};

export default MemberProgressModal;
