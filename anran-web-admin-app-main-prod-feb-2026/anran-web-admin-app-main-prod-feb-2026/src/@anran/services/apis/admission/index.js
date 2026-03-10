import mock from '../../MockConfig';
import admission from '../../db/admission';

// Define all mocks of dashboard

mock.onGet('/dashboard/admission').reply(200, admission);
