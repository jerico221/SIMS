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

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "saleslayout");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let cmd = SelectStatement(
      "select * from sales where s_date between ? and ? order by s_id desc",
      [`${GetCurrentDate()} 00:00:00`, `${GetCurrentDate()} 23:59:59`]
    );

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "s_");
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
    const { pos, details, total, paymenttype, cashreceive, change, cashier } =
      req.body;
    let status = StatusMessage.SLD;
    let date = GetCurrentDatetime();

    // console.log(
    //   pos,
    //   JSON.stringify(details),
    //   total,
    //   paymenttype,
    //   cashreceive,
    //   change,
    //   cashier
    // );

    async function ProcessData() {
      let cmd = InsertStatement("sales", "s", [
        "pos",
        "details",
        "total",
        "paymenttype",
        "cashreceive",
        "change",
        "status",
        "date",
        "cashier",
      ]);

      let data = [
        [
          pos,
          details,
          total,
          paymenttype,
          cashreceive,
          change,
          status,
          date,
          cashier,
        ],
      ];

      let detailjson = JSON.parse(details);

      for (const d of JSON.parse(detailjson)) {
        const { id, name, price, quantity } = d;
        console.log(id, name, price, quantity);

        let sql_check = SelectStatement(
          "select * from product where p_id = ?",
          [id]
        );

        let response = await Check(sql_check);
        let isiventory = response[0].p_isinventory;

        if (isiventory != 0) {
          console.log(name);
          let sql_stock = SelectStatement(
            "select i_stock as stock from inventory where i_productid = ?",
            [id]
          );

          let currentstock = await Check(sql_stock);

          let newquantity =
            parseInt(currentstock[0].stock) - parseInt(quantity);

          let sql_update = UpdateStatement(
            "inventory",
            "i",
            ["stock"],
            ["productid"]
          );

          Update(sql_update, [newquantity, id], (error, result) => {
            if (error) {
              console.error(error);
              return res.status(500).send({ msg: error });
            }

            console.log(result);
          });
        }
      }

      InsertTable(cmd, data, (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).send({
            msg: error,
          });
        }

        console.log(result);

        res.status(200).send({ msg: "success" });
      });
    }

    ProcessData();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: error,
    });
  }
});

router.post("/getdetails", (req, res) => {
  try {
    const { id } = req.body;
    let sql = SelectStatement("select * from sales where s_id = ?", [id]);
    Select(sql, (error, result) => {
      if (error) {
        console.error(error);

        return res.status(500).send({ msg: error });
      }

      let data = DataModeling(result, "s_");
      let dataJson = JSON.parse(data[0].details);
      let arrayJson = JSON.parse(dataJson);
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

      res.status(200).send({ msg: "success", data: resultJson });
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/getdetails/:id", (req, res) => {
  try {
    const { id } = req.params;
    let sql = SelectStatement("select * from sales where s_id = ?", [id]);
    Select(sql, (error, result) => {
      if (error) {
        console.error(error);

        return res.status(500).send({ msg: error });
      }

      let data = DataModeling(result, "s_");
      let dataJson = JSON.parse(data[0].details);
      let arrayJson = JSON.parse(dataJson);
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

      res.status(200).send({ msg: "success", data: resultJson });
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/filter", (req, res) => {
  try {
    
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});
