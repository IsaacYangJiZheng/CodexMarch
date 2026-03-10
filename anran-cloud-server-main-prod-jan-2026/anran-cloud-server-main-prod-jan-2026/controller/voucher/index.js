const Voucher = require("../../models/voucher");
const MemberVoucher = require("../../models/memberVoucher");
const dayjs = require("dayjs");

module.exports = {
  generateNewMemberVoucher,
};

async function generateNewMemberVoucher(member) {
  try {
    // let startDate = new Date(new Date(query.order_date).setHours(0, 0, 0));
    // let endDate = new Date(
    //   new Date(query.order_date).setHours(23, 59, 59, 999)
    // );
    const memberRegisterDate = dayjs(member.memberDate);
    const voucher = await Voucher.findOne({
      voucherType: { $eq: "New Member" },
    });
    if (voucher.validityType === "Month") {
      const validDate = memberRegisterDate.add(
        parseInt(voucher.validityValue),
        "month"
      );
      const memberVoucher = new MemberVoucher({
        member: member._id,
        voucher: voucher._id,
        validDate,
      });
      await memberVoucher.save();
    }
    return {
      status: true,
      statusCode: 200,
      message: "OK",
    };
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}
