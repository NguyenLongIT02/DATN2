import React, {ReactNode} from 'react';
import ListView from './ListView';
import ListFooter from './ListFooter';

type AppListProps = {
  border?: boolean;
  delay?: number;
  className?: string;
  ListEmptyComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  data: any[];
  interval?: any;
  type?: any;
  onEndReached?: () => void;
  renderItem: (item: any, index: number) => ReactNode;
  footerProps?: {
    loading: boolean;
    footerText: string;
  };

  [x: string]: any;
};

const AppList: React.FC<AppListProps> = ({footerProps, ...props}) => {
  return (
    <ListView
      {...props}
      ListFooterComponent={
        footerProps ? (
          <ListFooter
            loading={footerProps.loading}
            footerText={footerProps.footerText}
          />
        ) : null
      }
    />
  );
};

export default AppList;
