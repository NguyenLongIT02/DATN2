import React from 'react';
import {Progress} from 'antd';

interface AppCircularProgressProps {
  percent?: number;
  [x: string]: any;
}

const AppCircularProgress: React.FC<AppCircularProgressProps> = ({
  percent,
  ...rest
}) => {
  return <Progress type='circle' percent={percent} {...rest} />;
};
export default AppCircularProgress;
