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
  res.render("categorylayout", { title: "Express" });
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let cmd = "select * from category";

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
    const { name } = req.body;
    let status = StatusMessage.ACT;

    let cmd = InsertStatement("category", "c", ["name", "status"]);

    let data = [[name, status]];

    let cmd_exist = SelectStatement("select * from category where c_name=?", [
      name,
    ]);

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

    let updateStatement = UpdateStatement("category", "c", ["status"], ["id"]);

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
    let namemodal = req.body.access;
    let id = req.body.id;

    let data = [namemodal, id];

    let updateStatement = UpdateStatement("category", "c", ["name"], ["id"]);

    let checkStatement = SelectStatement(
      "select * from category where c_name=?",
      [namemodal]
    );

    Check(checkStatement)
      .then((result) => {
        if (result != 0) {
          return res.json({ msg: exist });
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
