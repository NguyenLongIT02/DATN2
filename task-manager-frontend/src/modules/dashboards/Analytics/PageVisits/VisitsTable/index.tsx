import React from 'react';
import {CaretUpOutlined, CaretDownOutlined} from '@ant-design/icons';
import {StyledPageVisitTable} from '../index.styled';
import type {PageVisitType} from '@crema/types/models/dashboards/Analytics';

const columns = [
  {
    title: 'Page name',
    dataIndex: 'page',
    key: 'page',
  },
  {
    title: 'Page Views',
    dataIndex: 'pageView',
    key: 'pageView',
    render: (pageView: PageVisitType) => (
      <span className='up-icon'>
        <>
          <CaretUpOutlined />
          {pageView}
        </>
      </span>
    ),
  },
  {
    title: 'Unique Visitors',
    dataIndex: 'visitors',
    key: 'visitors',
    render: (visitors: any) => (
      <span className='down-icon'>
        <>
          <CaretDownOutlined />
          {visitors.visitors}
        </>
      </span>
    ),
  },
];

type Props = {
  visitsData: PageVisitType[];
};

const VisitsTable: React.FC<Props> = ({visitsData}) => {
  return (
    <StyledPageVisitTable
      hoverColor
      data={visitsData}
      columns={columns}
      scroll={{y: 435}}
    />
  );
};

export default VisitsTable;
