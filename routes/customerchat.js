var express = require("express");
const {
  SelectStatement,
  InsertStatement,
  Check,
  UpdateStatement,
  GetCurrentDatetime,
} = require("./repository/helper");
const { StatusMessage } = require("./repository/disctionary");
const { Select, InsertTable, Update } = require("./repository/dbconnect");
const { DataModeling } = require("./model/dbmodel");
const { Validator } = require("./controller/validator");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "customerchatlayout");
});

module.exports = router;

router.get("/getagent", (req, res) => {
  try {
    let sql = SelectStatement(
      `select 
                              u_id as userid,
                              e_fullname as fullname,
                              a_name as position
                              from user inner join employee on u_employeeid = e_id
                              inner join access on u_access = a_id
                              where a_name = ?`,
      ["Agents"]
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

router.post("/chat", (req, res) => {
  try {
    const { customerid, userid } = req.body;
    let sql = SelectStatement(
      "select * from chat where c_userid = ? and c_customerid = ?",
      [userid, customerid]
    );

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

router.post("/send", (req, res) => {
  try {
    const { customerid, userid, message, senderstatus } = req.body;
    const date = GetCurrentDatetime();

    console.log(customerid, userid, message, senderstatus, date);

    let sql = InsertStatement("chat", "c", [
      "customerid",
      "userid",
      "message",
      "status",
      "date",
    ]);

    let data = [[customerid, userid, message, senderstatus, date]];

    InsertTable(sql, data, (err, data) => {
      if (err) {
        res.status(500).send({
          msg: err,
        });
      }

      console.log(data);

      res.status(200).send({
        msg: "success",
      });
    });
  } catch (error) {
    res.status(500).send({
      msg: error,
    });
  }
});
