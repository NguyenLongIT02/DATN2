import React from 'react';
import {Progress} from 'antd';
import {StyledListFooter, StyledLoaderProgress} from './index.styled';
type ListFooterProps = {
  loading?: boolean;
  footerText: string;
};

export const ListFooter: React.FC<ListFooterProps> = ({
  loading = false,
  footerText,
}) => {
  return loading ? (
    <StyledLoaderProgress>
      <Progress percent={30} />
      <span>Loading...</span>
    </StyledLoaderProgress>
  ) : (
    <StyledListFooter>
      <p>{footerText}</p>
    </StyledListFooter>
  );
};

export default ListFooter;
