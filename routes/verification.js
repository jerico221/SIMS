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
const { Encrypter, EncryptString } = require("./repository/cryptography");
const { Validator } = require("./controller/validator");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("verificationlayout", { title: "Express" });
});

module.exports = router;

router.get("/verify", (req, res) => {
  try {
    const id = req.query.id;

    let sql = SelectStatement(
      "select * from customer_verification where cv_customerid=?",
      [id]
    );
    Select(sql, (error, result) => {
      if (error) {
        console.log(error);
      }
      console.log(result);

      if (result.length == 0) {
        res.render("notfound");
      } else {
        res.render("verificationlayout", { activitionid: id });
      }
    });
  } catch (error) {
    res.status(err.status || 500);
    res.render("error");
  }
});

router.post("/verifysmscode", (req, res) => {
  try {
    const { id, smscode } = req.body;

    let sql = SelectStatement(
      "select * from customer_verification where cv_customerid=? and cv_smscode=?",
      [id, smscode]
    );
    Select(sql, (error, result) => {
      if (error) {
        console.log(error);
      }
      console.log(result);
      if (result.length == 0) {
        console.log("hit");

        res.status(200).json({ msg: "Invalid SMS Code" });
      } else {
        let updateCustomer = UpdateStatement(
          "customer",
          "c",
          ["status"],
          ["id"]
        );

        let updatecustomerstorepoint = UpdateStatement(
          "customer_store_points",
          "csp",
          ["status"],
          ["id"]
        );

        let updatecustomerdata = [StatusMessage.ACT, id];
        let updatecustomerstorepointdata = [StatusMessage.ACT, id];

        Update(updateCustomer, updatecustomerdata, (err, result) => {
          if (err) console.error("Error: ", err);
          console.log(result);
        });

        Update(updatecustomerstorepoint, updatecustomerstorepointdata, (err, result) => {
          if (err) console.error("Error: ", err);
          console.log(result);
        });


        res.status(200).json({ msg: "success" });
      }
    });
  } catch (error) {
    res.status(err.status || 500);
    res.render("error");
  }
});

router.delete("/delete", (req, res) => {
  try {
    const { id } = req.body;
    let sql = SelectStatement(
      "delete from customer_verification where cv_customerid=?",
      [id]
    );
    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      res.status(200).send({ msg: "success" });
    });
  } catch (error) {
    res.status(500).send({
      msg: error,
    });
  }
});
