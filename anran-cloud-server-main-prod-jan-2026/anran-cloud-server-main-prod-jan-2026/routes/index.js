var router = require('express').Router();
router.use('/', require('./api'));
router.get("/", (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});
module.exports = router;

