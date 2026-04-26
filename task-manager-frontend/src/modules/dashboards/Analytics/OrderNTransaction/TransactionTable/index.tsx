import React from "react";
import AppMenu from "@crema/components/AppMenu";
import { StyledOrderBadge, StyledOrderTransactionTable } from "../index.styled";

import type { TransactionDataType } from "@crema/types/models/dashboards/Analytics";

type Props = {
  transactionData: TransactionDataType[];
};

type paymentProps = {
  [key: string]: string;
};

const paymentTypeColor: paymentProps = {
  COD: '#F84E4E',
  Prepaid: '#43C888',
  default: '#E2A72E',
};
const paymentStatusColor: paymentProps = {
  'In Transit': '#F84E4E',
  Delivered: '#43C888',
  default: '#E2A72E',
};

const TransactionTable: React.FC<Props> = ({transactionData}) => {
  const columns = [
    {
      title: 'OrderID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Order Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Payment',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (paymentType: string) => (
        <span
          style={{
            color: paymentTypeColor[paymentType] || paymentTypeColor['default'],
          }}
        >
          {paymentType}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <StyledOrderBadge
          style={{
            color: paymentStatusColor[status] || paymentStatusColor['default'],
            backgroundColor: paymentStatusColor[status]
              ? paymentStatusColor[status] + '44'
              : paymentStatusColor['default'] + '44',
          }}
        >
          {status}
        </StyledOrderBadge>
      ),
    },
    {
      title: '',
      dataIndex: 'more',
      key: 'more',
      className: 'order-transaction-table-more',
      render: () => <AppMenu />,
    },
  ];

  return (
    <StyledOrderTransactionTable
      hoverColor
      data={transactionData}
      columns={columns}
      pagination={false}
    />
  );
};

export default TransactionTable;
