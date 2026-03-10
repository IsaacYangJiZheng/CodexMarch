// import {RoutePermittedRole} from 'shared/constants/AppConst';
// import FaceIcon from '@mui/icons-material/Face';
// import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessIcon from '@mui/icons-material/Business';
// import WallpaperIcon from '@mui/icons-material/Wallpaper';
// import OverviewIcon from '@mui/icons-material/Layers';
// import DescriptionIcon from '@mui/icons-material/Description';
// import PaidIcon from '@mui/icons-material/Paid';
// import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
// import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
// import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import {RiDashboardLine} from 'react-icons/ri';
// import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
// import WorkspacesIcon from '@mui/icons-material/Workspaces';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
// import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
// import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
// import PaymentIcon from '@mui/icons-material/Payment';
// import ListIcon from '@mui/icons-material/List';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CampaignIcon from '@mui/icons-material/Campaign';
import BurstModeIcon from '@mui/icons-material/BurstMode';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
// import DiscountIcon from '@mui/icons-material/Discount';
// import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';

const adminRoutesConfig = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    messageId: 'sidebar.school.dashboard',
    type: 'item',
    icon: <RiDashboardLine />,
    url: '/dashboard',
  },
  {
    id: 'app-mgnt',
    title: 'Management',
    messageId: 'sidebar.group.admin',
    type: 'group',
    children: [
      {
        id: 'roles',
        title: 'Roles',
        messageId: 'sidebar.roles',
        type: 'item',
        icon: <LocalPoliceOutlinedIcon />,
        url: '/role',
      },
      {
        id: 'area',
        title: 'area',
        messageId: 'sidebar.area',
        type: 'item',
        icon: <FmdGoodOutlinedIcon />,
        url: '/area',
      },
      {
        id: 'branch',
        title: 'Branch',
        messageId: 'sidebar.branch',
        type: 'item',
        icon: <BusinessIcon />,
        url: '/branch',
      },
      // {
      //   id: 'voucher',
      //   title: 'voucher',
      //   messageId: 'Voucher',
      //   type: 'item',
      //   icon: <DiscountIcon />,
      //   url: '/voucher',
      // },
      {
        id: 'package',
        title: 'package',
        messageId: 'sidebar.package',
        type: 'item',
        icon: <CardGiftcardIcon />,
        url: '/package',
      },
    ],
  },
  {
    id: 'app-market',
    title: 'Marketing',
    messageId: 'sidebar.anran.market',
    type: 'group',
    children: [
      {
        id: 'Banner',
        title: 'Banner',
        messageId: 'sidebar.mobile.banner',
        type: 'item',
        icon: <BurstModeIcon />,
        url: '/mobile/banner',
      },
      {
        id: 'Messages',
        title: 'Messages',
        messageId: 'sidebar.mobile.messages',
        type: 'item',
        icon: <CampaignIcon />,
        url: '/mobile/messages',
      },
      // {
      //   id: 'Campaign ',
      //   title: 'Campaign ',
      //   messageId: 'sidebar.package.campaign',
      //   type: 'item',
      //   icon: <LocalOfferOutlinedIcon />,
      //   url: '/campaign',
      // },
      {
        id: 'Voucher',
        title: 'Vouchers',
        messageId: 'sidebar.voucher',
        type: 'item',
        icon: <ConfirmationNumberOutlinedIcon />,
        url: '/voucher',
      },
    ],
  },
  {
    id: 'app-member-mgnt',
    title: 'Member Management',
    messageId: 'sidebar.members',
    type: 'group',
    children: [
      {
        id: 'members',
        title: 'Members',
        messageId: 'sidebar.members.info',
        type: 'item',
        icon: <PeopleAltIcon />,
        url: '/members',
      },
      // {
      //   id: 'Transfer',
      //   title: 'Package Transfer',
      //   messageId: 'sidebar.members.transfer',
      //   type: 'item',
      //   icon: <TransferWithinAStationIcon />,
      //   url: '/transfercredits',
      // },
    ],
  },
  {
    id: 'app-booking-mgnt',
    title: 'Booking',
    messageId: 'sidebar.booking',
    type: 'group',
    children: [
      {
        id: 'booking-floor',
        title: 'booking',
        messageId: 'sidebar.booking.calendar.day',
        type: 'item',
        icon: <EventIcon />,
        url: '/floor/timeslots',
      },
      // {
      //   id: 'booking',
      //   title: 'booking',
      //   messageId: 'sidebar.booking.calendar.week',
      //   type: 'item',
      //   icon: <CalendarMonthIcon />,
      //   url: '/timeslots',
      // },
      {
        id: 'checkin',
        title: 'checkin',
        messageId: 'sidebar.booking.checkin',
        type: 'item',
        icon: <EventNoteOutlinedIcon />,
        url: '/booking',
      },
    ],
  },
  {
    id: 'app-finance-mgnt',
    title: 'Purchase',
    messageId: 'sidebar.finance',
    type: 'group',
    children: [
      {
        id: 'purchase',
        title: 'checkin',
        messageId: 'sidebar.package.sale',
        type: 'item',
        icon: <LocalMallOutlinedIcon />,
        url: '/orders',
      },
      {
        id: 'transactiondetails',
        title: 'checkin',
        messageId: 'sidebar.payments',
        type: 'item',
        icon: <MonetizationOnOutlinedIcon />,
        url: '/payments',
      },
    ],
  },
  {
    id: 'app-staff-mgnt',
    title: 'StaffManagement',
    messageId: 'sidebar.management.staff',
    type: 'group',
    children: [
      {
        id: 'staff',
        title: 'staff',
        messageId: 'sidebar.staff',
        type: 'item',
        icon: <GroupsIcon />,
        url: '/staff',
      },
      {
        id: 'staff-attendance',
        title: 'staff Attendance',
        messageId: 'sidebar.staff.attendance',
        type: 'item',
        icon: <CalendarMonthIcon />,
        url: '/attendance',
      },
    ],
  },
  // {
  //   id: 'app-report',
  //   title: 'Reports',
  //   messageId: 'sidebar.reports',
  //   type: 'group',
  //   children: [
  //     {
  //       id: 'reports.usage',
  //       title: 'Reports Usage',
  //       messageId: 'sidebar.reports.usage',
  //       type: 'item',
  //       icon: <AssessmentOutlinedIcon />,
  //       url: '/reports',
  //     },
  //     // {
  //     //   id: 'reports.package',
  //     //   title: 'Reports Package',
  //     //   messageId: 'sidebar.reports.package',
  //     //   type: 'item',
  //     //   icon: <AssessmentOutlinedIcon />,
  //     //   url: '/packagereport',
  //     // },
  //   ],
  // },
];
export default adminRoutesConfig;
