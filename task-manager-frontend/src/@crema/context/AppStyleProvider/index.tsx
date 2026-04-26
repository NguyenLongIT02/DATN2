import React, {ReactNode} from 'react';
import {StyleProvider} from '@ant-design/cssinjs';

interface AppStyleProviderProps {
  children: ReactNode;
}

const AppStyleProvider: React.FC<AppStyleProviderProps> = ({children}) => {
  return <StyleProvider hashPriority='high'>{children}</StyleProvider>;
};
export default AppStyleProvider;
