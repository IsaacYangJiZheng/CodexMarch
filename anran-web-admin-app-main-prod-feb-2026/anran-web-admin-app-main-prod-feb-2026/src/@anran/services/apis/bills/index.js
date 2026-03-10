import mock from '../../MockConfig';
import billsData from '../../db/apps/bills';
import InvoiceData from '../../db/apps/bills/invoiceData';
import InvoiceData1 from '../../db/apps/bills/invoiceData1';
import PaymentData from '../../db/apps/bills/paymentData';

// Define all mocks of dashboard
mock.onGet('/bills/invoices/recent').reply(200, InvoiceData);
mock.onGet('/bills/payment/recent').reply(200, PaymentData);

mock.onGet('/bills/payment/children/recent/open').reply((config) => {
  const params = config.params;
  const response1 = PaymentData.filter(
    (data) => data.children.id === parseInt(params.id),
  );
  const response2 = response1.filter((data) => data.status === 'Unpaid');
  return [200, response2];
});

mock.onGet('/bills/payment/children/recent').reply((config) => {
  const params = config.params;
  const response = PaymentData.filter(
    (data) => data.children.id === parseInt(params.id),
  );
  return [200, response];
});

mock.onGet('/bills/invoice/children/recent').reply((config) => {
  const params = config.params;
  const response = InvoiceData1.filter(
    (data) => data.children.id === parseInt(params.id),
  );
  return [200, response];
});

mock.onGet('/bills/overview').reply(200, billsData);
