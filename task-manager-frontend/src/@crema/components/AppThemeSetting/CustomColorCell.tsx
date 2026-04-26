import React from 'react';
import {CheckOutlined} from '@ant-design/icons';
import {
  StyledColorOptionListItem,
  StyledCustomColorOption,
  StyledCustomColorOptionRightIcon,
} from './index.styled';
import {ThemeColorType} from '@crema/constants/ColorSets';

type ColorCellProps = {
  themeColorSet: any;
  sidebarBGColor: any;
  updateThemeColors: (colorSet: ThemeColorType) => void;
};
const CustomColorCell: React.FC<ColorCellProps> = ({
  themeColorSet,
  sidebarBGColor,
  updateThemeColors,
}) => {
  return (
    <StyledColorOptionListItem
      onClick={() => {
        updateThemeColors(themeColorSet.color);
      }}
    >
      <StyledCustomColorOption style={{backgroundColor: themeColorSet.color}}>
        {themeColorSet.color === sidebarBGColor ? (
          <StyledCustomColorOptionRightIcon>
            <CheckOutlined />
          </StyledCustomColorOptionRightIcon>
        ) : null}
      </StyledCustomColorOption>
    </StyledColorOptionListItem>
  );
};

export default CustomColorCell;
