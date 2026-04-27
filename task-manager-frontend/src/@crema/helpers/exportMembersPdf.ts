import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TeamMember } from "@crema/services/PermissionService";

// Mapping role display names
const ROLE_LABELS: Record<string, string> = {
  PM: "Project Manager",
  "Project Manager": "Project Manager",
  TEAM_LEAD: "Team Lead",
  "Team Lead": "Team Lead",
  MEMBER: "Member",
  Member: "Member",
};

const getRoleLabel = (role?: string) => (role ? ROLE_LABELS[role] || role : "Member");

/**
 * Xuất danh sách thành viên ra file PDF
 */
export const exportMembersToPdf = (
  members: TeamMember[],
  boardName: string,
  boardId?: number
): void => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const MARGIN = 15;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ── Header gradient background ──
  doc.setFillColor(102, 126, 234); // #667eea
  doc.rect(0, 0, PAGE_W, 48, "F");

  // ── Logo / icon text ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("DANH SÁCH THÀNH VIÊN DỰ ÁN", MARGIN, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(210, 220, 255);
  doc.text(`Dự án: ${boardName}${boardId ? ` (ID: ${boardId})` : ""}`, MARGIN, 30);
  doc.text(
    `Xuất ngày: ${new Date().toLocaleString("vi-VN")}  •  Tổng số: ${members.length} thành viên`,
    MARGIN,
    38
  );

  // ── Statistics bar ──
  const pmCount = members.filter(
    (m) => m.role === "PM" || m.role === "Project Manager"
  ).length;
  const tlCount = members.filter(
    (m) => m.role === "TEAM_LEAD" || m.role === "Team Lead"
  ).length;
  const memberCount = members.filter(
    (m) => m.role === "MEMBER" || m.role === "Member"
  ).length;

  const stats = [
    { label: "Project Manager", count: pmCount, color: [24, 144, 255] as [number, number, number] },
    { label: "Team Lead", count: tlCount, color: [82, 196, 26] as [number, number, number] },
    { label: "Member", count: memberCount, color: [250, 173, 20] as [number, number, number] },
  ];

  let statX = MARGIN;
  const statY = 54;
  const statW = CONTENT_W / stats.length;

  for (const s of stats) {
    doc.setFillColor(...s.color);
    doc.roundedRect(statX, statY, statW - 4, 20, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(String(s.count), statX + (statW - 4) / 2, statY + 9, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(s.label, statX + (statW - 4) / 2, statY + 15, { align: "center" });
    statX += statW;
  }

  // ── Member Table ──
  const tableRows = members.map((m, index) => [
    index + 1,
    m.name || "—",
    m.email || "—",
    getRoleLabel(m.role),
    m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : "—",
  ]);

  autoTable(doc, {
    startY: statY + 28,
    head: [["#", "Họ và tên", "Email", "Vai trò", "Ngày tham gia"]],
    body: tableRows,
    margin: { left: MARGIN, right: MARGIN },
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 255],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { cellWidth: 60 },
      3: { halign: "center", cellWidth: 35 },
      4: { halign: "center", cellWidth: 30 },
    },
    didDrawCell: (data) => {
      // Tô màu role
      if (data.section === "body" && data.column.index === 3) {
        const role = data.cell.raw as string;
        let r = 102, g = 126, b = 234;
        if (role === "Project Manager") { r = 24; g = 144; b = 255; }
        else if (role === "Team Lead") { r = 82; g = 196; b = 26; }
        else if (role === "Member") { r = 250; g = 173; b = 20; }

        const { x, y, width, height } = data.cell;
        doc.setFillColor(r, g, b, );
        doc.setTextColor(255, 255, 255);
        doc.roundedRect(x + 2, y + 2, width - 4, height - 4, 2, 2, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(role, x + width / 2, y + height / 2 + 1, { align: "center" });
      }
    },
  });

  // ── Footer ──
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, 282, PAGE_W - MARGIN, 282);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("Task Manager — Báo cáo thành viên dự án", MARGIN, 287);
    doc.text(`Trang ${i} / ${pageCount}`, PAGE_W - MARGIN, 287, { align: "right" });
  }

  // ── Save ──
  const safeName = boardName.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F]/g, "_");
  doc.save(`thanh-vien_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
