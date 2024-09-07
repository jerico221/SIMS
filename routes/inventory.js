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
  
  Validator(req, res, "inventorylayout");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let cmd =
      "select i_id,p_name as i_productid,i_stock from inventory inner join product on i_productid = p_id";

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "i_");
        return res.status(200).send({ msg: "success", data: data });
      } else {
        return res.status(200).send({ msg: "success", data: result });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: error,
    });
  }
});

router.post("/save", (req, res) => {
  try {
    const { product, quantity } = req.body;
    let status = StatusMessage.ACT;

    let cmd = InsertStatement("inventory", "i", ["productid", "stock"]);

    let data = [[product, quantity]];

    let cmd_exist = SelectStatement(
      "select * from inventory where i_productid=?",
      [product]
    );

    Check(cmd_exist).then((result) => {
      console.log(result);
      if (result.length != 0) {
        let current_quantity = result[0].i_stock;
        let new_quantity = parseInt(current_quantity) + parseInt(quantity);

        let cmd = UpdateStatement("inventory", "i", ["stock"], ["productid"]);

        Update(cmd, [new_quantity, product], (error, result) => {
          if (error) {
            console.error(error);
          }

          return res.status(200).send({
            msg: "update",
          });
        });
      } else {
        InsertTable(cmd, data, (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).send({
              msg: error,
            });
          }

          res.status(200).send({ msg: "success" });
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: error,
    });
  }
});
