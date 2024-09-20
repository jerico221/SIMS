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
  Validator(req, res, "customerlayout");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let cmd = "select * from customer";

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "c_");
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
    const { fullname, contactno, address, email } = req.body;
    let status = StatusMessage.ACT;

    let cmd = InsertStatement("customer", "c", [
      "fullname",
      "contactno",
      "address",
      "email",
      "status",
    ]);

    let data = [[fullname, contactno, address, email, status]];

    let cmd_exist = SelectStatement(
      "select * from customer where c_fullname=?",
      [fullname]
    );

    Check(cmd_exist).then((result) => {
      console.log(result);
      if (result.length != 0) {
        return res.status(200).send({
          msg: "exist",
        });
      } else {
        InsertTable(cmd, data, (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).send({
              msg: error,
            });
          }

          let customer_store_points = InsertStatement(
            "customer_store_points",
            "csp",
            ["customerid", "points", "status"]
          );
          let customer_store_points_data = [[result[0].id, 0, status]];

          InsertTable(
            customer_store_points,
            customer_store_points_data,
            (error, result) => {
              if (error) {
                console.log(error);
                return res.status(500).send({
                  msg: error,
                });
              }

              console.log(result);
            }
          );

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

router.put("/status", (req, res) => {
  try {
    let id = req.body.id;
    let status =
      req.body.status == StatusMessage.ACT
        ? StatusMessage.INACT
        : StatusMessage.ACT;
    let data = [status, id];

    let updateStatement = UpdateStatement("customer", "c", ["status"], ["id"]);

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
    const { id, fullname, address, email, contactno } = req.body;

    let data = [fullname, address, email, contactno, id];

    console.log(fullname, address, email, contactno, id);

    let updateStatement = UpdateStatement(
      "customer",
      "c",
      ["fullname", "address", "email", "contactno"],
      ["id"]
    );

    Update(updateStatement, data, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);

      res.json({
        msg: "success",
      });
    });
  } catch (error) {
    console.log(error);
    res.json({ msg: error });
  }
});

router.delete("/delete", (req, res) => {
  try {
    let id = req.body.id;
    let sql = "delete from customer where c_id=?";
    let cmd = SelectStatement(sql, [id]);

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      res.status(200).send({ msg: "success" });
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/getstorepoints/:id", (req, res) => {
  try {
    const { id } = req.params;
    let sql = `select * from customer_store_points where csp_id=?`;

    console.log(id);
    

    let cmd = SelectStatement(sql, [id]);

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      console.log(result);
      let data = DataModeling(result, "csp_");

      res.status(200).send({ msg: 'success', data: data });
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});
