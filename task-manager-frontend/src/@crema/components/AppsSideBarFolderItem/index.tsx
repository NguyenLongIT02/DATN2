/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {NavLink} from 'react-router-dom';
import {
  FaRegCheckCircle,
  FaRegEnvelope,
  FaRegEnvelopeOpen,
  FaRegStar,
} from 'react-icons/fa';
import {BiArchiveIn, BiCalendarMinus, BiUser} from 'react-icons/bi';
import {
  AiOutlineDelete,
  AiOutlineSchedule,
  AiOutlineSend,
  AiOutlineStop,
} from 'react-icons/ai';
import {FiInfo, FiRefreshCw} from 'react-icons/fi';

import {
  StyledListItem,
  StyledListItemIcon,
  StyledListItemText,
} from './index.styled';
import {MdOutlineCancel, MdOutlinePayment} from 'react-icons/md';

const IconByName: any = {
  sent: <AiOutlineSend />,
  paid: <MdOutlinePayment />,
  declined: <AiOutlineStop />,
  cancelled: <MdOutlineCancel />,
  'check-circle': <FaRegCheckCircle />,
  envelope: <FaRegEnvelope />,
  star: <FaRegStar />,
  'calendar-minus': <BiCalendarMinus />,
  user: <BiUser />,
  clock: <AiOutlineSchedule />,
  'envelope-open': <FaRegEnvelopeOpen />,
  'trash-alt': <AiOutlineDelete />,
  'file-archive': <BiArchiveIn />,
  'question-circle': <FiInfo />,
  clone: <FiRefreshCw />,
};

type AppsSideBarFolderItemProps = {
  item: any;
  path: string;
};

const AppsSideBarFolderItem: React.FC<AppsSideBarFolderItemProps> = ({
  item,
  path,
}) => {
  return (
    <StyledListItem key={item.id}>
      <NavLink to={path}>
        <StyledListItemIcon>{IconByName[item.icon]}</StyledListItemIcon>
        <StyledListItemText>{item.name}</StyledListItemText>
      </NavLink>
    </StyledListItem>
  );
};

export default AppsSideBarFolderItem;
