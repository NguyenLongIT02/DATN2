import {
  NOTIFICATION_TYPE,
  NOTIFICATION_CONTAINER,
  NOTIFICATION_INSERTION,
} from 'react-notifications-component';

const notifications = {
  title: 'Awesomeness',
  message: 'Awesome Notifications!',
  type: 'success' as NOTIFICATION_TYPE,
  container: 'top-right' as NOTIFICATION_CONTAINER,
  insert: 'top' as NOTIFICATION_INSERTION,

  animationIn: ['animated', 'fadeIn'],
  animationOut: ['animated', 'faster', 'fadeOut'],

  slidingEnter: {
    duration: 300,
    timingFunction: 'linear',
    delay: 0,
  },

  slidingExit: {
    duration: 300,
    timingFunction: 'linear',
    delay: 0,
  },

  touchRevert: {
    duration: 600,
    timingFunction: 'linear',
    delay: 0,
  },

  touchSlidingExit: {
    swipe: {
      duration: 600,
      timingFunction: 'linear',
      delay: 0,
    },
    fade: {
      duration: 300,
      timingFunction: 'linear',
      delay: 0,
    },
  },

  dismiss: {
    duration: 5000,
    onScreen: false,
    pauseOnHover: true,
    waitForAnimation: false,
    showIcon: true,
    click: true,
    touch: true,
  },
};
export default notifications;
