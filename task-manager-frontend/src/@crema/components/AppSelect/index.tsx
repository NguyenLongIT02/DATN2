import React, {useState} from 'react';
import {StyledAppSelect, StyledOption} from './index.styled';

type AppSelectProps = {
  menus: any[];
  onChange: (e: any) => void;
  defaultValue: any;
  selectionKey?: string;
};

const AppSelect: React.FC<AppSelectProps> = ({
  menus = [],
  onChange,
  defaultValue = '',
  selectionKey = '',
}) => {
  const [selectionType, setSelectionType] = useState(defaultValue);

  const handleSelectionType = (value: any) => {
    setSelectionType(value);
    onChange(value);
  };

  return (
    <StyledAppSelect
      defaultValue={defaultValue}
      value={selectionType}
      onChange={handleSelectionType}
    >
      {menus.map((menu, index) => (
        <StyledOption
          key={index}
          value={selectionKey ? menu[selectionKey] : menu}
        >
          {selectionKey ? menu[selectionKey] : menu}
        </StyledOption>
      ))}
    </StyledAppSelect>
  );
};

export default AppSelect;
