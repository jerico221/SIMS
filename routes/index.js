var express = require("express");
const { Validator } = require("./controller/validator");
const { SelectStatement, GetCurrentDate, GetCurrentMonthFirstDay, GetCurrentMonthLastDay } = require("./repository/helper");
const { Select } = require("./repository/dbconnect");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "indexlayout");
});

module.exports = router;

router.get("/getdailysales", (req, res) => {
  try {
    let sql = SelectStatement(
      `
      select
      case when  isnull(sum(s_total)) then 0 else sum(s_total) end as total
      from sales
      where s_date between ? and ?`,
      [`${GetCurrentDate()} 00:00:00`, `${GetCurrentDate()} 23:59:59`]
    );

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }
      
      if (result.length != 0) {
        return res.status(200).send({ msg: "success", data: result[0] });
      } else {
        return res.status(200).send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: error,
    });
  }
});

router.get("/getmothlysales", (req, res) => {
  try {
    let sql = SelectStatement(
      `
      select
      case when  isnull(sum(s_total)) then 0 else sum(s_total) end as total
      from sales
      where s_date between ? and ?`,
      [`${GetCurrentMonthFirstDay()} 00:00:00`, `${GetCurrentMonthLastDay()} 23:59:59`]
    );

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }
      
      if (result.length != 0) {
        return res.status(200).send({ msg: "success", data: result[0] });
      } else {
        return res.status(200).send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: error,
    });
  }
});


router.get("/getorders", (req, res) => {
  try {
    let sql = SelectStatement(
      `SELECT count(*) as total FROM sims.order where o_date between ? and ?`,
      [`${GetCurrentDate()} 00:00:00`, `${GetCurrentDate()} 23:59:59`]
    );

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }
      
      if (result.length != 0) {
        return res.status(200).send({ msg: "success", data: result[0] });
      } else {
        return res.status(200).send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: error,
    });
  }
});