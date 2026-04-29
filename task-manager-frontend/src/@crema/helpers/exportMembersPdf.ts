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
      <tr>
        <td style="border:1px solid #000;padding:5px 8px;text-align:center;">${i + 1}</td>
        <td style="border:1px solid #000;padding:5px 8px;">${m.name || "—"}</td>
        <td style="border:1px solid #000;padding:5px 8px;">${m.email || "—"}</td>
        <td style="border:1px solid #000;padding:5px 8px;text-align:center;">${getRoleLabel(m.role)}</td>
        <td style="border:1px solid #000;padding:5px 8px;text-align:center;">
          ${m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("vi-VN") : "—"}
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div id="pdf-root" style="
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      color: #000;
      background: #fff;
      padding: 60px 70px;
      width: 794px;
      box-sizing: border-box;
      line-height: 1.5;
    ">
      <!-- Tiêu đề -->
      <h1 style="text-align:center;font-size:15pt;font-weight:bold;text-transform:uppercase;margin:0 0 4px 0;letter-spacing:0.5px;">
        Danh sách thành viên dự án
      </h1>
      <p style="text-align:center;font-size:13pt;font-style:italic;margin:0 0 20px 0;">
        Dự án: ${boardName}${boardId ? ` (ID: ${boardId})` : ""}
      </p>

      <!-- Thông tin chung -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12pt;">
        <tr>
          <td style="width:50%;padding:2px 0;"><strong>Ngày xuất:</strong> ${new Date().toLocaleString("vi-VN")}</td>
          <td style="width:50%;padding:2px 0;"><strong>Tổng số thành viên:</strong> ${members.length} người</td>
        </tr>
        <tr>
          <td style="padding:2px 0;"><strong>Project Manager:</strong> ${pmCount} người</td>
          <td style="padding:2px 0;"><strong>Team Lead:</strong> ${tlCount} người &nbsp;|&nbsp; <strong>Member:</strong> ${memberCount} người</td>
        </tr>
      </table>

      <hr style="border:none;border-top:1px solid #000;margin:12px 0 20px 0;" />

      <!-- Bảng thành viên -->
      <table style="width:100%;border-collapse:collapse;font-size:12pt;">
        <thead>
          <tr style="font-weight:bold;">
            <th style="border:1px solid #000;padding:6px 8px;text-align:center;width:36px;">STT</th>
            <th style="border:1px solid #000;padding:6px 8px;text-align:left;">Họ và tên</th>
            <th style="border:1px solid #000;padding:6px 8px;text-align:left;">Email</th>
            <th style="border:1px solid #000;padding:6px 8px;text-align:center;">Vai trò</th>
            <th style="border:1px solid #000;padding:6px 8px;text-align:center;">Ngày tham gia</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <!-- Ký tên -->
      <table style="width:100%;margin-top:40px;font-size:12pt;">
        <tr>
          <td style="width:50%;text-align:center;font-style:italic;">Người lập danh sách</td>
          <td style="width:50%;text-align:center;font-style:italic;">Project Manager</td>
        </tr>
        <tr>
          <td style="text-align:center;font-size:10pt;color:#555;">(Ký, ghi rõ họ tên)</td>
          <td style="text-align:center;font-size:10pt;color:#555;">(Ký, ghi rõ họ tên)</td>
        </tr>
      </table>
    </div>`;

  await renderHtmlToPdf(html, `danh-sach-thanh-vien_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Hàm chung: tạo hidden div → html2canvas → jsPDF
 * Tự động tìm điểm cắt trang an toàn (khoảng trắng giữa nội dung).
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

  // Render sang canvas (scale 2 = Retina quality)
  const canvas = await html2canvas(container.querySelector("#pdf-root") as HTMLElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  document.body.removeChild(container);

  // A4 dimensions in mm
  const PDF_W = 210;
  const PDF_H = 297;

  // 1 mm = bao nhiêu pixel trên canvas
  const pxPerMm = canvas.width / PDF_W;

  // Chiều cao trang theo pixel
  const pageHeightPx = Math.floor(PDF_H * pxPerMm);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Tổng chiều cao canvas tính theo mm
  const totalHeightMm = canvas.height / pxPerMm;

  if (totalHeightMm <= PDF_H) {
    // Vừa 1 trang
    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, PDF_W, totalHeightMm);
  } else {
    // Nhiều trang — tìm điểm cắt an toàn
    const ctx = canvas.getContext("2d")!;

    /**
     * Tìm hàng pixel "gần toàn trắng" gần nhất khi quét ngược từ targetY.
     * Trả về vị trí pixel an toàn để cắt.
     */
    const findSafeBreak = (targetY: number, searchRange: number = 80): number => {
      for (let y = targetY; y > Math.max(0, targetY - searchRange); y--) {
        const data = ctx.getImageData(0, y, canvas.width, 1).data;
        let isWhite = true;
        for (let i = 0; i < data.length; i += 4) {
          // Chấp nhận pixel sáng (>235 cho cả RGB)
          if (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235) {
            isWhite = false;
            break;
          }
        }
        if (isWhite) return y;
      }
      return targetY; // fallback
    };

    let pageStartPx = 0;
    let isFirst = true;

    while (pageStartPx < canvas.height) {
      const idealEndPx = pageStartPx + pageHeightPx;

      // Tìm điểm cắt an toàn (không cắt ngang chữ)
      const safeEndPx =
        idealEndPx >= canvas.height
          ? canvas.height
          : findSafeBreak(idealEndPx);

      const sliceHeightPx = safeEndPx - pageStartPx;
      const sliceHeightMm = sliceHeightPx / pxPerMm;

      // Tạo canvas con cho trang này
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;

      const sliceCtx = sliceCanvas.getContext("2d")!;
      // Nền trắng
      sliceCtx.fillStyle = "#ffffff";
      sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sliceCtx.drawImage(canvas, 0, pageStartPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

      if (!isFirst) doc.addPage();
      doc.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, PDF_W, sliceHeightMm);

      isFirst = false;
      pageStartPx = safeEndPx;
    }
  }

  doc.save(filename);
};

