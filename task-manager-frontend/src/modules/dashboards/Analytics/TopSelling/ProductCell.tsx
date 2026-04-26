import React from 'react';
import AppCircularProgress from '@crema/components/AppCircularProgress';
import {RightOutlined} from '@ant-design/icons';
import {
  StyledTopSellingCell,
  StyledTopSellingCellAction,
  StyledTopSellingCellActionIcon,
  StyledTopSellingCellActionInfo,
  StyledTopSellingCellContent,
  StyledTopSellingCellImg,
  StyledTopSellingCellInfo,
  StyledTopSellingPrice,
} from './index.styled';

import type {TopSellingProductType} from '@crema/types/models/dashboards/Analytics';

type ProductCellProps = {
  data: TopSellingProductType;
};

const ProductCell: React.FC<ProductCellProps> = ({data}) => {
  return (
    <StyledTopSellingCell key={data.id} className='item-hover'>
      <StyledTopSellingCellInfo>
        <StyledTopSellingCellImg alt='' src={data.icon} />

        <StyledTopSellingCellContent>
          <h3>{data.name}</h3>
          <p>{data.description}</p>
          <StyledTopSellingPrice>${data.price}</StyledTopSellingPrice>
        </StyledTopSellingCellContent>
      </StyledTopSellingCellInfo>

      <StyledTopSellingCellAction>
        <AppCircularProgress
          strokeColor={data.color}
          trailColor='rgb(214, 214, 214)'
          percent={70}
          strokeWidth={10}
          format={() => <span />}
          width={50}
        />
        <StyledTopSellingCellActionInfo>
          <div>
            <p>Sales</p>
            <span>{data.rate}%</span>
          </div>
          <StyledTopSellingCellActionIcon>
            <RightOutlined />
          </StyledTopSellingCellActionIcon>
        </StyledTopSellingCellActionInfo>
      </StyledTopSellingCellAction>
    </StyledTopSellingCell>
  );
};

export default ProductCell;
