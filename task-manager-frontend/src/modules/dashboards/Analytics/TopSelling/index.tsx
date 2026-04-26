import React from 'react';
import ProductCell from './ProductCell';
import {useIntl} from 'react-intl';
import {List} from 'antd';
import {StyledTopSellingCard} from './index.styled';

import type {TopSellingProductType} from '@crema/types/models/dashboards/Analytics';

type TopSellingProps = {
  products: TopSellingProductType[];
};

const TopSelling: React.FC<TopSellingProps> = ({products}) => {
  const {messages} = useIntl();
  return (
    <StyledTopSellingCard
      className='no-card-space-ltr-rtl'
      heightFull
      title={messages['dashboard.analytics.topSellingProducts'] as string}
      actions={[<span key={1}>{'+12 ' + messages['common.more']}</span>]}
    >
      <List
        dataSource={products}
        renderItem={(data, index) => <ProductCell key={index} data={data} />}
      />
    </StyledTopSellingCard>
  );
};

export default TopSelling;
