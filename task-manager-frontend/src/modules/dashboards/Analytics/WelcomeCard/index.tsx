import React, {ReactNode} from 'react';
import {useIntl} from 'react-intl';

import {HiOutlineMailOpen} from 'react-icons/hi';
import {BiMessageDetail} from 'react-icons/bi';
import {CgFileDocument} from 'react-icons/cg';
import {
  StyledSpecialTitle,
  StyledWelcomeCard,
  StyledWelcomeCardCol,
  StyledWelcomeCardColContent,
  StyledWelcomeCardColThumb,
  StyledWelcomeCardContainer,
  StyledWelcomeCardContent,
  StyledWelcomeCardHeader,
  StyledWelcomeCardInfo,
  StyledWelcomeCardRow,
  StyledWelcomeCardScroll,
  StyledWelcomeImg,
} from './index.styled';
import type {WelcomeCardDataType} from '@crema/types/models/dashboards/Analytics';

type getWelcomeIconProps = {
  [key: string]: ReactNode;
};

const getWelcomeIcon: getWelcomeIconProps = {
  HiOutlineMailOpen: <HiOutlineMailOpen color='#0A8FDC' className='icon' />,
  BiMessageDetail: <BiMessageDetail color='#0A8FDC' className='icon' />,
  default: <CgFileDocument color='#0A8FDC' className='icon' />,
};

type WelcomeCardProps = {
  data: WelcomeCardDataType[];
};

const WelcomeCard: React.FC<WelcomeCardProps> = ({data}) => {
  const {messages} = useIntl();
  return (
    <StyledWelcomeCard>
      <StyledWelcomeCardInfo>
        <StyledWelcomeCardContent>
          <StyledWelcomeCardHeader>
            <h5>{messages['dashboard.analytics.welcome'] as string}</h5>
            <h3>{messages['dashboard.analytics.eddieMassy'] as string}</h3>
          </StyledWelcomeCardHeader>
          <StyledWelcomeCardScroll scrollToTop>
            <StyledWelcomeCardContainer>
              <StyledWelcomeCardRow>
                {data.map((item, index) => (
                  <StyledWelcomeCardCol key={'box-' + index}>
                    <StyledWelcomeCardColThumb>
                      <span className='ant-avatar ant-avatar-circle ant-avatar-image'>
                        {getWelcomeIcon[item.icon] || getWelcomeIcon['default']}
                      </span>
                    </StyledWelcomeCardColThumb>
                    <StyledWelcomeCardColContent>
                      <StyledSpecialTitle>{item.counts}</StyledSpecialTitle>
                      <p>{item.type}</p>
                    </StyledWelcomeCardColContent>
                  </StyledWelcomeCardCol>
                ))}
              </StyledWelcomeCardRow>
            </StyledWelcomeCardContainer>
          </StyledWelcomeCardScroll>
        </StyledWelcomeCardContent>
        <StyledWelcomeImg>
          <img alt='welcome' src={'/assets/images/dashboard/welcomImage.svg'} />
        </StyledWelcomeImg>
      </StyledWelcomeCardInfo>
    </StyledWelcomeCard>
  );
};

export default WelcomeCard;
