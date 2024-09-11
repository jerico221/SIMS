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
  Validator(req, res, "chatlayout");
});

module.exports = router;

router.get("/customer", (req, res) => {
  try {
    let sql = SelectStatement("select * from customer where c_status = ?", [
      "active",
    ]);
    Select(sql, (err, data) => {
      if (err) {
        res.status(500).send({
          msg: err,
        });
      } else {
        let refinedata = DataModeling(data, "c_");
        res.status(200).send({
          msg: "success",
          data: refinedata,
        });
      }
    });
  } catch (error) {
    res.status(500).send({
      msg: error,
    });
  }
});

router.post("/customerchat", (req, res) => {
  try {
    const { customerid, userid } = req.body;

    let sql = SelectStatement(
      `select 
      c_customerid as customerid,
      u_id as userid,
      c_message as message,
      c_date as date,
      c_status as status
      from chat
      inner join user on u_id = c_userid
      inner join employee on e_id = u_employeeid
      where e_fullname = ?
      and c_customerid = ?`,
      [userid, customerid]
    );

    Select(sql, (err, data) => {
      if (err) {
        res.status(500).send({
          msg: err,
        });
      } else {
        res.status(200).send({
          msg: "success",
          data: data,
        });
      }
    });
  } catch (error) {
    res.status(500).send({
      msg: error,
    });
  }
});
