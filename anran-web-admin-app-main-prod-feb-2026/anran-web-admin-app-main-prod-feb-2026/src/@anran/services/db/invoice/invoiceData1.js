const invoiceData = {
  company: {
    name: 'Smart Talent',
    address1: '35, Jalan Puteri 10/2a,',
    address2: 'Bandar Puteri, Puchong',
    address3: 'Selangor, 47100',
    phone: '(+60)-0380664522',
  },
  client: {
    name: 'Mr. John Doe',
    phone: '(+60)-1234567890',
    email: 'john123doe@xyz.com',
  },
  invoice: {
    id: '$323892938',
    date: '05/10/2023',
    dueDate: '05/10/2023',
  },
  products: [
    {
      id: 1,
      item: 'Logo Design',
      desc: 'Lorem Ipsum is simply dummy text of the printing',
      type: 'FIXED PRICE',
      quantity: '02',
      price: 300,
    },
    {
      id: 2,
      item: 'Stationary Design',
      desc: 'Lorem Ipsum is simply dummy text of the printing',
      type: '$20/HOUR',
      quantity: '5 Hours',
      price: 100,
    },
    {
      id: 3,
      item: 'Logo Design',
      desc: 'Lorem Ipsum is simply dummy text of the printing',
      type: 'FIXED PRICE',
      quantity: '02',
      price: 300,
    },
  ],
  subTotal: 1000,
  rebate: 200,
  total: 800,
};
export default invoiceData;
