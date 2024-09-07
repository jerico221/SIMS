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
  Validator(req, res, "customerstorepointslayout");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `
            select 
            csp_id,
            c_fullname as csp_customer,
            csp_points,
            csp_status
            from customer_store_points
            inner join customer on c_id = csp_customerid`;
    let cmd = SelectStatement(sql);

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "csp_");

        res.status(200).send({ msg: "success", data: data });
      } else {
        res.status(200).send({ msg: "success", data: result });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.put("/status", (req, res) => {
  try {
    let id = req.body.id;
    let status =
      req.body.status == StatusMessage.ACT
        ? StatusMessage.INACT
        : StatusMessage.ACT;
    let data = [status, id];

    let updateStatement = UpdateStatement(
      "customer_store_points",
      "csp",
      ["status"],
      ["id"]
    );

    Update(updateStatement, data, (err, result) => {
      if (err) console.error("Error: ", err);

      res.status(200).send({ msg: "success" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: error });
  }
});

router.put("/edit", (req, res) => {
  try {
    const { id, points } = req.body;
    let date = GetCurrentDatetime();
    let data = [points, id];

    let updateStatement = UpdateStatement(
      "customer_store_points",
      "csp",
      ["points"],
      ["id"]
    );

    Update(updateStatement, data, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);

      let history = InsertStatement("store_points_history", "sph", [
        "storepointid",
        "date",
        "amount",
        "activity",
      ]);

      let history_data = [[id, date, points, "Points Added"]];

      InsertTable(history, history_data, (err, result) => {
        if (err) console.error("Error: ", err);
        console.log(result);
      });

      res.json({
        msg: "success",
      });
    });
  } catch (error) {
    console.log(error);
    res.json({ msg: error });
  }
});
