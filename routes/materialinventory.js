var express = require("express");
const {
  SelectStatement,
  InsertStatement,
  Check,
  UpdateStatement,
  GetCurrentDatetime,
  GetCurrentDate,
} = require("./repository/helper");
const { StatusMessage } = require("./repository/disctionary");
const { Select, InsertTable, Update } = require("./repository/dbconnect");
const { DataModeling } = require("./model/dbmodel");
const { Validator } = require("./controller/validator");
const { SendEmail } = require("./repository/mailer");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "materialinventorylayout");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = "select * from material_inventory";
    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "mi_");
        return res.status(200).send({ msg: "success", data: data });
      } else {
        return res.status(200).send({ msg: "success", data: result });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.post("/save", (req, res) => {
  try {
    const { material, unit, price } = req.body;
    let material_inventory_data = [[material, unit, 0, price]];
    let material_inventory = InsertStatement("material_inventory", "mi", [
      "name",
      "unit",
      "stock",
      "cost",
    ]);

    let cmd_exist = SelectStatement(
      "select * from material_inventory where mi_name=?",
      [material]
    );

    Check(cmd_exist).then((result) => {
      if (result.length != 0) {
        res.status(200).json({ msg: "Already Exist" });
      } else {
        InsertTable(
          material_inventory,
          material_inventory_data,
          (error, result) => {
            if (error) {
              console.log(error);
              return res.status(500).send({
                msg: error,
              });
            } else {
              return res.status(200).send({ msg: "success" });
            }
          }
        );
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});
