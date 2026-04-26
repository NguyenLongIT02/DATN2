import React from 'react';
import {StyledPagination} from './index.styled';

type AppsPaginationProps = {
  count: number;
  className?: string;
  page: number;
  pageSize?: number;
  onChange: (page: number) => void;
  rowsPerPage?: number;

  [x: string]: any;
};

function itemRender(_: any, type: any, originalElement: React.ReactNode) {
  if (type === 'prev') {
    return <a>Previous Page</a>;
  }
  if (type === 'next') {
    return <a>Next Page</a>;
  }
  return originalElement;
}

const AppsPagination: React.FC<AppsPaginationProps> = ({
  count,
  page,
  onChange,
  className = '',
  pageSize = 15,
}) => {
  return (
    <StyledPagination
      total={count}
      pageSize={pageSize}
      className={className}
      current={page}
      itemRender={itemRender}
      onChange={onChange}
      pageSizeOptions={[]}
    />
  );
};

export default AppsPagination;
