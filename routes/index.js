var express = require("express");
const { Validator } = require("./controller/validator");
const {
  SelectStatement,
  GetCurrentDate,
  GetCurrentMonthFirstDay,
  GetCurrentMonthLastDay,
} = require("./repository/helper");
const { Select } = require("./repository/dbconnect");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "indexlayout");
});

module.exports = router;

router.get("/getdailysales", (req, res) => {
  try {
    let sql = SelectStatement(
      `
      select
      case when  isnull(sum(s_total)) then 0 else sum(s_total) end as total
      from sales
      where s_date between ? and ?`,
      [`${GetCurrentDate()} 00:00:00`, `${GetCurrentDate()} 23:59:59`]
    );

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        return res.status(200).send({ msg: "success", data: result[0] });
      } else {
        return res
          .status(200)
          .send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: error,
    });
  }
});

router.get("/getmothlysales", (req, res) => {
  try {
    let sql = SelectStatement(
      `
      select
      case when  isnull(sum(s_total)) then 0 else sum(s_total) end as total
      from sales
      where s_date between ? and ?`,
      [
        `${GetCurrentMonthFirstDay()} 00:00:00`,
        `${GetCurrentMonthLastDay()} 23:59:59`,
      ]
    );

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        return res.status(200).send({ msg: "success", data: result[0] });
      } else {
        return res
          .status(200)
          .send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: error,
    });
  }
});

router.get("/getorders", (req, res) => {
  try {
    let sql = SelectStatement(
      `SELECT count(*) as total FROM sims.order where o_date between ? and ?`,
      [`${GetCurrentDate()} 00:00:00`, `${GetCurrentDate()} 23:59:59`]
    );

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        return res.status(200).send({ msg: "success", data: result[0] });
      } else {
        return res
          .status(200)
          .send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: error,
    });
  }
});

router.get("/getnewusers", (req, res) => {
  try {
    let sql = "SELECT COUNT(*) as total FROM sims.customer";
    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        return res.status(200).send({ msg: "success", data: result[0] });
      } else {
        return res
          .status(200)
          .send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: error,
    });
  }
});

router.get("/gettopproducts", (req, res) => {
  try {
    let sql = SelectStatement(
      `
     select
    s_details as details
    from sales
    where s_date between ? and ?`,
      [
        `${GetCurrentMonthFirstDay()} 00:00:00`,
        `${GetCurrentMonthLastDay()} 23:59:59`,
      ]
    );

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = [];
        for (const item of result) {
          const { details } = item;
          let detailsJson = JSON.parse(details);

          for (const d of JSON.parse(detailsJson)) {
            const { id, name, price, quantity } = d;

            const existingItem = data.find((i) => i.name === name);

            if (existingItem) {
              // If item exists, update the quantity
              existingItem.quantity += parseInt(quantity);
            } else {
              // If item doesn't exist, add a new item to the data array
              data.push({
                name: name,
                price: price,
                quantity: parseInt(quantity),
              });
            }
          }
        }

        return res.status(200).send({ msg: "success", data: data });
      } else {
        return res
          .status(200)
          .send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/getactiveorders", (req, res) => {
  try {
    let sql = SelectStatement(`
      select 
      c_fullname as customer,
      o_details as details,
      o_status as status from sims.order
      inner join customer where c_id = o_customerid
      AND not o_status = 'COMPLETED'`);

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = [];
        for (const item of result) {
          const { customer, details, status } = item;
          item.customer = customer;
          item.details = JSON.parse(details);

          for (const d of item.details) {
            const { address } = d;
            data.push({
              customer: item.customer,
              address: address,
              status: status,
            });
          }
        }

        return res.status(200).send({ msg: "success", data: data });
      } else {
        return res
          .status(200)
          .send({ msg: "success", data: result == null ? 0 : result });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});
