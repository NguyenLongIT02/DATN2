import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TeamMember } from "@crema/services/PermissionService";

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
 * Tạo HTML kiểu Word (trắng đen, có dấu tiếng Việt) → canvas → PDF
 */
export const exportMembersToPdf = async (
  members: TeamMember[],
  boardName: string,
  boardId?: number
): Promise<void> => {
  const pmCount     = members.filter((m) => m.role === "PM" || m.role === "Project Manager").length;
  const tlCount     = members.filter((m) => m.role === "TEAM_LEAD" || m.role === "Team Lead").length;
  const memberCount = members.filter((m) => m.role === "MEMBER" || m.role === "Member").length;

  const rows = members
    .map(
      (m, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f7f7f7"}">
        <td style="text-align:center;border:1px solid #ccc;padding:7px 5px;">${i + 1}</td>
        <td style="border:1px solid #ccc;padding:7px 10px;">${m.name || "—"}</td>
        <td style="border:1px solid #ccc;padding:7px 10px;">${m.email || "—"}</td>
        <td style="text-align:center;border:1px solid #ccc;padding:7px 10px;font-weight:bold;">${getRoleLabel(m.role)}</td>
        <td style="text-align:center;border:1px solid #ccc;padding:7px 10px;">
          ${m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : "—"}
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div id="pdf-root" style="
      font-family: 'Times New Roman', Times, serif;
      font-size: 14pt;
      color: #000;
      background: #fff;
      padding: 40px 50px;
      width: 740px;
      box-sizing: border-box;
    ">
      <!-- Tiêu đề -->
      <h1 style="text-align:center;font-size:18pt;font-weight:bold;margin:0 0 6px 0;text-transform:uppercase;">
        Danh sách thành viên dự án
      </h1>
      <p style="text-align:center;font-size:13pt;margin:0 0 4px 0;">
        Dự án: <strong>${boardName}${boardId ? ` (ID: ${boardId})` : ""}</strong>
      </p>
      <p style="text-align:center;font-size:11pt;color:#555;margin:0 0 20px 0;">
        Ngày xuất: ${new Date().toLocaleString("vi-VN")} &nbsp;|&nbsp; Tổng số: ${members.length} thành viên
      </p>

      <!-- Tóm tắt vai trò -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="width:33%;border:1px solid #aaa;padding:10px;text-align:center;">
            <div style="font-size:20pt;font-weight:bold;">${pmCount}</div>
            <div style="font-size:11pt;">Project Manager</div>
          </td>
          <td style="width:33%;border:1px solid #aaa;padding:10px;text-align:center;">
            <div style="font-size:20pt;font-weight:bold;">${tlCount}</div>
            <div style="font-size:11pt;">Team Lead</div>
          </td>
          <td style="width:33%;border:1px solid #aaa;padding:10px;text-align:center;">
            <div style="font-size:20pt;font-weight:bold;">${memberCount}</div>
            <div style="font-size:11pt;">Member</div>
          </td>
        </tr>
      </table>

      <!-- Bảng thành viên -->
      <table style="width:100%;border-collapse:collapse;font-size:13pt;">
        <thead>
          <tr style="background:#ddd;">
            <th style="border:1px solid #aaa;padding:8px 5px;width:40px;">#</th>
            <th style="border:1px solid #aaa;padding:8px 10px;text-align:left;">Họ và tên</th>
            <th style="border:1px solid #aaa;padding:8px 10px;text-align:left;">Email</th>
            <th style="border:1px solid #aaa;padding:8px 10px;">Vai trò</th>
            <th style="border:1px solid #aaa;padding:8px 10px;">Ngày tham gia</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <!-- Footer -->
      <p style="margin-top:30px;font-size:10pt;color:#666;text-align:center;">
        — Hết danh sách —
      </p>
    </div>`;

  await renderHtmlToPdf(html, `danh-sach-thanh-vien_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Hàm chung: tạo hidden div → html2canvas → jsPDF
 */
export const renderHtmlToPdf = async (html: string, filename: string): Promise<void> => {
  // Tạo container ẩn
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.zIndex = "-1";
  container.innerHTML = html;
  document.body.appendChild(container);

  // Chờ font load
  await document.fonts.ready;

  // Render sang canvas
  const canvas = await html2canvas(container.querySelector("#pdf-root") as HTMLElement, {
    scale: 2,          // độ phân giải x2
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  document.body.removeChild(container);

  // A4: 210 x 297 mm, 1mm = 2.835pt
  const PDF_W = 210;
  const PDF_H = 297;
  const imgW  = PDF_W;
  const imgH  = (canvas.height * imgW) / canvas.width;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Nếu nội dung vừa 1 trang
  if (imgH <= PDF_H) {
    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgW, imgH);
  } else {
    // Cắt thành nhiều trang
    let yOffset = 0;
    while (yOffset < imgH) {
      const sliceH = Math.min(PDF_H, imgH - yOffset);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width  = canvas.width;
      sliceCanvas.height = (sliceH / imgW) * canvas.width;

      const ctx = sliceCanvas.getContext("2d")!;
      ctx.drawImage(
        canvas,
        0, (yOffset / imgH) * canvas.height,
        canvas.width, sliceCanvas.height,
        0, 0,
        canvas.width, sliceCanvas.height
      );

      if (yOffset > 0) doc.addPage();
      doc.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, imgW, sliceH);
      yOffset += PDF_H;
    }
  }

  doc.save(filename);
};
