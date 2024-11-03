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
  Validator(req, res, "orderlayout");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let cmd = `
    select 
    o_id,
    o_date,
    o_customerid,
    o_details,
    o_paymentmethod,
    o_status
    from sims.order
    inner join customer on c_id = o_customerid
    order by o_date desc`;

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "o_");
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
    const {
      details,
      paymentmethod,
      customerid,
      storepoints,
      verificationcode,
    } = req.body;
    let status = StatusMessage.PND;
    let date = GetCurrentDatetime();

    console.log(storepoints);

    let cmd = InsertStatement("sims.order", "o", [
      "date",
      "customerid",
      "details",
      "paymentmethod",
      "status",
    ]);

    let data = [[date, customerid, details, paymentmethod, status]];

    let cmd_exist = SelectStatement(
      "select * from sims.order where o_customerid=? and not o_status = ?",
      [customerid, StatusMessage.CMP]
    );

    console.log(cmd_exist);

    Check(cmd_exist).then((result) => {
      console.log(result.length);
      if (result.length != 0) {
        console.log("exist");

        return res.status(200).send({
          msg: "exist",
        });
      } else {
        console.log("new");
        InsertTable(cmd, data, (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).send({
              msg: error,
            });
          }
          console.log(result);

          let order_history = InsertStatement("order_history", "oh", [
            "orderid",
            "date",
            "activity",
          ]);
          let order_history_data = [[result[0].id, date, "Order Created"]];

          InsertTable(order_history, order_history_data, (error, result) => {
            if (error) {
              console.log(error);
              return res.status(500).send({
                msg: error,
              });
            }
          });

          if (paymentmethod == "Store Points") {
            for (const detail of JSON.parse(details)) {
              const { location, address, payment, cart, total } = detail;
              console.log("Total:", total);

              let sql = UpdateStatement(
                "customer_store_points",
                "csp",
                ["points"],
                ["id"]
              );

              console.log(sql);

              let current_balance = parseFloat(storepoints) - total;
              console.log(current_balance, storepoints);

              let customer_store_points = [current_balance, customerid];
              console.log(sql);

              Update(sql, customer_store_points, (err, result) => {
                if (err) console.error("Error: ", err);
                console.log(result);
              });

              let history = InsertStatement("store_points_history", "sph", [
                "storepointid",
                "date",
                "amount",
                "activity",
              ]);

              let history_data = [
                [customerid, GetCurrentDatetime(), total, "Points Deducted"],
              ];

              InsertTable(history, history_data, (err, result) => {
                if (err) console.error("Error: ", err);
                console.log(result);
              });
            }
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

router.put("/approve", (req, res) => {
  try {
    let id = req.body.id;
    let status = StatusMessage.PREP;
    let customerid = req.body.customerid;
    let data = [status, id];

    console.log(customerid);

    async function ProcessData() {
      let date = GetCurrentDate();
      let customerInfo = await GetCustomerEmail(customerid);

      let updateStatement = UpdateStatement(
        "sims.order",
        "o",
        ["status"],
        ["id"]
      );

      SendEmail(
        customerInfo[0].email,
        `Nava's Kitchen [OR:${id} - ${date}]`,
        "Order Approved"
      );

      Update(updateStatement, data, (err, result) => {
        if (err) console.error("Error: ", err);
      });

      res.status(200).send({ msg: "success" });
    }

    ProcessData();
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: error });
  }
});

router.put("/deliver", (req, res) => {
  try {
    let id = req.body.id;
    let status = StatusMessage.FDLV;
    let customerid = req.body.customerid;
    let data = [status, id];

    async function ProcessData() {
      let date = GetCurrentDate();
      let customerInfo = await GetCustomerEmail(customerid);
      let updateStatement = UpdateStatement(
        "sims.order",
        "o",
        ["status"],
        ["id"]
      );

      SendEmail(
        customerInfo[0].email,
        `Nava's Kitchen [OR:${id} - ${date}]`,
        "On Delivery"
      );

      Update(updateStatement, data, (err, result) => {
        if (err) console.error("Error: ", err);
      });

      res.status(200).send({ msg: "success" });
    }
    ProcessData();
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: error });
  }
});

router.put("/complete", (req, res) => {
  try {
    let id = req.body.id;
    let status = StatusMessage.CMP;
    let customerid = req.body.customerid;
    let data = [status, id];

    async function ProcessData() {
      let date = GetCurrentDate();
      let customerInfo = await GetCustomerEmail(customerid);
      let updateStatement = UpdateStatement(
        "sims.order",
        "o",
        ["status"],
        ["id"]
      );

      SendEmail(
        customerInfo[0].email,
        `Nava's Kitchen [OR:${id} - ${date}]`,
        "Order Completed"
      );

      Update(updateStatement, data, (err, result) => {
        if (err) console.error("Error: ", err);
      });

      res.status(200).send({ msg: "success" });
    }

    ProcessData();
  } catch (error) {
    console.log(error);
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

    let updateStatement = UpdateStatement("order", "p", ["status"], ["id"]);

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
    let namemodal = req.body.order;
    let id = req.body.id;

    let data = [namemodal, id];

    let updateStatement = UpdateStatement("order", "p", ["name"], ["id"]);

    let checkStatement = SelectStatement("select * from order where o_name=?", [
      namemodal,
    ]);

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

router.delete("/delete", (req, res) => {
  try {
    let id = req.body.id;
    let sql = "delete from order where o_id=?";
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

router.get("/getorderdetails/:id", (req, res) => {
  try {
    const { id } = req.params;
    let sql = SelectStatement("select * from sims.order where o_id = ?", [id]);
    Select(sql, (error, result) => {
      if (error) {
        console.error(error);

        return res.status(500).send({ msg: error });
      }

      let data = DataModeling(result, "o_");
      let dataJson = JSON.parse(data[0].details);
      console.log(dataJson);
      let arrayJson = dataJson[0].cart;
      let resultJson = [];

      arrayJson.forEach((key, item) => {
        const { id, name, price, quantity } = key;
        console.log(id, name, price, quantity);
        resultJson.push({
          id: id,
          name: name,
          price: price,
          quantity: quantity,
        });
      });

      res.status(200).send({
        msg: "success",
        data: {
          detail: [
            {
              total: dataJson[0].total,
              payment: dataJson[0].payment,
              address: dataJson[0].address,
            },
          ],
          items: resultJson,
        },
      });
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.post("/createverificationcode/", (req, res) => {
  try {
    const { customerid, amount } = req.body;
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const date = GetCurrentDatetime();

    let sql_check = SelectStatement(
      "select c_email as email from customer where c_id=?",
      [customerid]
    );
    Check(sql_check).then((result) => {
      if (result.length != 0) {
        let email = result[0].email;
        let data = [
          [customerid, date, randomNumber, amount, StatusMessage.PND],
        ];
        let cmd = InsertStatement("storepoint_verification", "sv", [
          "customerid",
          "date",
          "code",
          "amount",
          "status",
        ]);

        InsertTable(cmd, data, (error, result) => {
          if (error) {
            console.error(error);
            return res.status(500).send({ msg: error });
          }

          SendEmail(
            `${email}`,
            `Store Points Verification ${GetCurrentDatetime()}`,
            `<p>Here is your verification code</p>
            </br>
            Code: <strong>${randomNumber}</strong> 
            `
          );

          res.status(200).send({ msg: "success" });
        });
      } else {
        res.status(200).send({ msg: "success" });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.post("/storepointverificationcode", (req, res) => {
  try {
    const { customerid, code } = req.body;
    let sql_check = SelectStatement(
      "select * from storepoint_verification where sv_customerid=? and sv_code=? and not sv_status=?",
      [customerid, code, StatusMessage.CMP]
    );

    console.log(sql_check);

    Check(sql_check).then((result) => {
      if (result.length != 0) {
        let data = [StatusMessage.CMP, customerid, code];
        let updateStatement = UpdateStatement(
          "storepoint_verification",
          "sv",
          ["status"],
          ["customerid", "code"]
        );

        Update(updateStatement, data, (err, result) => {
          if (err) console.error("Error: ", err);
          console.log(result);
        });

        res.status(200).send({ msg: "success" });
      } else {
        res.status(200).send({ msg: "already in use" });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

async function GetCustomerEmail(customerid) {
  return new Promise((resolve, reject) => {
    let cmd = SelectStatement("select c_email from customer where c_id=?", [
      customerid,
    ]);

    console.log(cmd);

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        reject(error);
      }

      if (result.length != 0) {
        let data = DataModeling(result, "c_");

        console.log(data);

        resolve(data);
      } else {
        resolve(result);
      }
    });
  });
}
