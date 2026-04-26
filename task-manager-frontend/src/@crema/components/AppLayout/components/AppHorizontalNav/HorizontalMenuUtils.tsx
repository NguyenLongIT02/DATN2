/* eslint-disable @typescript-eslint/no-explicit-any */
import {Link, useLocation} from 'react-router-dom';
import {Menu} from 'antd';
import React from 'react';
import {useIntl} from 'react-intl';
import {useSidebarContext} from '@crema/context/AppContextProvider/SidebarContextProvider';
import {allowMultiLanguage} from '@crema/constants/AppConst';
import {RouterConfigData} from '@crema/types/models/Apps';
import {SidebarData} from '@crema/constants/defaultConfig';

function getStyles(
  item: RouterConfigData,
  sidebarColorSet: SidebarData,
  index: number,
) {
  const {pathname} = useLocation();
  const selectedKeys = pathname.substr(1);
  const defaultOpenKeys = selectedKeys.split('/');

  const isOpen = defaultOpenKeys[index] === item.id;
  return {
    color: isOpen
      ? sidebarColorSet.sidebarMenuSelectedTextColor
      : sidebarColorSet.sidebarTextColor,
    backgroundColor: isOpen
      ? sidebarColorSet.sidebarMenuSelectedBgColor
      : sidebarColorSet.sidebarBgColor,
  };
}

const renderMenuItemChildren = (item: RouterConfigData) => {
  const {icon, messageId, url} = item;
  const {messages} = useIntl();

  if (url && url.includes('/'))
    return (
      <Link to={url}>
        {icon &&
          (React.isValidElement(icon) ? (
            <span className='ant-menu-item-icon'>{icon}</span>
          ) : (
            <span className='ant-menu-item-icon' />
          ))}
        <span data-testid={messageId.toLowerCase + '-nav'}>
          {allowMultiLanguage ? (messages[messageId] as string) : item.title}
        </span>
      </Link>
    );
  else {
    return (
      <>
        {icon &&
          (React.isValidElement(icon) ? (
            <span className='ant-menu-item-icon'>{icon}</span>
          ) : (
            <span className='ant-menu-item-icon' />
          ))}
        <span data-testid={messageId.toLowerCase + '-nav'}>
          {allowMultiLanguage ? (messages[messageId] as string) : item.title}
        </span>
      </>
    );
  }
};

const renderMenuItem = (
  item: RouterConfigData,
  sidebarColorSet: SidebarData,
  index: number,
) => {
  return item.type === 'collapse' ? (
    <Menu.SubMenu
      style={getStyles(item, sidebarColorSet, index)}
      key={item.url ? item.url : item.id}
      title={renderMenuItemChildren(item)}
    >
      {item?.children?.map((item) =>
        renderMenuItem(item, sidebarColorSet, index + 1),
      )}
    </Menu.SubMenu>
  ) : (
    <Menu.Item key={item.id} style={getStyles(item, sidebarColorSet, index)}>
      {item.children ? item.children : (renderMenuItemChildren(item) as any)}
    </Menu.Item>
  );
};

const renderHorMenu = (
  item: RouterConfigData,
  sidebarColorSet: SidebarData,
  index: number,
) => {
  return item.type === 'group' ? (
    <Menu.SubMenu
      style={getStyles(item, sidebarColorSet, index)}
      key={item.url ? item.url : item.id}
      title={renderMenuItemChildren(item)}
    >
      {item?.children?.map((item) =>
        renderMenuItem(item, sidebarColorSet, index + 1),
      )}
    </Menu.SubMenu>
  ) : (
    <Menu.Item
      key={item.id}
      // exact={item.exact}
      style={getStyles(item, sidebarColorSet, index)}
    >
      {item?.children ? item?.children : (renderMenuItemChildren(item) as any)}
    </Menu.Item>
  );
};

export const getRouteHorMenus = (routesConfig: RouterConfigData[]) => {
  const {sidebarColorSet} = useSidebarContext();
  return routesConfig.map((route) => renderHorMenu(route, sidebarColorSet, 0));
};
