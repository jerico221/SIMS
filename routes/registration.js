var express = require("express");
const {
  SelectStatement,
  InsertStatement,
  Check,
  UpdateStatement,
  GetCurrentDate,
  GetCurrentDatetime,
} = require("./repository/helper");
const { StatusMessage } = require("./repository/disctionary");
const { Select, InsertTable, Update } = require("./repository/dbconnect");
const { DataModeling } = require("./model/dbmodel");
const { Validator } = require("./controller/validator");
const { EncryptString } = require("./repository/cryptography");
const { SendEmail } = require("./repository/mailer");
const twilio = require("twilio");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("registrationlayout", { title: "Express" });
});

module.exports = router;

router.post("/register", (req, res) => {
  try {
    const { fullname, contactno, address, email, password } = req.body;
    let status = StatusMessage.INACT;

    let cmd = InsertStatement("customer", "c", [
      "fullname",
      "contactno",
      "address",
      "email",
      "status",
      "password",
    ]);

    let data = [
      [fullname, contactno, address, email, status, EncryptString(password)],
    ];

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

          let customerid = result[0].id;

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

          let account_verification = InsertStatement(
            "customer_verification",
            "cv",
            ["customerid", "smscode"]
          );
          const randomNumber = Math.floor(100000 + Math.random() * 900000);
          let account_verification_data = [[result[0].id, randomNumber]];

          InsertTable(
            account_verification,
            account_verification_data,
            (error, result) => {
              if (error) {
                console.log(error);
                return res.status(500).send({
                  msg: error,
                });
              }

              console.log(result);

              SendEmail(
                `${email}`,
                `Account Verification ${GetCurrentDatetime()}`,
                `<p>Please verify your account by clicking the link below</p>
                </br>
                </br> 
                <h1>${randomNumber}</h1>
                </br>
                <a href="${process.env._BASE_URL}/verification/verify?id=${customerid}">Click here to verify</a>`
              );
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

router.get("/testmail", (req, res) => {
  try {
    SendEmail("5lsolutions.jaorencio@gmail.com", "TEST", "TEST");
    res.status(200).send({ msg: "success" });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/sendsms", (req, res) => {
  try {
    const apikey = "978e7df3232caa81e275322a988919cb";
    const number = "639560442139";
    const message = "TEST";
    const parameters = {
      apikey,
      number,
      message,
    };

    fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(parameters),
    })
      .then((response) => response.text())
      .then((output) => {
        console.log(output);
      })
      .catch((error) => console.log(error));
    res.status(200).send({ msg: "success" });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/test", (req, res) => {
  // Generate a random 6-digit number
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  console.log(randomNumber);
  res.status(200).send({ msg: "success" });
});
