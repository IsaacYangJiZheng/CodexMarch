import mock from '../../MockConfig';
import attendance from '../../db/apps/attendance/listData';

// Define all mocks of dashboard
mock.onGet('/children/attendance').reply(200, attendance);
mock
  .onGet('/children/attendance/details')
  .reply(200, attendance[0].attendanceData[0]);
