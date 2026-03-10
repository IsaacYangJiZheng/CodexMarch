const jwt = require("jsonwebtoken");
const { ADMIN_USERNAME } = process.env;
const { ADMIN_PASSWORD } = process.env;
const Staff = require("../models/staff");

module.exports = {
  loginVerify,
  mobileLoginVerify,
  getUserInfo,
};

function getRolesList(roles, admin) {
  if (roles && admin === false) {
    const ls = [];
    //admin_role
    if (roles.admin_role && roles.admin_role.view) {
      ls.push("admin_role_view");
    }
    if (roles.admin_role && roles.admin_role.update) {
      ls.push("admin_role_update");
    }
    if (roles.admin_role && roles.admin_role.create) {
      ls.push("admin_role_create");
    }
    if (roles.admin_role && roles.admin_role.delete) {
      ls.push("admin_role_delete");
    }
    //admin_area
    if (roles.admin_area && roles.admin_area.view) {
      ls.push("admin_area_view");
    }
    if (roles.admin_area && roles.admin_area.update) {
      ls.push("admin_area_update");
    }
    if (roles.admin_area && roles.admin_area.create) {
      ls.push("admin_area_create");
    }
    if (roles.admin_area && roles.admin_area.delete) {
      ls.push("admin_area_delete");
    }
    // admin_banner
    if (roles.admin_banner && roles.admin_banner.view) {
      ls.push("admin_banner_view");
    }
    if (roles.admin_banner && roles.admin_banner.create) {
      ls.push("admin_banner_create");
    }
    if (roles.admin_banner && roles.admin_banner.delete) {
      ls.push("admin_banner_delete");
    }
    if (roles.admin_banner && roles.admin_banner.update) {
      ls.push("admin_banner_update");
    }
    //admin_message
    if (roles.admin_message && roles.admin_message.view) {
      ls.push("admin_message_view");
    }
    if (roles.admin_message && roles.admin_message.create) {
      ls.push("admin_message_create");
    }
    if (roles.admin_message && roles.admin_message.delete) {
      ls.push("admin_message_delete");
    }
    if (roles.admin_message && roles.admin_message.update) {
      ls.push("admin_message_update");
    }
    //admin_voucher
    if (roles.admin_voucher && roles.admin_voucher.view) {
      ls.push("admin_voucher_view");
    }
    if (roles.admin_voucher && roles.admin_voucher.update) {
      ls.push("admin_voucher_update");
    }
    if (roles.admin_voucher && roles.admin_voucher.create) {
      ls.push("admin_voucher_create");
    }
    if (roles.admin_voucher && roles.admin_voucher.delete) {
      ls.push("admin_voucher_delete");
    }
    //admin_staff
    if (roles.admin_staff && roles.admin_staff.view) {
      ls.push("admin_staff_view");
    }
    if (roles.admin_staff && roles.admin_staff.update) {
      ls.push("admin_staff_update");
    }
    if (roles.admin_staff && roles.admin_staff.create) {
      ls.push("admin_staff_create");
    }
    if (roles.admin_staff && roles.admin_staff.delete) {
      ls.push("admin_staff_delete");
    }
    //branch
    if (roles.admin_branch && roles.admin_branch.view) {
      ls.push("admin_branch_view");
    }
    if (roles.admin_branch && roles.admin_branch.update) {
      ls.push("admin_branch_update");
    }
    if (roles.admin_branch && roles.admin_branch.create) {
      ls.push("admin_branch_create");
    }
    if (roles.admin_branch && roles.admin_branch.delete) {
      ls.push("admin_branch_delete");
    }
    //room
    if (roles.admin_room && roles.admin_room.view) {
      ls.push("admin_room_view");
    }
    if (roles.admin_room && roles.admin_room.update) {
      ls.push("admin_room_update");
    }
    if (roles.admin_room && roles.admin_room.create) {
      ls.push("admin_room_create");
    }
    if (roles.admin_room && roles.admin_room.delete) {
      ls.push("admin_room_delete");
    }
    //package
    if (roles.admin_package && roles.admin_package.view) {
      ls.push("admin_package_view");
    }
    if (roles.admin_package && roles.admin_package.update) {
      ls.push("admin_package_update");
    }
    if (roles.admin_package && roles.admin_package.create) {
      ls.push("admin_package_create");
    }
    if (roles.admin_package && roles.admin_package.delete) {
      ls.push("admin_package_delete");
    }
    //member_member
    if (roles.member_member && roles.member_member.view) {
      ls.push("member_member_view");
    }
    if (roles.member_member && roles.member_member.update) {
      ls.push("member_member_update");
    }
    if (roles.member_member && roles.member_member.create) {
      ls.push("member_member_create");
    }
    if (roles.member_member && roles.member_member.delete) {
      ls.push("member_member_delete");
    }
    //member_booking
    if (roles.member_booking && roles.member_booking.view) {
      ls.push("member_booking_view");
    }
    if (roles.member_booking && roles.member_booking.update) {
      ls.push("member_booking_update");
    }
    if (roles.member_booking && roles.member_booking.create) {
      ls.push("member_booking_create");
    }
    if (roles.member_booking && roles.member_booking.delete) {
      ls.push("member_booking_delete");
    }
    //member_checkin
    if (roles.member_checkin && roles.member_checkin.view) {
      ls.push("member_checkin_view");
    }
    if (roles.member_checkin && roles.member_checkin.update) {
      ls.push("member_checkin_update");
    }
    if (roles.member_checkin && roles.member_checkin.create) {
      ls.push("member_checkin_create");
    }
    if (roles.member_checkin && roles.member_checkin.delete) {
      ls.push("member_checkin_delete");
    }
    //member_transfer
    if (roles.member_transfer && roles.member_transfer.view) {
      ls.push("member_transfer_view");
    }
    if (roles.member_transfer && roles.member_transfer.update) {
      ls.push("member_transfer_update");
    }
    if (roles.member_transfer && roles.member_transfer.create) {
      ls.push("member_transfer_create");
    }
    if (roles.member_transfer && roles.member_transfer.delete) {
      ls.push("member_transfer_delete");
    }
    //member_feedback
    if (roles.member_feedback && roles.member_feedback.view) {
      ls.push("member_feedback_view");
    }
    if (roles.member_feedback && roles.member_feedback.update) {
      ls.push("member_feedback_update");
    }
    if (roles.member_feedback && roles.member_feedback.create) {
      ls.push("member_feedback_create");
    }
    if (roles.member_feedback && roles.member_feedback.delete) {
      ls.push("member_feedback_delete");
    }
    //finance_report
    if (roles.finance_report && roles.finance_report.view) {
      ls.push("finance_report_view");
    }
    if (roles.finance_report && roles.finance_report.update) {
      ls.push("finance_report_update");
    }
    if (roles.finance_report && roles.finance_report.create) {
      ls.push("finance_report_create");
    }
    if (roles.finance_report && roles.finance_report.delete) {
      ls.push("finance_report_delete");
    }
    //finance_sales
    if (roles.finance_sales && roles.finance_sales.view) {
      ls.push("finance_sales_view");
    }
    if (roles.finance_sales && roles.finance_sales.update) {
      ls.push("finance_sales_update");
    }
    if (roles.finance_sales && roles.finance_sales.create) {
      ls.push("finance_sales_create");
    }
    if (roles.finance_sales && roles.finance_sales.delete) {
      ls.push("finance_sales_delete");
    }
    //finance_payments
    if (roles.finance_payments && roles.finance_payments.view) {
      ls.push("finance_payments_view");
    }
    if (roles.finance_payments && roles.finance_payments.update) {
      ls.push("finance_payments_update");
    }
    if (roles.finance_payments && roles.finance_payments.create) {
      ls.push("finance_payments_create");
    }
    if (roles.finance_payments && roles.finance_payments.delete) {
      ls.push("finance_payments_delete");
    }
    //finance_purchase
    if (roles.finance_purchase && roles.finance_purchase.view) {
      ls.push("finance_purchase_view");
    }
    if (roles.finance_purchase && roles.finance_purchase.update) {
      ls.push("finance_purchase_update");
    }
    if (roles.finance_purchase && roles.finance_purchase.create) {
      ls.push("finance_purchase_create");
    }
    if (roles.finance_purchase && roles.finance_purchase.delete) {
      ls.push("finance_purchase_delete");
    }

    //hr_attendance
    if (roles.hr_attendance && roles.hr_attendance.view) {
      ls.push("hr_attendance_view");
    }
    if (roles.hr_attendance && roles.hr_attendance.update) {
      ls.push("hr_attendance_update");
    }
    if (roles.hr_attendance && roles.hr_attendance.create) {
      ls.push("hr_attendance_create");
    }
    if (roles.hr_attendance && roles.hr_attendance.delete) {
      ls.push("hr_attendance_delete");
    }
    //dashboard
    if (roles.dashboard_branch && roles.dashboard_branch.view) {
      ls.push("dashboard_branch_view");
    }
    if (roles.dashboard_management && roles.dashboard_management.view) {
      ls.push("dashboard_management_view");
    }
    if (roles.dashboard_finance && roles.dashboard_finance.view) {
      ls.push("dashboard_finance_view");
    }
    if (roles.dashboard_sales && roles.dashboard_sales.view) {
      ls.push("dashboard_sales_view");
    }
    if (roles.dashboard_crm && roles.dashboard_crm.view) {
      ls.push("dashboard_crm_view");
    }
    if (roles.dashboard_marketing && roles.dashboard_marketing.view) {
      ls.push("dashboard_marketing_view");
    }
    return ls;
  } else if (admin === true) {
    const ls = [
      "admin_role_view",
      "admin_role_update",
      "admin_role_delete",
      "admin_role_create",

      "admin_area_view",
      "admin_area_update",
      "admin_area_delete",
      "admin_area_create",

      "admin_banner_view",
      "admin_banner_create",
      "admin_banner_update",
      "admin_banner_delete",

      "admin_message_view",
      "admin_message_delete",
      "admin_message_create",
      "admin_message_update",

      "admin_voucher_view",
      "admin_voucher_create",
      "admin_voucher_update",
      "admin_voucher_delete",

      "admin_staff_view",
      "admin_staff_create",
      "admin_staff_update",
      "admin_staff_delete",

      "admin_branch_view",
      "admin_branch_create",
      "admin_branch_update",
      "admin_branch_delete",

      "admin_room_view",
      "admin_room_create",
      "admin_room_update",
      "admin_room_delete",

      "admin_package_view",
      "admin_package_create",
      "admin_package_update",
      "admin_package_delete",

      "member_member_view",
      "member_member_create",
      "member_member_update",
      "member_member_delete",

      "member_booking_view",
      "member_booking_create",
      "member_booking_update",
      "member_booking_delete",

      "member_checkin_view",
      "member_checkin_create",
      "member_checkin_update",
      "member_checkin_delete",

      "member_transfer_view",
      "member_transfer_create",
      "member_transfer_update",
      "member_transfer_delete",

      "member_feedback_view",
      "member_feedback_create",
      "member_feedback_update",
      "member_feedback_delete",
      "member_otp_testing_view",

      "finance_sales_view",
      "finance_sales_create",
      "finance_sales_update",
      "finance_sales_delete",

      "finance_payments_view",
      "finance_payments_create",
      "finance_payments_update",
      "finance_payments_delete",

      "finance_purchase_view",
      "finance_purchase_create",
      "finance_purchase_update",
      "finance_purchase_delete",

      "finance_report_view",
      "finance_report_create",
      "finance_report_update",
      "finance_report_delete",

      "hr_attendance_view",
      "hr_attendance_update",
      "hr_attendance_create",
      "hr_attendance_delete",

      "dashboard_branch_view",
      "dashboard_management_view",
      "dashboard_finance_view",
      "dashboard_sales_view",
      "dashboard_crm_view",
      "dashboard_marketing_view",
    ];
    return ls;
  }
  return [];
}

async function loginVerify(body) {
  try {
    var username = body.username;
    var password = body.password;
    if (!(username && password)) {
      return {
        status: false,
        message: "Username and Password is required",
        username: username,
      };
    } else {
      const obj = await Staff.find({
        $and: [
          { userName: { $eq: body.username } },
          { loginKey: { $eq: body.password } },
          { statusActive: { $eq: true } },
        ],
      }).populate({
        path: "roles",
      });
      if (
        (obj && obj.length != 0) ||
        (username === ADMIN_USERNAME && password === ADMIN_PASSWORD)
      ) {
        if (username === ADMIN_USERNAME) {
          body.uid = "admin";
          const payload = {
            username: body.username,
            uid: "admin",
          };
          const token = jwt.sign(payload, process.env.TOKEN_KEY, {
            expiresIn: "1d",
          });
          return {
            status: true,
            statusCode: 200,
            message: "Login successfull",
            token,
            user: {
              username: username,
              role: "admin",
              branchAccess: "all",
              profile: {
                name: "admin",
                email: "admin.demo.com",
                phone: "1234",
                photoURL: "",
              },
              permission:
                obj && obj.length != 0 && username !== "admin"
                  ? getRolesList(obj[0].roles, false)
                  : getRolesList([], true),
            },
            // username: username,
            // roles:
            //   obj && obj.length != 0 && username !== "admin"
            //     ? getRolesList(obj[0].roles, false)
            //     : getRolesList([], true),
          };
        }
        body.uid = obj[0]._id;
        const payload = {
          username: body.username,
          uid: obj[0]._id,
        };
        const token = jwt.sign(payload, process.env.TOKEN_KEY, {
          expiresIn: "1d",
        });
        return {
          status: true,
          statusCode: 200,
          message: "Login successfull",
          token,
          user: {
            username: username,
            id: obj[0]._id,
            role: obj[0].roles.role_name,
            branchAccess: obj[0].all_branch ? "all" : "limited",
            profile: {
              name: obj[0].name,
              email: obj[0].emailAddress,
              phone: obj[0].mobileNumber,
              photoURL: obj[0].profileImageUrl,
            },
            permission:
              obj && obj.length != 0 && username !== "admin"
                ? getRolesList(obj[0].roles, false)
                : getRolesList([], true),
          },
          // username: username,
          // roles:
          //   obj && obj.length != 0 && username !== "admin"
          //     ? getRolesList(obj[0].roles, false)
          //     : getRolesList([], true),
        };
      } else {
        return {
          status: false,
          statusCode: 404,
          message: "Username and Password is Not Valid!!!",
          username: username,
        };
      }
    }
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function mobileLoginVerify(body) {
  try {
    var username = body.username;
    var password = body.password;
    if (!(username && password)) {
      return {
        status: false,
        message: "Username and Password is required",
        username: username,
      };
    } else {
      const obj = await Staff.find({
        $and: [
          { userName: { $eq: body.username } },
          { loginKey: { $eq: body.password } },
          { statusActive: { $eq: true } },
        ],
      })
        .populate({
          path: "roles",
        })
        .populate({ path: "branch" });
      if (
        (obj && obj.length != 0) ||
        (username === ADMIN_USERNAME && password === ADMIN_PASSWORD)
      ) {
        if (username === ADMIN_USERNAME) {
          body.uid = "admin";
          const token = jwt.sign(body, process.env.TOKEN_KEY, {
            expiresIn: "1d",
          });
          return {
            status: true,
            statusCode: 200,
            message: "Login successfull",
            token,
            user: {
              username: username,
              role: "admin",
              profile: {
                name: "admin",
                email: "admin.demo.com",
                phone: "1234",
                photoURL: "",
              },
              permission:
                obj && obj.length != 0 && username !== "admin"
                  ? getRolesList(obj[0].roles, false)
                  : getRolesList([], true),
            },
            // username: username,
            // roles:
            //   obj && obj.length != 0 && username !== "admin"
            //     ? getRolesList(obj[0].roles, false)
            //     : getRolesList([], true),
          };
        }
        body.uid = obj[0]._id;
        const token = jwt.sign(body, process.env.TOKEN_KEY, {
          expiresIn: "1d",
        });
        return {
          status: true,
          statusCode: 200,
          message: "Login successfull",
          token,
          user: {
            username: username,
            id: obj[0]._id,
            role: obj[0].roles.role_name,
            profile: {
              name: obj[0].name,
              email: obj[0].emailAddress,
              phone: obj[0].mobileNumber,
              photoURL: obj[0].profileImageUrl,
            },
            permission:
              obj && obj.length != 0 && username !== "admin"
                ? getRolesList(obj[0].roles, false)
                : getRolesList([], true),
            branches: obj[0].branch,
          },
          // username: username,
          // roles:
          //   obj && obj.length != 0 && username !== "admin"
          //     ? getRolesList(obj[0].roles, false)
          //     : getRolesList([], true),
        };
      } else {
        return {
          status: false,
          statusCode: 404,
          message: "Username and Password is Not Valid!!!",
          username: username,
        };
      }
    }
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function getUserInfo(body) {
  try {
    var username = body.username;
    var uid = body.uid;
    if (username === ADMIN_USERNAME) {
      return {
        status: true,
        statusCode: 200,
        message: "Login successfull",
        user: {
          username: username,
          role: "admin",
          branchAccess: "all",
          profile: {
            name: "admin",
            email: "admin@demo.com",
            phone: "1234",
            photoURL: "",
          },
          permission: getRolesList([], true),
        },
      };
    } else {
      if (!(username && uid)) {
        return {
          status: false,
          message: "Username and uid is required",
          user: null,
        };
      } else {
        const obj = await Staff.find({
          $and: [
            { userName: { $eq: body.username } },
            { _id: { $eq: body.uid } },
            { statusActive: { $eq: true } },
          ],
        }).populate({
          path: "roles",
        });
        if ((obj && obj.length != 0) || username === ADMIN_USERNAME) {
          return {
            status: true,
            statusCode: 200,
            message: "Login successfull",
            user: {
              username: username,
              id: obj[0]._id,
              role: obj[0].roles.role_name,
              branchAccess: obj[0].all_branch ? "all" : "limited",
              profile: {
                name: obj[0].name,
                email: obj[0].email,
                phone: obj[0].mobileNumber,
                photoURL: obj[0].profileImageUrl,
              },
              permission:
                obj && obj.length != 0 && username !== "admin"
                  ? getRolesList(obj[0].roles, false)
                  : getRolesList([], true),
            },
          };
        } else {
          return {
            status: false,
            message: "Username and Password is Not Valid!!!",
            user: null,
          };
        }
      }
    }
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}
