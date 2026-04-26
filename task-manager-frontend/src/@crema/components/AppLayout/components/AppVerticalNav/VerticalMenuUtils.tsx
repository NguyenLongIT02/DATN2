import {Link} from 'react-router-dom';
import React from 'react';
import {MessageFormatElement} from 'react-intl';
import {RouterConfigData} from '@crema/types/models/Apps';

const renderMenuItemChildren = (
  item: RouterConfigData,
  messages: Record<string, string> | Record<string, MessageFormatElement[]>,
) => {
  const {icon, messageId, url} = item;

  if (url && url.includes('/'))
    return {
      key: item.id,
      icon:
        icon &&
        (React.isValidElement(icon) ? (
          <span className='ant-menu-item-icon'>{icon}</span>
        ) : (
          <span className='ant-menu-item-icon' />
        )),
      label: (
        <Link to={url}>
          <span data-testid={messageId.toLowerCase + '-nav'}>
            {messages[messageId] as string}
          </span>
        </Link>
      ),
    };
  else {
    return {
      key: item.id,
      icon:
        icon &&
        (React.isValidElement(icon) ? (
          <span className='ant-menu-item-icon'>{icon}</span>
        ) : (
          <span className='ant-menu-item-icon' />
        )),
      label: (
        <span data-testid={messageId.toLowerCase + '-nav'}>
          {messages[messageId] as string}
        </span>
      ),
    };
  }
};

const renderMenuItem: any = (
  item: RouterConfigData,
  messages: Record<string, string> | Record<string, MessageFormatElement[]>,
) => {
  return item.type === 'collapse'
    ? {
        ...renderMenuItemChildren(item, messages),
        children: item.children?.map((item) => renderMenuItem(item, messages)),
        type: 'collapse',
      }
    : {
        ...renderMenuItemChildren(item, messages),
      };
};

const renderMenu = (
  item: RouterConfigData,
  messages: Record<string, string> | Record<string, MessageFormatElement[]>,
) => {
  return item.type === 'group'
    ? {
        ...renderMenuItemChildren(item, messages),
        children: item.children?.map((item) => renderMenuItem(item, messages)),
        type: 'group',
      }
    : {
        exact: item.exact,
        ...renderMenuItemChildren(item, messages),
      };
};

export const getRouteMenus = (
  routesConfig: RouterConfigData[],
  messages: Record<string, string> | Record<string, MessageFormatElement[]>,
) => {
  return routesConfig.map((route) => renderMenu(route, messages));
};
