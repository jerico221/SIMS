var express = require("express");
const {
  SelectStatement,
  InsertStatement,
  Check,
  UpdateStatement,
} = require("./repository/helper");
const { StatusMessage } = require("./repository/disctionary");
const { Select, InsertTable, Update } = require("./repository/dbconnect");
const { DataModeling } = require("./model/dbmodel");
const { Validator } = require("./controller/validator");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "storepointhistorylayout");
});

module.exports = router;