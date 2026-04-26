import React from 'react';
import IntlMessages from '@crema/helpers/IntlMessages';
import {TwitterOutlined} from '@ant-design/icons';
import {FaFacebookF} from 'react-icons/fa';
import {
  StyledUserFlatSocialInfo,
  StyledUserFlatSocialInfoItem,
  StyledUserFlatSocialInfoItemText,
} from '../index.styled';
import {UserList} from '@crema/types/models/Apps';

type UserSocialMediaInfoProps = {
  user: UserList;
};

const UserSocialMediaInfo: React.FC<UserSocialMediaInfoProps> = ({user}) => {
  return (
    <StyledUserFlatSocialInfo>
      <StyledUserFlatSocialInfoItemText>
        <span>{user.readTime}</span>
        <IntlMessages id='common.read' />
      </StyledUserFlatSocialInfoItemText>
      <StyledUserFlatSocialInfoItem>
        <span>
          <FaFacebookF />
        </span>
        <span>{user.shares}</span>
        <IntlMessages id='common.shares' />
      </StyledUserFlatSocialInfoItem>
      <StyledUserFlatSocialInfoItem>
        <span>
          <TwitterOutlined />
        </span>
        <span>{user.retweets}</span>
        <IntlMessages id='common.retweets' />
      </StyledUserFlatSocialInfoItem>
    </StyledUserFlatSocialInfo>
  );
};

export default UserSocialMediaInfo;
