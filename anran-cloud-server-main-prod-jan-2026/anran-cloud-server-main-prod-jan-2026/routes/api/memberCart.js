const express = require("express");
const Members = require("../../models/members");
const router = express.Router();
const auth = require("./jwtfilter");
const MemberCart = require("../../models/memberCart");

router.post("/update", auth, async (req, res) => {
  try {
    const member = await Members.findById(req.body.member);
    const cart = await MemberCart.findOne({
      member: member,
      package: req.body.package,
    });
    if (cart) {
      cart.quantity = req.body.quantity;
      cart.unitAmount = req.body.unitAmount;
      cart.discountType = req.body.discountType;
      cart.discountPrice = req.body.discountPrice;
      cart.discountAmount = req.body.discountAmount;
      cart.finalAmount = req.body.finalAmount;
      await cart.save();
      res.send(cart);
    } else {
      let new_obj = {
        member: req.body.member,
        package: req.body.package,
        unitPrice: req.body.unitPrice,
        quantity: req.body.quantity,
        unitAmount: req.body.unitAmount,
        discountType: req.body.discountType,
        discountPrice: req.body.discountPrice,
        discountAmount: req.body.discountAmount,
        finalAmount: req.body.finalAmount,
        dayAges: 0,
      };
      const newCartItem = new MemberCart(new_obj);
      await newCartItem.save();
      res.send(newCartItem);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const carts = await MemberCart.find({
      $and: [{ member: { $eq: id } }],
    }).populate({
      path: "package",
    });
    res.send(carts);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    await MemberCart.deleteOne({
      member: req.body.member,
      package: req.body.package,
    });
    res.json({ message: "Item removed successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
