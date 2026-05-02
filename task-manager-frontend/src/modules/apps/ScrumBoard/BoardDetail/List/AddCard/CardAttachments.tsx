import React, { useState } from "react";
import { Upload, Button, message, List, Popconfirm } from "antd";
import { UploadOutlined, DeleteOutlined, PaperClipOutlined } from "@ant-design/icons";
import { jwtAxios } from "@crema/services/auth/jwt-auth";
import type { AttachmentObjType } from "@crema/types/models/apps/ScrumbBoard";
import { showOperationErrorNotification } from "@crema/helpers/NotificationHelper";

interface CardAttachmentsProps {
  cardId: number;
  attachments: AttachmentObjType[];
  onAddAttachment: (attachment: AttachmentObjType) => void;
  onDeleteAttachment: (attachmentId: number) => void;
  disabled?: boolean;
}

const CardAttachments: React.FC<CardAttachmentsProps> = ({
  cardId,
  attachments,
  onAddAttachment,
  onDeleteAttachment,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await jwtAxios.post(
        `/scrumboard/attachments/upload/${cardId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      const newAttachment = response.data?.data;
      if (newAttachment) {
        onAddAttachment(newAttachment);
        onSuccess("ok");
        message.success("Tải tệp lên thành công!");
      } else {
        throw new Error("Không nhận được dữ liệu phản hồi");
      }
    } catch (err: any) {
      console.error(err);
      onError(err);
      showOperationErrorNotification("tải tệp lên", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    try {
      await jwtAxios.delete(`/scrumboard/attachments/${attachmentId}`);
      onDeleteAttachment(attachmentId);
      message.success("Xóa tệp đính kèm thành công");
    } catch (err: any) {
      console.error(err);
      showOperationErrorNotification("xóa tệp đính kèm", err.message);
    }
  };

  const handleDownload = async (item: AttachmentObjType, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const normalizedPath = item.file.path.replace(/\\/g, '/');
      const filename = normalizedPath.split('/').pop() || '';
      
      const response = await jwtAxios.get(`/scrumboard/attachments/download/${encodeURIComponent(filename)}`, {
        responseType: 'blob'
      });
      
      // Tạo URL giả lập để trình duyệt tự động tải file về
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.file.name); // Sử dụng tên gốc của file
      document.body.appendChild(link);
      link.click();
      
      // Dọn dẹp memory
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Lỗi khi tải file:", error);
      message.error("Không thể xem hoặc tải tệp xuống! Vui lòng thử lại.");
    }
  };

  return (
    <div style={{ marginTop: 24, padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
        <PaperClipOutlined style={{ marginRight: 8 }} />
        Tệp đính kèm ({attachments?.length || 0})
      </h3>

      <div style={{ marginBottom: 16 }}>
        <Upload
          customRequest={customRequest}
          showUploadList={false}
          disabled={disabled || uploading}
        >
          <Button icon={<UploadOutlined />} loading={uploading} disabled={disabled || uploading}>
            Tải tệp lên
          </Button>
        </Upload>
      </div>

      {attachments && attachments.length > 0 && (
        <List
          size="small"
          dataSource={attachments}
          renderItem={(item) => (
            <List.Item
              style={{ backgroundColor: "#fff", marginBottom: 8, borderRadius: 4, padding: "8px 12px" }}
              actions={[
                <Popconfirm
                  title="Bạn có chắc muốn xóa tệp này?"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  disabled={disabled}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} disabled={disabled} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <a href="#" onClick={(e) => handleDownload(item, e)}>
                    {item.file.name}
                  </a>
                }
                description={item.file.lastModifiedDate ? new Date(item.file.lastModifiedDate).toLocaleString('vi-VN') : 'Không rõ ngày'}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default CardAttachments;
