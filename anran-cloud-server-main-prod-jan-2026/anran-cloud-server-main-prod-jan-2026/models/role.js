const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const rolePermissionSchema = new Schema({
  view: {
    type: Boolean,
    required: true,
  },
  create: {
    type: Boolean,
    required: true,
  },
  update: {
    type: Boolean,
    required: true,
  },
  delete: {
    type: Boolean,
    required: true,
  },
});

const roleDashboardPermissionSchema = new Schema({
  view: {
    type: Boolean,
    required: true,
  },
});

const roleSchema = new Schema({
  role_name: { type: String, required: true, unique: true },
  dashboard_branch: roleDashboardPermissionSchema,
  dashboard_management: roleDashboardPermissionSchema,
  dashboard_finance: roleDashboardPermissionSchema,
  dashboard_sales: roleDashboardPermissionSchema,
  dashboard_crm: roleDashboardPermissionSchema,
  dashboard_marketing: roleDashboardPermissionSchema,
  admin_role: rolePermissionSchema,
  admin_area: rolePermissionSchema,
  admin_banner: rolePermissionSchema,
  admin_message: rolePermissionSchema,
  admin_voucher: rolePermissionSchema,
  admin_staff: rolePermissionSchema,
  admin_branch: rolePermissionSchema,
  admin_room: rolePermissionSchema,
  admin_package: rolePermissionSchema,
  member_member: rolePermissionSchema,
  member_booking: rolePermissionSchema,
  member_checkin: rolePermissionSchema,
  member_transfer: rolePermissionSchema,
  member_feedback: rolePermissionSchema,
  member_otp_testing: rolePermissionSchema,
  finance_sales: rolePermissionSchema,
  finance_payments: rolePermissionSchema,
  finance_purchase: rolePermissionSchema,
  finance_report: rolePermissionSchema,
  hr_attendance: rolePermissionSchema,
  // branch: [{ type: mongoose.Schema.Types.ObjectId, ref: "branch" }],
  // all_branch: { type: Boolean, required: true },
  status_active: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model("roles", roleSchema);
