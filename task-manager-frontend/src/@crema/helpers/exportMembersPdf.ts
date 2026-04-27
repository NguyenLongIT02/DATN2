import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TeamMember } from "@crema/services/PermissionService";

// ─────────────────────────────────────────────────────────────
// Helper: chuyển ký tự tiếng Việt có dấu → không dấu
// Đây là cách duy nhất để jsPDF (font Latin-1) hiển thị đúng
// ─────────────────────────────────────────────────────────────
const removeAccents = (str: string): string => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // xóa combining diacritical marks
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const ROLE_LABELS: Record<string, string> = {
  PM: "Project Manager",
  "Project Manager": "Project Manager",
  TEAM_LEAD: "Team Lead",
  "Team Lead": "Team Lead",
  MEMBER: "Member",
  Member: "Member",
};

const getRoleLabel = (role?: string) => (role ? ROLE_LABELS[role] || role : "Member");

// ─────────────────────────────────────────────────────────────
// Main export function
// ─────────────────────────────────────────────────────────────
export const exportMembersToPdf = (
  members: TeamMember[],
  boardName: string,
  boardId?: number
): void => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 18;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ── Nền trắng toàn trang ──
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // ── Font: Times (= Times New Roman) ──
  const FONT = "times";
  const FONT_BOLD = "bold";
  const FONT_NORMAL = "normal";

  // ─── HEADER ───────────────────────────────────────────────
  // Dải tiêu đề xanh nhạt
  doc.setFillColor(41, 98, 162); // xanh đậm chuyên nghiệp
  doc.rect(0, 0, PAGE_W, 44, "F");

  // Tiêu đề chính
  doc.setFont(FONT, FONT_BOLD);
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(
    removeAccents("DANH SACH THANH VIEN DU AN"),
    PAGE_W / 2,
    16,
    { align: "center" }
  );

  // Tên dự án + ngày xuất
  doc.setFont(FONT, FONT_NORMAL);
  doc.setFontSize(12);
  doc.setTextColor(200, 220, 255);
  const safeBoardName = removeAccents(boardName);
  doc.text(
    `Du an: ${safeBoardName}${boardId ? ` (ID: ${boardId})` : ""}`,
    MARGIN,
    27
  );
  doc.text(
    `Xuat ngay: ${new Date().toLocaleString("vi-VN")}  |  Tong so: ${members.length} thanh vien`,
    MARGIN,
    35
  );

  // ─── STATS BOXES ──────────────────────────────────────────
  const pmCount = members.filter((m) => m.role === "PM" || m.role === "Project Manager").length;
  const tlCount = members.filter((m) => m.role === "TEAM_LEAD" || m.role === "Team Lead").length;
  const memberCount = members.filter((m) => m.role === "MEMBER" || m.role === "Member").length;

  const statsY = 50;
  const boxH = 22;
  const gap = 5;
  const boxW = (CONTENT_W - gap * 2) / 3;

  const stats = [
    { label: "Project Manager", count: pmCount, fillR: 24, fillG: 144, fillB: 255 },
    { label: "Team Lead", count: tlCount, fillR: 39, fillG: 174, fillB: 96 },
    { label: "Member", count: memberCount, fillR: 230, fillG: 126, fillB: 34 },
  ];

  let bx = MARGIN;
  for (const s of stats) {
    // Box viền bo góc
    doc.setFillColor(s.fillR, s.fillG, s.fillB);
    doc.roundedRect(bx, statsY, boxW, boxH, 4, 4, "F");

    // Số lớn
    doc.setFont(FONT, FONT_BOLD);
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(String(s.count), bx + boxW / 2, statsY + 11, { align: "center" });

    // Nhãn nhỏ
    doc.setFont(FONT, FONT_NORMAL);
    doc.setFontSize(9);
    doc.text(s.label, bx + boxW / 2, statsY + 18, { align: "center" });

    bx += boxW + gap;
  }

  // ─── BẢNG THÀNH VIÊN ─────────────────────────────────────
  const tableRows = members.map((m, i) => [
    i + 1,
    removeAccents(m.name || "—"),
    m.email || "—",
    getRoleLabel(m.role),
    m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : "—",
  ]);

  autoTable(doc, {
    startY: statsY + boxH + 10,
    head: [["#", "Ho va ten", "Email", "Vai tro", "Ngay tham gia"]],
    body: tableRows,
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      font: FONT,
      fontSize: 12,
      textColor: [20, 20, 20],
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
      cellPadding: 4,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [41, 98, 162],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 12,
      halign: "center",
      font: FONT,
    },
    alternateRowStyles: {
      fillColor: [240, 245, 255],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12, fontStyle: "bold" },
      1: { cellWidth: 42, font: FONT },
      2: { cellWidth: 60, font: FONT },
      3: { halign: "center", cellWidth: 38, fontStyle: "bold" },
      4: { halign: "center", cellWidth: 28, font: FONT },
    },
    // Vẽ tag màu cho cột Vai trò
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const role = data.cell.raw as string;
        let r = 24, g = 144, b = 255;
        if (role === "Project Manager") { r = 24; g = 144; b = 255; }
        else if (role === "Team Lead")  { r = 39;  g = 174; b = 96; }
        else if (role === "Member")     { r = 230; g = 126; b = 34; }

        const { x, y, width, height } = data.cell;
        const tagW = width - 8;
        const tagH = height - 6;
        const tagX = x + 4;
        const tagY = y + 3;

        // Vẽ nền tag
        doc.setFillColor(r, g, b);
        doc.roundedRect(tagX, tagY, tagW, tagH, 2, 2, "F");

        // Chữ trắng in đậm
        doc.setFont(FONT, FONT_BOLD);
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(role, tagX + tagW / 2, tagY + tagH / 2 + 1, { align: "center" });
      }
    },
  });

  // ─── ĐƯỜNG KẺ PHÂN CÁCH & FOOTER ─────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Đường kẻ footer
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, 284, PAGE_W - MARGIN, 284);

    // Text footer
    doc.setFont(FONT, FONT_NORMAL);
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Task Manager - Bao cao thanh vien du an`,
      MARGIN,
      289
    );
    doc.text(
      `Trang ${i} / ${totalPages}`,
      PAGE_W - MARGIN,
      289,
      { align: "right" }
    );
  }

  // ─── LƯU FILE ─────────────────────────────────────────────
  const safeBoard = removeAccents(boardName).replace(/[^a-zA-Z0-9_\- ]/g, "_");
  doc.save(`thanh-vien_${safeBoard}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
