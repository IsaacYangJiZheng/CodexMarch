import React from 'react';
import List from '@mui/material/List';
import VerticalCollapse from '@anran/core/AppLayout/components/VerticalNav/VerticalCollapse';
import VerticalItem from '@anran/core/AppLayout/components/VerticalNav/VerticalItem';
import NavVerticalGroup from '@anran/core/AppLayout/components/VerticalNav/VerticalNavGroup';
import {useAuthUser} from '@anran/utility/AuthHooks';
import {RoutePermittedRole2, otpTestingEnabled} from 'shared/constants/AppConst';
import {RiDashboardLine} from 'react-icons/ri';
import BusinessIcon from '@mui/icons-material/Business';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import CampaignIcon from '@mui/icons-material/Campaign';
import BurstModeIcon from '@mui/icons-material/BurstMode';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventIcon from '@mui/icons-material/Event';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';

const SideBarMenuItem = () => {
  const {user} = useAuthUser();
  const [model, setModel] = React.useState([]);
  const [openGroupId, setOpenGroupId] = React.useState(null);
  const adminitemsmenus = [];
  React.useEffect(() => {
    if (user?.permission && user.permission.length > 0) {
      const dashboardChildren = [];

      // General
      if (
        user.permission.includes(RoutePermittedRole2.dashboard_management_view) ||
        user.permission.includes(RoutePermittedRole2.dashboard_branch_view)
      ) {
        dashboardChildren.push({
          id: 'general',
          title: 'General',
          messageId: 'General',
          type: 'item',
          icon: <RiDashboardLine />,
          url: '/dashboard',
        });
      }

      if (
        user.permission.includes(RoutePermittedRole2.dashboard_marketing_view)
      ) {
        dashboardChildren.push({
          id: 'marketing',
          title: 'Marketing',
          messageId: 'Marketing',
          type: 'item',
          icon: <RiDashboardLine />,
          url: '/marketing',
        });
      }

      if (dashboardChildren.length > 0) {
        adminitemsmenus.push({
          id: 'app-dashboard',
          title: 'Dashboard',
          messageId: 'sidebar.school.dashboard',
          type: 'collapse',
          children: dashboardChildren,
        });
      }

      if (
        user.permission.includes(RoutePermittedRole2.admin_role_view) ||
        user.permission.includes(RoutePermittedRole2.admin_area_view) ||
        user.permission.includes(RoutePermittedRole2.admin_branch_view) ||
        user.permission.includes(RoutePermittedRole2.admin_package_view)
      ) {
        const children = [];
        if (user.permission.includes(RoutePermittedRole2.admin_role_view)) {
          children.push({
            id: 'roles',
            title: 'Roles',
            messageId: 'sidebar.roles',
            type: 'item',
            icon: <LocalPoliceOutlinedIcon />,
            url: '/role',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.admin_area_view)) {
          children.push({
            id: 'area',
            title: 'Area',
            messageId: 'sidebar.area',
            type: 'item',
            icon: <FmdGoodOutlinedIcon />,
            url: '/area',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.admin_branch_view)) {
          children.push({
            id: 'branch',
            title: 'Branch',
            messageId: 'sidebar.branch',
            type: 'item',
            icon: <BusinessIcon />,
            url: '/branch',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.admin_package_view)) {
          children.push({
            id: 'package',
            title: 'Package',
            messageId: 'sidebar.package',
            type: 'item',
            icon: <CardGiftcardIcon />,
            url: '/package',
          });
        }
        if (children.length > 0) {
          adminitemsmenus.push({
            id: 'app-mgnt',
            title: 'Management',
            messageId: 'sidebar.group.admin',
            type: 'collapse',
            children: children,
          });
        }
      }
      // if (user.permission.includes(RoutePermittedRole2.admin_branch_view)) {
      //   adminitemsmenus.push({
      //     id: 'app-mgnt',
      //     title: 'Management',
      //     messageId: 'sidebar.group.admin',
      //     type: 'group',
      //     children: [
      //       {
      //         id: 'roles',
      //         title: 'Roles',
      //         messageId: 'sidebar.roles',
      //         type: 'item',
      //         icon: <LocalPoliceOutlinedIcon />,
      //         url: '/role',
      //       },
      //       {
      //         id: 'area',
      //         title: 'area',
      //         messageId: 'sidebar.area',
      //         type: 'item',
      //         icon: <FmdGoodOutlinedIcon />,
      //         url: '/area',
      //       },
      //       {
      //         id: 'branch',
      //         title: 'Branch',
      //         messageId: 'sidebar.branch',
      //         type: 'item',
      //         icon: <BusinessIcon />,
      //         url: '/branch',
      //       },
      //       // {
      //       //   id: 'voucher',
      //       //   title: 'voucher',
      //       //   messageId: 'Voucher',
      //       //   type: 'item',
      //       //   icon: <DiscountIcon />,
      //       //   url: '/voucher',
      //       // },
      //       {
      //         id: 'package',
      //         title: 'package',
      //         messageId: 'sidebar.package',
      //         type: 'item',
      //         icon: <CardGiftcardIcon />,
      //         url: '/package',
      //       },
      //     ],
      //   });
      // }
      if (
        user.permission.includes(RoutePermittedRole2.admin_banner_view) ||
        user.permission.includes(RoutePermittedRole2.admin_message_view) ||
        user.permission.includes(RoutePermittedRole2.admin_voucher_view)
      ) {
        const children = [];
        if (user.permission.includes(RoutePermittedRole2.admin_banner_view)) {
          children.push({
            id: 'Banner',
            title: 'Banner',
            messageId: 'sidebar.mobile.banner',
            type: 'item',
            icon: <BurstModeIcon />,
            url: '/mobile/banner',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.admin_message_view)) {
          children.push({
            id: 'Messages',
            title: 'Messages',
            messageId: 'sidebar.mobile.messages',
            type: 'item',
            icon: <CampaignIcon />,
            url: '/mobile/messages',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.admin_message_view)) {
          children.push({
            id: 'PopupMessages',
            title: 'Popup Messages',
            messageId: 'sidebar.mobile.popupMessages',
            type: 'item',
            icon: <MarkChatUnreadIcon />,
            url: '/mobile/popup-messages',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.admin_voucher_view)) {
          children.push({
            id: 'Voucher',
            title: 'Vouchers',
            messageId: 'sidebar.voucher',
            type: 'item',
            icon: <ConfirmationNumberOutlinedIcon />,
            url: '/voucher',
          });
        }
        if (children.length > 0) {
          adminitemsmenus.push({
            id: 'app-market',
            title: 'Marketing',
            messageId: 'sidebar.anran.market',
            type: 'collapse',
            children: children,
          });
        }
      }
      // if (user.permission.includes(RoutePermittedRole2.admin_branch_view)) {
      //   adminitemsmenus.push({
      //     id: 'app-market',
      //     title: 'Marketing',
      //     messageId: 'sidebar.anran.market',
      //     type: 'group',
      //     children: [
      //       {
      //         id: 'Banner',
      //         title: 'Banner',
      //         messageId: 'sidebar.mobile.banner',
      //         type: 'item',
      //         icon: <BurstModeIcon />,
      //         url: '/mobile/banner',
      //       },
      //       {
      //         id: 'Messages',
      //         title: 'Messages',
      //         messageId: 'sidebar.mobile.messages',
      //         type: 'item',
      //         icon: <CampaignIcon />,
      //         url: '/mobile/messages',
      //       },
      //       // {
      //       //   id: 'Campaign ',
      //       //   title: 'Campaign ',
      //       //   messageId: 'sidebar.package.campaign',
      //       //   type: 'item',
      //       //   icon: <LocalOfferOutlinedIcon />,
      //       //   url: '/campaign',
      //       // },
      //       {
      //         id: 'Voucher',
      //         title: 'Vouchers',
      //         messageId: 'sidebar.voucher',
      //         type: 'item',
      //         icon: <ConfirmationNumberOutlinedIcon />,
      //         url: '/voucher',
      //       },
      //     ],
      //   });
      // }
      if (
        user.permission.includes(RoutePermittedRole2.member_member_view) ||
        user.permission.includes(RoutePermittedRole2.member_feedback_view) 
      ) {
        const children = [];
        if (user.permission.includes(RoutePermittedRole2.member_member_view)) {
          children.push({
            id: 'members',
            title: 'Members',
            messageId: 'sidebar.members.info',
            type: 'item',
            icon: <PeopleAltIcon />,
            url: '/members',
            exact: true,
          });
        }
        if (user.permission.includes(RoutePermittedRole2.member_member_view)) {
          children.push({
            id: 'Transfer',
            title: 'Package Transfer',
            messageId: 'sidebar.members.transfer',
            type: 'item',
            icon: <TransferWithinAStationIcon />,
            url: '/package_transfer',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.member_member_view)) {
          children.push({
            id: 'member-data-import',
            title: 'import member',
            messageId: 'sidebar.members.import',
            type: 'item',
            icon: <UploadFileIcon />,
            url: '/memberImport',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.member_feedback_view)) {
          children.push({
            id: 'feedback',
            title: 'member feedback',
            messageId: 'sidebar.members.feedback',
            type: 'item',
            icon: <ReviewsOutlinedIcon />,
            url: '/MemberFeedback',
          });
        }
        if (
          otpTestingEnabled &&
          user.permission.includes(RoutePermittedRole2.member_otp_testing_view)
        ) {
          children.push({
            id: 'otp-testing',
            title: 'OTP Testing',
            messageId: 'sidebar.members.otpTesting',
            type: 'item',
            icon: <SmsOutlinedIcon />,
            url: '/members/otp-testing',
          });
        }
        if (children.length > 0) {
          adminitemsmenus.push({
            id: 'app-member-mgnt',
            title: 'Member Management',
            messageId: 'sidebar.members',
            type: 'collapse',
            children: children,
          });
        }
      }
      if (user.permission.includes(RoutePermittedRole2.member_booking_view)) {
        adminitemsmenus.push({
          id: 'app-booking-mgnt',
          title: 'Booking',
          messageId: 'sidebar.booking',
          type: 'collapse',
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
              id: 'current-checkin',
              title: 'checkin',
              messageId: 'sidebar.booking.current',
              type: 'item',
              icon: <EventNoteOutlinedIcon />,
              url: '/curent-booking',
            },
            {
              id: 'checkin',
              title: 'checkin',
              messageId: 'sidebar.booking.checkin',
              type: 'item',
              icon: <EventNoteOutlinedIcon />,
              url: '/booking',
            },
            {
              id: 'block-booking',
              title: 'block-booking',
              messageId: 'sidebar.booking.block',
              type: 'item',
              icon: <EventNoteOutlinedIcon />,
              url: '/block-booking',
            },
          ],
        });
      }
      if (
        user.permission.includes(RoutePermittedRole2.finance_sales_view) ||
        user.permission.includes(RoutePermittedRole2.finance_payments_view)
      ) {
        const children = [];
        if (user.permission.includes(RoutePermittedRole2.finance_sales_view)) {
          children.push({
            id: 'purchase',
            title: 'checkin',
            messageId: 'sidebar.package.sale',
            type: 'item',
            icon: <LocalMallOutlinedIcon />,
            url: '/orders',
          });
        }
        if (
          user.permission.includes(RoutePermittedRole2.finance_payments_view)
        ) {
          children.push({
            id: 'transactiondetails',
            title: 'checkin',
            messageId: 'sidebar.payments',
            type: 'item',
            icon: <MonetizationOnOutlinedIcon />,
            url: '/payments',
          });
        }
        if (
          user.permission.includes(RoutePermittedRole2.finance_payments_view)
        ) {
          children.push({
            id: 'member-deposits',
            title: 'member-deposits',
            messageId: 'sidebar.member.deposits',
            type: 'item',
            icon: <RequestQuoteOutlinedIcon />,
            url: '/member-deposits',
          });
        }
        if (children.length > 0) {
          adminitemsmenus.push({
            id: 'app-finance-mgnt',
            title: 'Sales',
            messageId: 'sidebar.sales',
            type: 'collapse',
            children: children,
          });
        }
      }
      if (
        user.permission.includes(RoutePermittedRole2.finance_sales_view) ||
        user.permission.includes(RoutePermittedRole2.finance_payments_view)
      ) {
        const children = [];
        if (user.permission.includes(RoutePermittedRole2.finance_sales_view)) {
          children.push({
            id: 'package-sales-history',
            title: 'package-sales-history',
            messageId: 'sidebar.package.sale.history',
            type: 'item',
            icon: <LocalMallOutlinedIcon />,
            url: '/orders-history',
          });
        }
        if (
          user.permission.includes(RoutePermittedRole2.finance_payments_view)
        ) {
          children.push({
            id: 'payments-history',
            title: 'payments-history',
            messageId: 'sidebar.payments.history',
            type: 'item',
            icon: <MonetizationOnOutlinedIcon />,
            url: '/payments-history',
          });
        }
        if (user.permission.includes(RoutePermittedRole2.finance_sales_view)) {
          children.push({
            id: 'deposit-history',
            title: 'deposit-history',
            messageId: 'sidebar.deposit.history',
            type: 'item',
            icon: <RequestQuoteOutlinedIcon />,
            url: '/deposit-history',
          });
        }
        if (
          user.permission.includes(RoutePermittedRole2.finance_payments_view)
        ) {
          children.push({
            id: 'order-cancellation',
            title: 'order-cancellation',
            messageId: 'sidebar.order.cancellation',
            type: 'item',
            icon: <RequestQuoteOutlinedIcon />,
            url: '/orders-cancellation',
          });
        }
        if (
          user.permission.includes(RoutePermittedRole2.finance_sales_view)
        ) {
          children.push({
              id: 'orders-import',
              title: 'orders-import',
              messageId: 'sidebar.order.import',
              type: 'item',
              icon: <UploadFileIcon />,
              url: '/orders-import',
            });
          }
        if (children.length > 0) {
          adminitemsmenus.push({
            id: 'finance',
            title: 'Finance',
            messageId: 'sidebar.finance',
            type: 'collapse',
            children: children,
          });
        }
      }
      // if (user.permission.includes(RoutePermittedRole2.finance_sales_view)) {
      //   adminitemsmenus.push({
      //     id: 'app-finance-mgnt',
      //     title: 'Purchase',
      //     messageId: 'sidebar.finance',
      //     type: 'group',
      //     children: [
      //       {
      //         id: 'purchase',
      //         title: 'checkin',
      //         messageId: 'sidebar.package.sale',
      //         type: 'item',
      //         icon: <LocalMallOutlinedIcon />,
      //         url: '/orders',
      //       },
      //       {
      //         id: 'transactiondetails',
      //         title: 'checkin',
      //         messageId: 'sidebar.payments',
      //         type: 'item',
      //         icon: <MonetizationOnOutlinedIcon />,
      //         url: '/payments',
      //       },
      //     ],
      //   });
      // }
      if (
        user.permission.includes(RoutePermittedRole2.admin_staff_view) ||
        user.permission.includes(RoutePermittedRole2.admin_staff_update) ||
        user.permission.includes(RoutePermittedRole2.hr_attendance_view)
      ) {
        const staffChildren = [];

        // Staff view permission
        if (user.permission.includes(RoutePermittedRole2.admin_staff_view)) {
          staffChildren.push({
            id: 'staff',
            title: 'Staff',
            messageId: 'sidebar.staff',
            type: 'item',
            icon: <GroupsIcon />,
            url: '/staff',
          });
        }

        // Staff update permission (edit/add staff)
        if (user.permission.includes(RoutePermittedRole2.admin_staff_update)) {
          staffChildren.push({
            id: 'staff-data-import',
            title: 'Import Staff',
            messageId: 'sidebar.staff.import',
            type: 'item',
            icon: <UploadFileIcon />,
            url: '/staffImport',
          });
        }

        // Staff attendance view permission
        if (user.permission.includes(RoutePermittedRole2.hr_attendance_view)) {
          staffChildren.push({
            id: 'staff-attendance',
            title: 'Staff Attendance',
            messageId: 'sidebar.staff.attendance',
            type: 'item',
            icon: <CalendarMonthIcon />,
            url: '/attendance',
          });
        }

        if (staffChildren.length > 0) {
          adminitemsmenus.push({
            id: 'staff-management',
            title: 'Staff Management',
            messageId: 'sidebar.management.staff',
            type: 'collapse',
            children: staffChildren,
          });
        }
      }
      // if (user.permission.includes(RoutePermittedRole2.admin_staff_update)) {
      //   adminitemsmenus.push({
      //     id: 'app-staff-mgnt',
      //     title: 'StaffManagement',
      //     messageId: 'sidebar.management.staff',
      //     type: 'collapse',
      //     children: [
      //       {
      //         id: 'staff',
      //         title: 'staff',
      //         messageId: 'sidebar.staff',
      //         type: 'item',
      //         icon: <GroupsIcon />,
      //         url: '/staff',
      //       },
      //       {
      //         id: 'staff-data-import',
      //         title: 'import staff',
      //         messageId: 'sidebar.staff.import',
      //         type: 'item',
      //         icon: <UploadFileIcon />,
      //         url: '/staffImport',
      //       },
      //     ],
      //   });
      // } else {
      //   if (user.permission.includes(RoutePermittedRole2.admin_staff_view)) {
      //     adminitemsmenus.push({
      //       id: 'app-staff-mgnt',
      //       title: 'StaffManagement',
      //       messageId: 'sidebar.management.staff',
      //       type: 'collapse',
      //       children: [
      //         {
      //           id: 'staff',
      //           title: 'staff',
      //           messageId: 'sidebar.staff',
      //           type: 'item',
      //           icon: <GroupsIcon />,
      //           url: '/staff',
      //         },
      //       ],
      //     });
      //   }
      // }
      // if (user.permission.includes(RoutePermittedRole2.hr_attendance_view)) {
      //   adminitemsmenus.push({
      //     id: 'staff-attendance',
      //     title: 'staff Attendance',
      //     messageId: 'sidebar.staff.attendance',
      //     type: 'item',
      //     icon: <CalendarMonthIcon />,
      //     url: '/attendance',
      //   });
      // }
      if (user.permission.includes(RoutePermittedRole2.finance_report_view)) {
        adminitemsmenus.push({
          id: 'app-report-mgnt',
          title: 'Reports',
          messageId: 'sidebar.report',
          type: 'collapse',
          children: [
            {
              id: 'daily-outlet-sales',
              title: 'Daily Outlet Sales',
              messageId: 'sidebar.report.dailyOutletSalesReport',
              type: 'item',
              icon: <AssessmentIcon />,
              url: '/dailyOutletSalesReport',
            },
            {
              id: 'custom-outlet-sales',
              title: 'Custom Outlet Sales',
              messageId: 'sidebar.report.customOutletSalesReport',
              type: 'item',
              icon: <AssessmentIcon />,
              url: '/customOutletSalesReport',
            },
            // {
            //   id: 'category-sales',
            //   title: 'Category Sales',
            //   messageId: 'sidebar.report.categorySalesReport',
            //   type: 'item',
            //   icon: <AssessmentIcon />,
            //   url: '/categorySalesReport',
            // },
            {
              id: 'item-sales',
              title: 'Item Sales',
              messageId: 'sidebar.report.itemSalesReport',
              type: 'item',
              icon: <AssessmentIcon />,
              url: '/itemSalesReport',
            },
            {
              id: 'customer-check-in',
              title: 'Customer Check In',
              messageId: 'sidebar.report.customerCheckInReport',
              type: 'item',
              icon: <AssessmentIcon />,
              url: '/customerCheckInReport',
            },
            {
              id: 'inter-branch-costing',
              title: 'Inter-Branch Costing Report',
              messageId: 'sidebar.report.interbranchReport',
              type: 'item',
              icon: <AssessmentIcon />,
              url: '/interbranchReport',
            },
            {
              id: 'finance-report',
              title: 'Finance Report',
              messageId: 'sidebar.report.financeReport',
              type: 'item',
              icon: <AssessmentIcon />,
              url: '/financeReport',
            },
            {
              id: 'daily-confirmation-history-logs',
              title: 'Daily Confirmation History Logs',
              messageId: 'sidebar.report.confirmationHistoryLogs',
              type: 'item',
              icon: <AssessmentIcon />,
              url: '/confirmationHistoryLogs',
            },
            // {
            //   id: 'customer-walk-in',
            //   title: 'Customer Walk In',
            //   messageId: 'sidebar.report.customerWalkInReport',
            //   type: 'item',
            //   icon: <AssessmentIcon />,
            //   url: '/customerWalkInReport',
            // },
          ],
        });
      }
    }
    if (adminitemsmenus.length > 0) {
      setModel(adminitemsmenus);
    }
    console.log('adminitemsmenus', adminitemsmenus);
  }, [user?.permission]);

  return (
    <List
      sx={{
        position: 'relative',
        padding: 0,
      }}
      component='div'
    >
      {model.map((item) => (
        <React.Fragment key={item.id}>
          {item.type === 'group' && <NavVerticalGroup item={item} level={0} />}

          {item.type === 'collapse' && (
            <VerticalCollapse
              item={item}
              level={0}
              openGroupId={openGroupId}
              setOpenGroupId={setOpenGroupId}
            />
          )}

          {item.type === 'item' && <VerticalItem item={item} level={0} />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default SideBarMenuItem;
