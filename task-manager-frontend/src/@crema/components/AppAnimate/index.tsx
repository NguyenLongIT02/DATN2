import React from 'react';
// import '../../../src/types/velocity-react.d';
// import { VelocityComponent } from 'velocity-react';
// import 'velocity-animate/velocity.ui';

type AppAnimateProps = {
  children: React.ReactNode;
  [x: string]: any;
  // animation: string;
  // runOnMount?: boolean;
  // targetQuerySelector?: null;
  // interruptBehavior?: string;
  // visibility?: string;
  // duration?: number;
  // delay?: number;
  // easing?: number[];
  // display?: null;
  // queue?: string;
  // loop?: boolean;
  // mobileHA?: boolean;
};

// const defaultProps = {
//   animation: 'transition.fadeIn',
//   runOnMount: true,
//   targetQuerySelector: null,
//   interruptBehavior: 'stop',
//   visibility: 'visible',
//   duration: 400,
//   delay: 100,
//   easing: [0.4, 0.0, 0.2, 1],
//   display: null,
//   queue: '',
//   loop: false,
//   mobileHA: true,
// };

export const AppAnimate: React.FC<AppAnimateProps> = (props) => {
  return <div>{props.children}</div>;
};

// AppAnimate.defaultProps = defaultProps;
export default AppAnimate;
