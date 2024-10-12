var express = require("express");
const { Validator } = require("./controller/validator");
const { SelectStatement, GetCurrentDate, GetCurrentMonthFirstDay, GetCurrentMonthLastDay } = require("./repository/helper");
const { Select } = require("./repository/dbconnect");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render('privacypolicy');
});

module.exports = router;