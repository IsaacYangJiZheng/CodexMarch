// import {RoutePermittedRole} from 'shared/constants/AppConst';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessIcon from '@mui/icons-material/Business';
import {RiDashboardLine} from 'react-icons/ri';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import PaymentIcon from '@mui/icons-material/Payment';
import ListIcon from '@mui/icons-material/List';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CampaignIcon from '@mui/icons-material/Campaign';
import BurstModeIcon from '@mui/icons-material/BurstMode';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
export const emptyRoutesConfig = [];

const financeRoutesConfig = [
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
      // {
      //   id: 'area',
      //   title: 'area',
      //   messageId: 'sidebar.area',
      //   type: 'item',
      //   icon: <FmdGoodOutlinedIcon />,
      //   url: '/roles2',
      // },
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
    ],
  },
  {
    id: 'app-mgnt-1',
    title: 'Management-1',
    messageId: 'sidebar.anran.admin',
    type: 'group',
    children: [
      {
        id: 'roles',
        title: 'Roles',
        messageId: 'sidebar.staff.roles',
        type: 'item',
        icon: <BusinessIcon />,
        url: '/roles',
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
        url: '/members/info',
      },
      {
        id: 'Transfer',
        title: 'Package Transfer',
        messageId: 'sidebar.members.transfer',
        type: 'item',
        icon: <TransferWithinAStationIcon />,
        url: '/members/transfercredits',
      },
    ],
  },
  {
    id: 'app-booking-mgnt',
    title: 'Booking',
    messageId: 'sidebar.booking',
    type: 'group',
    children: [
      {
        id: 'booking',
        title: 'booking',
        messageId: 'sidebar.booking.checkin',
        type: 'item',
        icon: <CalendarMonthIcon />,
        url: '/booking',
      },
      {
        id: 'checkin',
        title: 'checkin',
        messageId: 'sidebar.booking.new',
        type: 'item',
        icon: <EventIcon />,
        url: '/members/membercheckin',
      },
    ],
  },
  {
    id: 'app-finance-mgnt',
    title: 'Purchase',
    messageId: 'sidebar.purchase',
    type: 'group',
    children: [
      {
        id: 'direct',
        title: 'checkin',
        messageId: 'sidebar.purchase.direct',
        type: 'item',
        icon: <PaymentIcon />,
        url: '/purchasedetails-direct',
      },
      {
        id: 'walkin',
        title: 'checkin',
        messageId: 'sidebar.purchase.walkin',
        type: 'item',
        icon: <DirectionsWalkIcon />,
        url: '/purchasedetail-walkin',
      },
      {
        id: 'transactiondetails',
        title: 'checkin',
        messageId: 'sidebar.purchase.trx',
        type: 'item',
        icon: <ListIcon />,
        url: '/transactiondetails',
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
        url: '/staff/attendance',
      },
    ],
  },
  {
    id: 'app-report',
    title: 'Reports',
    messageId: 'sidebar.reports',
    type: 'group',
    children: [
      {
        id: 'reports.usage',
        title: 'Reports Usage',
        messageId: 'sidebar.reports.usage',
        type: 'item',
        icon: <AssessmentOutlinedIcon />,
        url: 'reports/room',
      },
      // {
      //   id: 'reports.package',
      //   title: 'Reports Package',
      //   messageId: 'sidebar.reports.package',
      //   type: 'item',
      //   icon: <AssessmentOutlinedIcon />,
      //   url: '/packagereport',
      // },
    ],
  },
];
export default financeRoutesConfig;
