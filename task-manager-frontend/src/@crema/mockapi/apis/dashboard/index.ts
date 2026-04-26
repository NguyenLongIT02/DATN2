import mock from '../MockConfig.tsx';
import analytics from '../../fakedb/dashboard/analytics';
import healthCare from '../../fakedb/dashboard/healthCare';
import academy from '../../fakedb/dashboard/academy';

// Define all mocks of dashboard
mock.onGet('/dashboard/analytics').reply(200, analytics);

mock.onGet('/dashboard/health_care').reply(200, healthCare);

mock.onGet('/dashboard/academy').reply(200, academy);

