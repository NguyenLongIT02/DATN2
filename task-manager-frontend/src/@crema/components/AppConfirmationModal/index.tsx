import React, {ReactNode} from 'react';
import {Modal} from 'antd';

import {StyledParaText} from './index.styled';

type AppConfirmDialogProps = {
  modalTitle: string | ReactNode;
  open: boolean;
  onDeny: (isOpen: boolean) => void;
  paragraph?: string | ReactNode;
  onConfirm: () => void;
};

const AppConfirmationModal: React.FC<AppConfirmDialogProps> = ({
  open,
  onDeny,
  onConfirm,
  paragraph = 'Are you sure you want to delete?',
  modalTitle,
}) => {
  return (
    <Modal
      title={modalTitle}
      open={open}
      onOk={onConfirm}
      onCancel={() => onDeny(false)}
    >
      <StyledParaText>{paragraph}</StyledParaText>
    </Modal>
  );
};

export default AppConfirmationModal;
