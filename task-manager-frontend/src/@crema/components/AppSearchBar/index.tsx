import React from 'react';
import {Input} from 'antd';

type AppSearchProps = {
  iconPosition?: string;
  align?: string;
  overlap?: boolean;
  className?: string;
  onlyIcon?: boolean;

  [x: string]: any;
};

const AppSearch: React.FC<AppSearchProps> = () => {
  const {Search} = Input;
  const onSearch = (value: any) => console.log(value);
  return (
    <Search
      placeholder='input search text'
      allowClear
      onSearch={onSearch}
      style={{width: 200}}
    />
  );
};

export default AppSearch;
