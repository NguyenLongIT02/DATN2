import mock from './apis/MockConfig.tsx';
import './apis/index';

export * from './fakedb/account';
export * from './fakedb/account/countries';
mock.onAny().passThrough();
