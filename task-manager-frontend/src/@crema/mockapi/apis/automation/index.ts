import mock from '../MockConfig.tsx';
import automationRules from '../../fakedb/apps/automation';

mock.onGet('/api/automation/rules').reply(200, automationRules);

mock.onPut(/\/api\/automation\/rules\/\d+/).reply((config) => {
  const id = parseInt(config.url?.split('/').pop() || '0');
  const updatedRule = JSON.parse(config.data);
  const index = automationRules.findIndex(rule => rule.id === id);
  if (index !== -1) {
    automationRules[index] = { ...automationRules[index], ...updatedRule };
    return [200, automationRules[index]];
  }
  return [404, { message: 'Rule not found' }];
});

export {};

