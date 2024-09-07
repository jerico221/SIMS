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

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("poslayout", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let cmd = "select * from pos";

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "p_");
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
    const { name, serial } = req.body;
    let status = StatusMessage.ACT;

    let cmd = InsertStatement("pos", "p", ["name", "serial", "status"]);

    let data = [[name, serial, status]];

    let cmd_exist = SelectStatement(
      "select * from pos where p_name=? and p_serial=?",
      [name, serial]
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

    let updateStatement = UpdateStatement("pos", "p", ["status"], ["id"]);

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
    let namemodal = req.body.pos;
    let serialmodal = req.body.serial;
    let id = req.body.id;

    let data = [namemodal, serialmodal, id];

    let updateStatement = UpdateStatement(
      "pos",
      "p",
      ["name", "serial"],
      ["id"]
    );

    let checkStatement = SelectStatement(
      "select * from pos where p_name=? and p_serial=?",
      [namemodal, serialmodal]
    );

    Check(checkStatement)
      .then((result) => {
        if (result != 0) {
          return res.json({ msg: 'exist' });
        } else {
          Update(updateStatement, data, (err, result) => {
            if (err) console.error("Error: ", err);

            console.log(result);

            res.json({
              msg: "success",
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.json({ msg: error });
      });
  } catch (error) {
    console.log(error);
    res.json({ msg: error });
  }
});
