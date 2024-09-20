var express = require("express");
const { Select } = require("./repository/dbconnect");
const { EncryptString } = require("./repository/cryptography");
const { SelectStatement } = require("./repository/helper");
const { DataModeling } = require("./model/dbmodel");
const { StatusMessage } = require("./repository/disctionary");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("loginlayout", {
    employeeid: req.session.employeeid,
    title: "Express",
  });
});

module.exports = router;

router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(username, password);

    if (username.includes("@")) {
      console.log("hit here @");

      let sql = `select c_id, c_fullname, c_contactno, c_email, csp_points as c_storepoints from customer inner join customer_store_points where c_email = ? and c_password = ?`;
      let cmd = SelectStatement(sql, [username, EncryptString(password)]);
      Select(cmd, (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send({ msg: error });
        }

        console.log(result);

        if (result.length != 0) {
          let data = DataModeling(result, "c_");
          req.session.fullname = data[0].fullname;
          req.session.customerid = data[0].id;
          req.session.access = "customer"
          req.session.storepoints =  parseFloat(data[0].storepoints).toFixed(2);

          console.log(data[0].status);

          if (data[0].status === StatusMessage.INACT) {
            return res.status(200).send({ msg: "inactive" });
          } else {
            return res.status(200).send({ msg: "customer", data: data });
          }
        } else {
          return res.status(200).send({ msg: "failed" });
        }
      });
    } else {
      console.log("hit here @");
      let sql = `select
                e_id as u_id,
                e_fullname as u_employeeid,
                a_name as u_access
                from user
                inner join access on u_access = a_id
                inner join employee on u_employeeid = e_id where u_username = ? and u_password = ?`;
      let cmd = SelectStatement(sql, [username, EncryptString(password)]);

      Select(cmd, (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send({ msg: error });
        }

        if (result.length != 0) {
          let data = DataModeling(result, "u_");
          req.session.agentid = data[0].id;
          req.session.employeeid = data[0].employeeid;
          req.session.access = data[0].access;
          return res.status(200).send({ msg: "success", data: data });
        } else {
          return res.status(200).send({ msg: "failed" });
        }
      });
    }
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.post("/loginpos", (req, res) => {
  try {
    const { username, password } = req.body;
    let sql = "select * from user where u_username = ? and u_password = ?";
    let cmd = SelectStatement(sql, [username, EncryptString(password)]);

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }
      console.log(result);

      if (result.length != 0) {
        let data = DataModeling(result, "u_");
        return res.status(200).send({ msg: "success", data: data });
      } else {
        return res.status(200).send({ msg: "failed", data: result });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.json({
        msg: err,
      });
    }
    res.status(200).send({ msg: "success" });
  });
});
