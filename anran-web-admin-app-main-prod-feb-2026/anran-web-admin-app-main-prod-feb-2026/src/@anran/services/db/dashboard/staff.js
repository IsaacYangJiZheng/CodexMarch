import {green, grey, red, orange} from '@mui/material/colors';

const staffDashDat = [
  {
    id: 1,
    data: {
      earningGraphData: [
        {name: 'Present', value: 10, color: '#38A169', colorName: green[600]},
        {name: 'Absent', value: 2, color: '#E53E3E', colorName: red[600]},
        {
          name: 'Late arrival',
          value: 0,
          color: '#4299E1',
          colorName: orange[500],
        },
        {name: '', value: 0, color: '#CBD5E0', colorName: grey[500]},
      ],
      attendanceState: [
        {
          id: 1,
          type: 'Total Present',
          value: '10',
          bgColor: '#0A8FDC',
          icon: '/assets/images/dashboard/1_sales_icon.svg',
        },
        {
          id: 2,
          type: 'Total Absent',
          value: '2',
          bgColor: '#49BD65',
          icon: '/assets/images/dashboard/1_monthly_sales.svg',
        },
        {
          id: 3,
          type: 'Late Arrival',
          value: '0',
          bgColor: '#9E49E6',
          icon: '/assets/images/dashboard/1_revenue_icon.svg',
        },
        {
          id: 4,
          type: 'Total Incidents',
          value: '0',
          bgColor: '#0a8fdc',
          icon: '/assets/images/dashboard/1_email_sent.svg',
        },
      ],
      salesState: [
        {
          id: 1,
          type: 'Total Sale',
          value: '3,256',
          bgColor: '#0A8FDC',
          icon: '/assets/images/dashboard/1_sales_icon.svg',
        },
        {
          id: 2,
          type: 'Last Month Sale',
          value: '6,257',
          bgColor: '#49BD65',
          icon: '/assets/images/dashboard/1_monthly_sales.svg',
        },
        {
          id: 3,
          type: 'Total Revenue',
          value: '$34,650',
          bgColor: '#9E49E6',
          icon: '/assets/images/dashboard/1_revenue_icon.svg',
        },
        {
          id: 4,
          type: 'Total Email Sent',
          value: '11,320',
          bgColor: '#3A3849',
          icon: '/assets/images/dashboard/1_email_sent.svg',
        },
      ],
      yearData: [
        {
          month: 'Jan',
          present: 14,
          absent: 2,
        },
        {
          month: 'Feb',
          present: 10,
          absent: 3,
        },
        {
          month: 'Mar',
          present: 14,
          absent: 0,
        },
        {
          month: 'Apr',
          present: 24,
          absent: 4,
        },
        {
          month: 'May',
          present: 14,
          absent: 2,
        },
        {
          month: 'Jun',
          present: 14,
          absent: 0,
        },
        {
          month: 'Jul',
          present: 14,
          absent: 0,
        },
        {
          month: 'Aug',
          present: 14,
          absent: 0,
        },
        {
          month: 'Sep',
          present: 14,
          absent: 0,
        },
        {
          month: 'Oct',
          present: 14,
          absent: 2,
        },
        {
          month: 'Nov',
          present: 14,
          absent: 4,
        },
        {
          month: 'Dec',
          present: 14,
          absent: 0,
        },
      ],
    },
  },
  {
    id: 3,
    data: {
      earningGraphData: [
        {name: 'Present', value: 10, color: '#38A169', colorName: green[600]},
        {name: 'Absent', value: 2, color: '#E53E3E', colorName: red[600]},
        {
          name: 'Late arrival',
          value: 0,
          color: '#4299E1',
          colorName: orange[500],
        },
        {name: '', value: 0, color: '#CBD5E0', colorName: grey[500]},
      ],
      attendanceState: [
        {
          id: 1,
          type: 'Total Present',
          value: '10',
          bgColor: '#0A8FDC',
          icon: '/assets/images/dashboard/1_sales_icon.svg',
        },
        {
          id: 2,
          type: 'Total Absent',
          value: '2',
          bgColor: '#49BD65',
          icon: '/assets/images/dashboard/1_monthly_sales.svg',
        },
        {
          id: 3,
          type: 'Late Arrival',
          value: '0',
          bgColor: '#9E49E6',
          icon: '/assets/images/dashboard/1_revenue_icon.svg',
        },
        {
          id: 4,
          type: 'Total Incidents',
          value: '0',
          bgColor: '#0a8fdc',
          icon: '/assets/images/dashboard/1_email_sent.svg',
        },
      ],
      salesState: [
        {
          id: 1,
          type: 'Total Sale',
          value: '3,256',
          bgColor: '#0A8FDC',
          icon: '/assets/images/dashboard/1_sales_icon.svg',
        },
        {
          id: 2,
          type: 'Last Month Sale',
          value: '6,257',
          bgColor: '#49BD65',
          icon: '/assets/images/dashboard/1_monthly_sales.svg',
        },
        {
          id: 3,
          type: 'Total Revenue',
          value: '$34,650',
          bgColor: '#9E49E6',
          icon: '/assets/images/dashboard/1_revenue_icon.svg',
        },
        {
          id: 4,
          type: 'Total Email Sent',
          value: '11,320',
          bgColor: '#3A3849',
          icon: '/assets/images/dashboard/1_email_sent.svg',
        },
      ],
      yearData: [
        {
          month: 'Jan',
          present: 14,
          absent: 2,
        },
        {
          month: 'Feb',
          present: 10,
          absent: 3,
        },
        {
          month: 'Mar',
          present: 14,
          absent: 0,
        },
        {
          month: 'Apr',
          present: 24,
          absent: 4,
        },
        {
          month: 'May',
          present: 14,
          absent: 2,
        },
        {
          month: 'Jun',
          present: 14,
          absent: 0,
        },
        {
          month: 'Jul',
          present: 14,
          absent: 0,
        },
        {
          month: 'Aug',
          present: 14,
          absent: 0,
        },
        {
          month: 'Sep',
          present: 14,
          absent: 0,
        },
        {
          month: 'Oct',
          present: 14,
          absent: 2,
        },
        {
          month: 'Nov',
          present: 14,
          absent: 4,
        },
        {
          month: 'Dec',
          present: 14,
          absent: 0,
        },
      ],
    },
  },
  {
    id: 2,
    data: {
      earningGraphData: [
        {name: 'Present', value: 15, color: '#E53E3E', colorName: red[600]},
        {name: 'Absent', value: 3, color: '#38A169', colorName: green[600]},
        {
          name: 'Late arrival',
          value: 1,
          color: '#4299E1',
          colorName: orange[500],
        },
        {name: '', value: 0, color: '#CBD5E0', colorName: grey[500]},
      ],
      attendanceState: [
        {
          id: 1,
          type: 'Total Present',
          value: '15 Days',
          bgColor: '#0A8FDC',
          icon: '/assets/images/dashboard/1_sales_icon.svg',
        },
        {
          id: 2,
          type: 'Total Absent',
          value: '3 Days',
          bgColor: '#49BD65',
          icon: '/assets/images/dashboard/1_monthly_sales.svg',
        },
        {
          id: 3,
          type: 'Late Arrival',
          value: '1 Days',
          bgColor: '#9E49E6',
          icon: '/assets/images/dashboard/1_revenue_icon.svg',
        },
        {
          id: 4,
          type: 'Late Arrival',
          value: '11,320',
          bgColor: '#3A3849',
          icon: '/assets/images/dashboard/1_email_sent.svg',
        },
      ],
      salesState: [
        {
          id: 1,
          type: 'Total Sale',
          value: '3,256',
          bgColor: '#0A8FDC',
          icon: '/assets/images/dashboard/1_sales_icon.svg',
        },
        {
          id: 2,
          type: 'Last Month Sale',
          value: '6,257',
          bgColor: '#49BD65',
          icon: '/assets/images/dashboard/1_monthly_sales.svg',
        },
        {
          id: 3,
          type: 'Total Revenue',
          value: '$34,650',
          bgColor: '#9E49E6',
          icon: '/assets/images/dashboard/1_revenue_icon.svg',
        },
        {
          id: 4,
          type: 'Total Email Sent',
          value: '11,320',
          bgColor: '#3A3849',
          icon: '/assets/images/dashboard/1_email_sent.svg',
        },
      ],
      yearData: [
        {
          month: 'Jan',
          present: 24,
          absent: 2,
        },
        {
          month: 'Feb',
          present: 20,
          absent: 3,
        },
        {
          month: 'Mar',
          present: 18,
          absent: 0,
        },
        {
          month: 'Apr',
          present: 14,
          absent: 4,
        },
        {
          month: 'May',
          present: 24,
          absent: 2,
        },
        {
          month: 'Jun',
          present: 20,
          absent: 0,
        },
        {
          month: 'Jul',
          present: 10,
          absent: 0,
        },
        {
          month: 'Aug',
          present: 29,
          absent: 0,
        },
        {
          month: 'Sep',
          present: 26,
          absent: 0,
        },
        {
          month: 'Oct',
          present: 25,
          absent: 2,
        },
        {
          month: 'Nov',
          present: 20,
          absent: 4,
        },
        {
          month: 'Dec',
          present: 14,
          absent: 0,
        },
      ],
    },
  },
];

export default staffDashDat;
