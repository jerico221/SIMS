var express = require("express");
const { Validator } = require("./controller/validator");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "indexlayout");
});

module.exports = router;
