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



// ─────────────────────────── CardItem ────────────────────────
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
        border: `1px solid ${overdue ? "#ffccc7" : "#e8e8e8"}`,
        backgroundColor: overdue ? "#fff2f0" : "#fafafa",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 600, fontSize: 14, flex: 1, wordBreak: "break-word" }}>
          {card.title}
        </div>
        {overdue && (
          <Tooltip title="Quá hạn">
            <ExclamationCircleOutlined style={{ color: "#ff4d4f", marginLeft: 8, flexShrink: 0 }} />
          </Tooltip>
        )}
      </div>

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {card.labels.map((label) => (
            <Tag
              key={label.id}
              style={{
                backgroundColor: label.color || "#d9d9d9",
                border: "none",
                color: "#fff",
                fontSize: 11,
                padding: "0 6px",
                borderRadius: 4,
              }}
            >
              {label.name}
            </Tag>
          ))}
        </div>
      )}

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
          {/* Header row: click để toggle */}
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

          {/* Progress bar */}
          <Progress
            percent={checkProgress.percent}
            size="small"
            strokeColor={checkProgress.percent === 100 ? "#52c41a" : "#1890ff"}
            showInfo={false}
          />

          {/* Checklist items */}
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
                    color: item.checked ? "#52c41a" : "#333",
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
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  cards: CardProgress[];
}

const CardColumn: React.FC<ColumnProps> = ({ title, icon, color, bgColor, cards }) => (
  <div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 12,
        padding: "8px 12px",
        borderRadius: 6,
        backgroundColor: bgColor,
        border: `1px solid ${color}40`,
      }}
    >
      <span style={{ color, marginRight: 8 }}>{icon}</span>
      <span style={{ fontWeight: 700, color, fontSize: 14 }}>{title}</span>
      <Badge count={cards.length} style={{ backgroundColor: color, marginLeft: 8 }} />
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

  const renderCards = (cards: CardProgress[]) =>
    cards
      .map((card) => {
        const cp = getCheckedProgress(card.checkedList);
        const dueDateText = card.dueDate
          ? new Date(card.dueDate).toLocaleDateString("vi-VN")
          : "";
        const overdue = isOverdue(card.dueDate, card.isDone);
        const labelsText = (card.labels || [])
          .map((l) => `<span style="border:1px solid #999;padding:1px 5px;border-radius:3px;margin-right:4px;font-size:11pt;">${l.name}</span>`)
          .join("");

        const checklistRows = (card.checkedList || [])
          .map(
            (item) =>
              `<tr>
                <td style="padding:2px 8px;border:none;font-size:11pt;">
                  ${item.checked ? "☑" : "☐"}
                  <span style="${item.checked ? "text-decoration:line-through;color:#888;" : ""}">${item.title}</span>
                </td>
              </tr>`
          )
          .join("");

        return `
          <tr>
            <td style="border:1px solid #bbb;padding:8px 10px;vertical-align:top;">
              <div style="font-weight:bold;font-size:13pt;margin-bottom:4px;">${card.title}</div>
              <div style="margin-bottom:4px;">${labelsText}</div>
              ${dueDateText ? `<div style="font-size:11pt;color:${overdue ? "#cc0000" : "#555"};">⏱ ${dueDateText}${overdue ? " — Quá hạn" : ""}</div>` : ""}
              ${cp ? `
                <div style="margin-top:6px;font-size:11pt;">
                  Checklist: ${cp.done}/${cp.total}
                  <table style="width:100%;margin-top:4px;">${checklistRows}</table>
                </div>` : ""}
            </td>
          </tr>`;
      })
      .join("");

  const sectionHtml = (title: string, cards: CardProgress[]) => {
    if (cards.length === 0) return "";
    return `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:14pt;font-weight:bold;border-bottom:2px solid #000;padding-bottom:4px;margin-bottom:8px;">
          ${title} (${cards.length})
        </h3>
        <table style="width:100%;border-collapse:collapse;">
          ${renderCards(cards)}
        </table>
      </div>`;
  };

  const html = `
    <div id="pdf-root" style="
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      color: #000;
      background: #fff;
      padding: 40px 50px;
      width: 740px;
      box-sizing: border-box;
    ">
      <h1 style="text-align:center;font-size:18pt;font-weight:bold;margin:0 0 6px 0;text-transform:uppercase;">
        Báo cáo tiến độ thành viên
      </h1>
      <p style="text-align:center;font-size:13pt;margin:0 0 4px 0;">
        Dự án: <strong>${boardName}</strong>
      </p>
      <p style="text-align:center;font-size:11pt;color:#555;margin:0 0 4px 0;">
        Thành viên: <strong>${member.name}</strong> &nbsp;|&nbsp; Email: ${member.email || "—"} &nbsp;|&nbsp; Vai trò: ${roleLabel}
      </p>
      <p style="text-align:center;font-size:11pt;color:#555;margin:0 0 20px 0;">
        Ngày xuất: ${new Date().toLocaleString("vi-VN")} &nbsp;|&nbsp; Hoàn thành: ${pct}%
      </p>

      <!-- Bảng thống kê -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="width:25%;border:1px solid #999;padding:8px;text-align:center;">
            <div style="font-size:18pt;font-weight:bold;">${progress.totalCards}</div>
            <div style="font-size:11pt;">Tổng công việc</div>
          </td>
          <td style="width:25%;border:1px solid #999;padding:8px;text-align:center;">
            <div style="font-size:18pt;font-weight:bold;">${progress.todoCards.length}</div>
            <div style="font-size:11pt;">Chưa làm</div>
          </td>
          <td style="width:25%;border:1px solid #999;padding:8px;text-align:center;">
            <div style="font-size:18pt;font-weight:bold;">${progress.inProgressCards.length}</div>
            <div style="font-size:11pt;">Đang làm</div>
          </td>
          <td style="width:25%;border:1px solid #999;padding:8px;text-align:center;">
            <div style="font-size:18pt;font-weight:bold;">${progress.doneCards.length}</div>
            <div style="font-size:11pt;">Hoàn thành</div>
          </td>
        </tr>
      </table>

      ${sectionHtml("I. CHƯA LÀM", progress.todoCards)}
      ${sectionHtml("II. ĐANG LÀM", progress.inProgressCards)}
      ${sectionHtml("III. HOÀN THÀNH", progress.doneCards)}
      ${progress.otherCards.length > 0 ? sectionHtml("IV. KHÁC", progress.otherCards) : ""}

      <p style="margin-top:30px;font-size:10pt;color:#666;text-align:center;">— Hết báo cáo —</p>
    </div>`;

  const safeMember = member.name.replace(/\s+/g, "_");
  const safeBoard  = boardName.replace(/\s+/g, "_");
  await renderHtmlToPdf(
    html,
    `tien-do_${safeMember}_${safeBoard}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
};

  // Nền trắng
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Header xanh
  doc.setFillColor(41, 98, 162);
  doc.rect(0, 0, PAGE_W, 46, "F");

  doc.setFont(FONT, "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("BAO CAO TIEN DO THANH VIEN", PAGE_W / 2, 14, { align: "center" });

  doc.setFont(FONT, "normal");
  doc.setFontSize(11);
  doc.setTextColor(200, 220, 255);
  doc.text(`Du an: ${removeAccents(boardName)}`, MARGIN, 24);
  doc.text(`Thanh vien: ${removeAccents(member.name)}  |  Email: ${member.email || ""}`, MARGIN, 31);
  const roleLabel =
    member.role === "PM" || member.role === "Project Manager"
      ? "Project Manager"
      : member.role === "TEAM_LEAD" || member.role === "Team Lead"
      ? "Team Lead"
      : "Member";
  doc.text(
    `Vai tro: ${roleLabel}  |  Ngay xuat: ${new Date().toLocaleDateString("vi-VN")}`,
    MARGIN,
    38
  );

  // Stats
  const statsY = 52;
  const cols4 = (PAGE_W - MARGIN * 2 - 9) / 4;
  const stats = [
    { label: "Tong", val: progress.totalCards, r: 41, g: 98, b: 162 },
    { label: "Chua lam", val: progress.todoCards.length, r: 230, g: 126, b: 34 },
    { label: "Dang lam", val: progress.inProgressCards.length, r: 41, g: 128, b: 185 },
    { label: "Hoan thanh", val: progress.doneCards.length, r: 39, g: 174, b: 96 },
  ];
  let sx = MARGIN;
  for (const s of stats) {
    doc.setFillColor(s.r, s.g, s.b);
    doc.roundedRect(sx, statsY, cols4, 20, 3, 3, "F");
    doc.setFont(FONT, "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(String(s.val), sx + cols4 / 2, statsY + 10, { align: "center" });
    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.text(s.label, sx + cols4 / 2, statsY + 17, { align: "center" });
    sx += cols4 + 3;
  }

  // Phần trăm hoàn thành
  const pct =
    progress.totalCards > 0
      ? Math.round((progress.doneCards.length / progress.totalCards) * 100)
      : 0;
  doc.setFont(FONT, "bold");
  doc.setFontSize(11);
  doc.setTextColor(39, 174, 96);
  doc.text(`Hoan thanh: ${pct}%`, PAGE_W - MARGIN, statsY + 10, { align: "right" });

  let currentY = statsY + 28;

  // Hàm vẽ bảng theo nhóm
  const renderSection = (title: string, cards: CardProgress[], color: [number, number, number]) => {
    if (cards.length === 0) return;

    // Section title
    doc.setFont(FONT, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...color);
    doc.text(`>> ${title} (${cards.length})`, MARGIN, currentY);
    currentY += 4;

    // Dòng kẻ màu
    doc.setDrawColor(...color);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, currentY, PAGE_W - MARGIN, currentY);
    currentY += 4;

    const rows = cards.map((card) => {
      const cp = getCheckedProgress(card.checkedList);
      const checklistText = cp ? `${cp.done}/${cp.total} muc` : "Khong co";
      const checklistItems = card.checkedList
        .map((item) => `  ${item.checked ? "[x]" : "[ ]"} ${removeAccents(item.title)}`)
        .join("\n");
      const dueDateText = card.dueDate
        ? new Date(card.dueDate).toLocaleDateString("vi-VN")
        : "—";
      const overdueText = isOverdue(card.dueDate, card.isDone) ? " (Qua han)" : "";
      const labelsText = (card.labels || []).map((l) => l.name).join(", ") || "—";

      return [
        removeAccents(card.title),
        labelsText,
        `${dueDateText}${overdueText}`,
        `${checklistText}${checklistItems ? "\n" + checklistItems : ""}`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Cong viec", "Nhan", "Han chot", "Checklist"]],
      body: rows,
      margin: { left: MARGIN, right: MARGIN },
      styles: {
        font: FONT,
        fontSize: 10,
        textColor: [20, 20, 20],
        lineColor: [210, 210, 210],
        lineWidth: 0.3,
        cellPadding: 3,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        fillColor: color,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
        font: FONT,
      },
      alternateRowStyles: { fillColor: [248, 250, 255] },
      bodyStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 28 },
        3: { cellWidth: 57 },
      },
      didParseCell: (data) => {
        // Tô đỏ cell ngày nếu quá hạn
        if (data.section === "body" && data.column.index === 2) {
          const raw = String(data.cell.raw || "");
          if (raw.includes("Qua han")) {
            data.cell.styles.textColor = [255, 77, 79];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // Sang trang nếu gần hết
    if (currentY > 260) {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      currentY = 15;
    }
  };

  renderSection("CHUA LAM", progress.todoCards, [230, 126, 34]);
  renderSection("DANG LAM", progress.inProgressCards, [41, 128, 185]);
  renderSection("HOAN THANH", progress.doneCards, [39, 174, 96]);
  if (progress.otherCards.length > 0) {
    renderSection("KHAC", progress.otherCards, [114, 46, 209]);
  }

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 284, PAGE_W - MARGIN, 284);
    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text("Task Manager - Bao cao tien do thanh vien", MARGIN, 289);
    doc.text(`Trang ${i} / ${totalPages}`, PAGE_W - MARGIN, 289, { align: "right" });
  }

  const safeBoard = removeAccents(boardName).replace(/\s+/g, "_");
  const safeMember = removeAccents(member.name).replace(/\s+/g, "_");
  doc.save(`tien-do_${safeMember}_${safeBoard}_${new Date().toISOString().slice(0, 10)}.pdf`);
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

            <Divider style={{ margin: "0 0 18px 0" }} />

            {/* Columns */}
            <Row gutter={[20, 20]}>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Chưa làm"
                  icon={<ClockCircleOutlined />}
                  color="#fa8c16"
                  bgColor="#fff7e6"
                  cards={progress.todoCards}
                />
              </Col>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Đang làm"
                  icon={<ExclamationCircleOutlined />}
                  color="#1890ff"
                  bgColor="#e6f7ff"
                  cards={progress.inProgressCards}
                />
              </Col>
              <Col xs={24} md={8}>
                <CardColumn
                  title="Hoàn thành"
                  icon={<CheckCircleOutlined />}
                  color="#52c41a"
                  bgColor="#f6ffed"
                  cards={progress.doneCards}
                />
              </Col>
              {progress.otherCards.length > 0 && (
                <Col xs={24}>
                  <CardColumn
                    title="Khác"
                    icon={<UnorderedListOutlined />}
                    color="#722ed1"
                    bgColor="#f9f0ff"
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
