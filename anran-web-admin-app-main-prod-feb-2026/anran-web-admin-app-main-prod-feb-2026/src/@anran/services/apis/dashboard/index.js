import mock from '../../MockConfig';
import analytics from '../../db/dashboard/analytics';
import ecommerce from '../../db/dashboard/ecommerce';
import crm from '../../db/dashboard/crm';
import crypto from '../../db/dashboard/crypto';
import metrics from '../../db/dashboard/metrics';
import widgets from '../../db/dashboard/widgets';
import healthCare from '../../db/dashboard/healthCare';
import academy from '../../db/dashboard/academy';
import parent from '../../db/dashboard/parent';
import staff from '../../db/dashboard/staff';

// Define all mocks of dashboard
mock.onGet('/dashboard/parent').reply(200, parent);

mock.onGet('/dashboard/parent/quick').reply((config) => {
  console.log('API called', config.params);
  const params = config.params;
  const response = parent.find((data) => data.id === parseInt(params.id));
  return [200, response];
});

mock.onGet('/dashboard/staff/quick').reply((config) => {
  console.log('API called', config.params);
  const params = config.params;
  const response = staff.find((data) => data.id === parseInt(params.id));
  return [200, response];
});

mock.onGet('/dashboard/analytics').reply(200, analytics);

mock.onGet('/dashboard/ecommerce').reply(200, ecommerce);

mock.onGet('/dashboard/crm').reply(200, crm);

mock.onGet('/dashboard/crypto').reply(200, crypto);

mock.onGet('/dashboard/health_care').reply(200, healthCare);

mock.onGet('/dashboard/academy').reply(200, academy);

mock.onGet('/dashboard/metrics').reply(200, metrics);

mock.onGet('/dashboard/widgets').reply(200, widgets);
