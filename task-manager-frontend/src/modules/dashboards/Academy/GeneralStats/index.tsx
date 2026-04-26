import React, {ReactNode} from 'react';
import AppCard from '@crema/components/AppCard';

import {BiBasket} from 'react-icons/bi';
import {FcGraduationCap} from 'react-icons/fc';
import {GiBookshelf} from 'react-icons/gi';
import {FcReading} from 'react-icons/fc';
import {
  StyledGeneralStats,
  StyledGeneralStatsAvatar,
  StyledGeneralStatsBadge,
  StyledGeneralStatsContent,
} from './index.styled';
import type {AcademicStatsType} from '@crema/types/models/dashboards/AcademyType';

type getIconProps = {
  [key: string]: ReactNode;
};
const getIcon: getIconProps = {
  BiBasket: <BiBasket color='#9E49E6' className='icon' />,
  FcGraduationCap: <FcGraduationCap color='#0A8FDC' className='icon' />,
  GiBookshelf: <GiBookshelf color='#49BD65' className='icon' />,
  default: <FcReading color='#9E49E6' className='icon' />,
};
type GeneralStatsProps = {
  stats: AcademicStatsType;
};

const GeneralStats: React.FC<GeneralStatsProps> = ({stats}) => {
  console.log('icon', stats.icon);
  return (
    <AppCard heightFull className='card-hover'>
      <StyledGeneralStats>
        <StyledGeneralStatsAvatar style={{backgroundColor: stats.bgcolor}}>
          {getIcon[stats.icon] ? getIcon[stats.icon] : getIcon['default']}
        </StyledGeneralStatsAvatar>
        <StyledGeneralStatsContent>
          <div>
            <h3>{stats.count}</h3>
            <p className='text-truncate'>{stats.title}</p>
          </div>
          <StyledGeneralStatsBadge
            style={{backgroundColor: stats.bgcolor, color: stats.badgeColor}}
          >
            {stats.new}
          </StyledGeneralStatsBadge>
        </StyledGeneralStatsContent>
      </StyledGeneralStats>
    </AppCard>
  );
};

export default GeneralStats;
