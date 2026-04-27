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
  List,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { jwtAxios } from "@crema/services/auth/jwt-auth";
import { getRoleColor, getRoleDisplayName, getRoleIcon } from "@crema/helpers/roleUtils";
import { TeamMember } from "@crema/services/PermissionService";

// ──────────────────────────── Types ────────────────────────────
interface ChecklistItem {
  id: number;
  title: string;
  checked: boolean;
}

interface CardProgress {
  id: number;
  title: string;
  listName: string;
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

// ──────────────────────────── Helpers ────────────────────────────
const TODO_KEYWORDS = ["to do", "todo", "chưa làm", "cần làm"];
const IN_PROGRESS_KEYWORDS = ["in progress", "đang làm", "doing", "in_progress"];
const DONE_KEYWORDS = ["done", "hoàn thành", "completed", "finish"];

const classifyCard = (listName: string): "todo" | "inprogress" | "done" | "other" => {
  const lower = listName.toLowerCase();
  if (TODO_KEYWORDS.some((k) => lower.includes(k))) return "todo";
  if (IN_PROGRESS_KEYWORDS.some((k) => lower.includes(k))) return "inprogress";
  if (DONE_KEYWORDS.some((k) => lower.includes(k))) return "done";
  return "other";
};

const getCheckedProgress = (items: ChecklistItem[]) => {
  if (!items || items.length === 0) return null;
  const done = items.filter((i) => i.checked).length;
  return { done, total: items.length, percent: Math.round((done / items.length) * 100) };
};

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// ──────────────────────────── Sub-component: Card Item ────────────────────────────
const CardItem: React.FC<{ card: CardProgress }> = ({ card }) => {
  const checkProgress = getCheckedProgress(card.checkedList);
  const overdue = isOverdue(card.dueDate);

  return (
    <div
      style={{
        padding: "10px 14px",
        marginBottom: 8,
        borderRadius: 8,
        border: "1px solid #f0f0f0",
        backgroundColor: "#fafafa",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, marginBottom: 4, wordBreak: "break-word" }}>
            {card.title}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
            {card.labels?.map((label) => (
              <Tag
                key={label.id}
                style={{
                  backgroundColor: label.color || "#d9d9d9",
                  border: "none",
                  color: "#fff",
                  fontSize: 11,
                  padding: "0 6px",
                }}
              >
                {label.name}
              </Tag>
            ))}
          </div>
        </div>
        {overdue && (
          <Tooltip title="Quá hạn">
            <ExclamationCircleOutlined style={{ color: "#ff4d4f", marginLeft: 8, flexShrink: 0 }} />
          </Tooltip>
        )}
      </div>

      {card.dueDate && (
        <div style={{ fontSize: 12, color: overdue ? "#ff4d4f" : "#888", marginBottom: 6 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(card.dueDate).toLocaleDateString("vi-VN")}
        </div>
      )}

      {checkProgress && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 2 }}>
            <span>
              <UnorderedListOutlined style={{ marginRight: 4 }} />
              Checklist
            </span>
            <span>
              {checkProgress.done}/{checkProgress.total}
            </span>
          </div>
          <Progress
            percent={checkProgress.percent}
            size="small"
            strokeColor={checkProgress.percent === 100 ? "#52c41a" : "#1890ff"}
            showInfo={false}
          />
        </div>
      )}
    </div>
  );
};

// ──────────────────────────── Sub-component: Column ────────────────────────────
interface ColumnProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  cards: CardProgress[];
  emptyText?: string;
}

const CardColumn: React.FC<ColumnProps> = ({ title, icon, color, cards, emptyText }) => (
  <div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 12,
        padding: "8px 12px",
        borderRadius: 6,
        backgroundColor: color + "15",
        border: `1px solid ${color}30`,
      }}
    >
      <span style={{ color, marginRight: 8 }}>{icon}</span>
      <span style={{ fontWeight: 600, color, fontSize: 14 }}>{title}</span>
      <Badge
        count={cards.length}
        style={{ backgroundColor: color, marginLeft: 8 }}
      />
    </div>
    {cards.length === 0 ? (
      <div style={{ textAlign: "center", color: "#bbb", padding: "16px 0", fontSize: 13 }}>
        {emptyText || "Không có công việc"}
      </div>
    ) : (
      cards.map((card) => <CardItem key={card.id} card={card} />)
    )}
  </div>
);

// ──────────────────────────── Main Modal ────────────────────────────
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
      // Lấy toàn bộ board data, rồi lọc card theo memberId
      const response = await jwtAxios.get(`/scrumboard/board/${boardId}`);
      const boardData = response.data?.data;

      if (!boardData) {
        setProgress({ totalCards: 0, todoCards: [], inProgressCards: [], doneCards: [], otherCards: [] });
        return;
      }

      const allCards: CardProgress[] = [];
      for (const list of boardData.list || []) {
        for (const card of list.cards || []) {
          const isAssigned = (card.members || []).some(
            (m: { id: number }) => m.id === member.id
          );
          if (isAssigned) {
            allCards.push({
              id: card.id,
              title: card.title,
              listName: list.name,
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

      setProgress({
        totalCards: allCards.length,
        todoCards,
        inProgressCards,
        doneCards,
        otherCards,
      });
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
      width={860}
      title={null}
      style={{ top: 24 }}
      styles={{ body: { padding: 0 } }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "28px 32px 24px",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar
            src={member?.avatar}
            size={64}
            icon={<UserOutlined />}
            style={{ border: "3px solid rgba(255,255,255,0.5)", flexShrink: 0 }}
          />
          <div>
            <h2 style={{ color: "#fff", margin: 0, fontSize: 20 }}>{member?.name}</h2>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 }}>
              {member?.email}
            </div>
            <Tag
              style={{ marginTop: 6, border: "none" }}
              color={getRoleColor(member?.role || "")}
            >
              {getRoleIcon(member?.role || "")} {getRoleDisplayName(member?.role || "")}
            </Tag>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 }}>
              Tiến độ tổng thể
            </div>
            <Progress
              type="circle"
              percent={overallPercent}
              width={72}
              strokeColor="#52c41a"
              trailColor="rgba(255,255,255,0.2)"
              format={(p) => (
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{p}%</span>
              )}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 32px" }}>
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
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={6}>
                <Statistic
                  title="Tổng công việc"
                  value={progress.totalCards}
                  prefix={<UnorderedListOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={6}>
                <Statistic
                  title="Chưa làm"
                  value={progress.todoCards.length}
                  prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col xs={6}>
                <Statistic
                  title="Đang làm"
                  value={progress.inProgressCards.length}
                  prefix={<ExclamationCircleOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={6}>
                <Statistic
                  title="Hoàn thành"
                  value={progress.doneCards.length}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
            </Row>

            <Divider style={{ margin: "0 0 20px 0" }} />

            {/* Columns */}
            <Row gutter={[20, 20]}>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Chưa làm"
                  icon={<ClockCircleOutlined />}
                  color="#faad14"
                  cards={progress.todoCards}
                />
              </Col>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Đang làm"
                  icon={<ExclamationCircleOutlined />}
                  color="#1890ff"
                  cards={progress.inProgressCards}
                />
              </Col>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Hoàn thành"
                  icon={<CheckCircleOutlined />}
                  color="#52c41a"
                  cards={progress.doneCards}
                />
              </Col>
              {progress.otherCards.length > 0 && (
                <Col xs={24}>
                  <CardColumn
                    title="Khác"
                    icon={<UnorderedListOutlined />}
                    color="#722ed1"
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
