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
  Validator(req, res, "reportlayout");
});

module.exports = router;

router.get("/salesgraph/:date", (req, res) => {
  try {
    const { date } = req.params;
    const dates = date.split(" - ");
    const startDate = dates[0];
    const endDate = dates[1];
    let overalltotal = 0;

    let cmd = SelectStatement(
      "select s_details as details from sales where s_date between ? and ?",
      [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
    );

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      let data = [];
      for (const item of result) {
        const { details } = item;
        let detailsJson = JSON.parse(details);

        for (const d of JSON.parse(detailsJson)) {
          const { id, name, price, quantity } = d;
          let total = parseFloat(price) * parseFloat(quantity);

          overalltotal += total;

          const existingItem = data.find((i) => i.name === name);

          if (existingItem) {
            // If item exists, update the quantity
            existingItem.quantity += parseFloat(quantity);
            existingItem.quantity += parseFloat(total);
          } else {
            // If item doesn't exist, add a new item to the data array

            data.push({
              name: name,
              price: parseFloat(price).toFixed(2),
              quantity: parseFloat(quantity),
              total: total.toFixed(2),
            });
          }
        }
      }

      res
        .status(200)
        .send({ msg: "success", data: data, overalltotal: overalltotal });
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});
