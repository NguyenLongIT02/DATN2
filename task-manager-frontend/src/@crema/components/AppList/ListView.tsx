import React, {ReactNode} from 'react';
import {useBottomScrollListener} from 'react-bottom-scroll-listener';
import AppAnimateGroup from '../AppAnimateGroup';
import {useThemeContext} from '@crema/context/AppContextProvider/ThemeContextProvider';

type ListViewProps = {
  className?: string;
  border?: boolean;
  renderItem: (item: any, index: number) => ReactNode;
  delay?: number;
  duration?: number;
  containerStyle?: any;
  animation?: string;
  ListEmptyComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  data: any[];
  interval?: any;
  type?: any;
  onEndReached?: () => void;
};

const getEmptyContainer = (ListEmptyComponent: any) => {
  if (ListEmptyComponent)
    return React.isValidElement(ListEmptyComponent) ? (
      ListEmptyComponent
    ) : (
      <ListEmptyComponent />
    );
  return null;
};

const getFooterContainer = (ListFooterComponent: any) => {
  if (ListFooterComponent)
    return React.isValidElement(ListFooterComponent) ? (
      ListFooterComponent
    ) : (
      <ListFooterComponent />
    );
  return null;
};
const ListView: React.FC<ListViewProps> = ({
  renderItem,
  onEndReached,
  data = [],
  ListFooterComponent,
  ListEmptyComponent,
  interval = 50,
  type = 'top',
  duration = 300,
  delay = 0,
  animation,
  border,
  containerStyle,
  ...rest
}) => {
  const {theme} = useThemeContext();
  const borderStyle = {
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    overflow: 'hidden',
  };

  if (!onEndReached) {
    onEndReached = () => {};
  }

  let style = containerStyle;
  if (border) {
    style = {...style, ...borderStyle};
  }

  useBottomScrollListener(onEndReached, {debounce: 200});
  return (
    <AppAnimateGroup
      style={{...style}}
      {...rest}
      enter={{delay, duration, animation}}
    >
      {data.length > 0
        ? data.map((item, index) => {
            return (
              <div key={'listItem-' + item.id + '-' + index}>
                {renderItem(item, index)}
              </div>
            );
          })
        : getEmptyContainer(ListEmptyComponent)}
      {getFooterContainer(ListFooterComponent)}
    </AppAnimateGroup>
  );
};

export default ListView;
