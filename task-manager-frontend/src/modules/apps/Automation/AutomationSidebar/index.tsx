import React from 'react';
import AppScrollbar from '@crema/components/AppScrollbar';
import IntlMessages from '@crema/helpers/IntlMessages';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { StyledAutomationSidebar, StyledMenuItem } from './index.styled';

const AutomationSidebar = () => {
  const menuItems = [
    { id: 'all', label: 'All Rules', count: 8 },
    { id: 'active', label: 'Active', count: 5 },
    { id: 'inactive', label: 'Inactive', count: 3 },
    { id: 'templates', label: 'Templates', count: 12 },
  ];

  return (
    <StyledAutomationSidebar>
      <AppScrollbar>
        <div style={{ padding: '20px' }}>
          <Button type="primary" icon={<PlusOutlined />} block style={{ marginBottom: 20 }}>
            <IntlMessages id="common.createRule" />
          </Button>

          {menuItems.map((item) => (
            <StyledMenuItem key={item.id}>
              <span>{item.label}</span>
              <span className="count">{item.count}</span>
            </StyledMenuItem>
          ))}
        </div>
      </AppScrollbar>
    </StyledAutomationSidebar>
  );
};

export default AutomationSidebar;

