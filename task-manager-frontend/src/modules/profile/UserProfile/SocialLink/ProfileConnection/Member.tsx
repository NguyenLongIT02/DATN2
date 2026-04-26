import React, {useState} from 'react';
import {Avatar, Button} from 'antd';
import {
  StyledDisconnectBtn,
  StyledMemberCard,
  StyledMemberCardTitle,
  StyledMemberInfo,
  StyledMemberInfoContent,
  StyledMemberThumb,
} from './index.styled';
import {MemberDataType} from '@crema/types/models/account';

type MemberProps = {
  member: MemberDataType;
};

const Member: React.FC<MemberProps> = ({member}) => {
  const [connect, setConnect] = useState(false);

  const onConnect = () => {
    setConnect(!connect);
  };

  const onDisconnect = () => {
    setConnect(!connect);
  };

  return (
    <StyledMemberCard heightFull>
      <StyledMemberCardTitle>{member.title}</StyledMemberCardTitle>
      {connect ? (
        <StyledMemberInfo>
          <StyledMemberInfoContent>
            <Button type='primary' ghost onClick={onConnect}>
              Connect
            </Button>
          </StyledMemberInfoContent>
        </StyledMemberInfo>
      ) : (
        <StyledMemberInfo>
          <StyledMemberThumb>
            <Avatar src={member.image} alt={member.title} />
          </StyledMemberThumb>
          <StyledMemberInfoContent>
            <h5>{member.title}</h5>
            <StyledDisconnectBtn onClick={onDisconnect}>
              Disconnect
            </StyledDisconnectBtn>
          </StyledMemberInfoContent>
        </StyledMemberInfo>
      )}
    </StyledMemberCard>
  );
};

export default Member;
