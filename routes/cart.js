var express = require("express");
const { Select } = require("./repository/dbconnect");
const { EncryptString } = require("./repository/cryptography");
const { SelectStatement } = require("./repository/helper");
const { DataModeling } = require("./model/dbmodel");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("cartlayout", {
    fullname: req.session.fullname,
    title: "Express",
  });
});

module.exports = router;
