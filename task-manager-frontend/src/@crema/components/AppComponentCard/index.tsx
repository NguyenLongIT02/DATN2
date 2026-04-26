import React, {ReactNode} from 'react';
import AppAnimateGroup from '../AppAnimateGroup';
import ComponentCardWithoutAnim from './ComponentCardWithoutAnim';

interface AppComponentCardProps {
  title: any;
  className?: string;
  component: any;
  source?: any;
  maxHeight?: number;
  size?: number;
  description?: ReactNode;
  noScrollbar?: boolean;
}

const AppComponentCard: React.FC<AppComponentCardProps> = ({
  title,
  description = '',
  className,
  maxHeight = 500,
  component,
  source,
}) => {
  return (
    <AppAnimateGroup type='bottom' interval={100} duration={450}>
      <ComponentCardWithoutAnim
        title={title}
        description={description}
        className={className}
        maxHeight={maxHeight}
        component={component}
        source={source}
        key={'card'}
      />
    </AppAnimateGroup>
  );
};

export default AppComponentCard;
