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
  Validator(req, res, "componentslayout");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let sql = `
    select 
    c_id,
    p_name as c_productid,
    c_details
    from components
    inner join product on p_id = c_productid`;
    Select(sql, (error, result) => {
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
    res.status(500).send({ msg: error });
  }
});

router.post("/save", (req, res) => {
  try {
    const { productid, details } = req.body;
    console.log(productid, details);
    let sql = InsertStatement("components", "c", ["productid", "details"]);
    let data = [[productid, details]];

    let sql_check = SelectStatement(
      "select * from components where c_productid=?",
      [productid]
    );

    Check(sql_check).then((result) => {
      if (result.length != 0) {
        return res.status(200).json({ msg: "Already Exist" });
      } else {
        InsertTable(sql, data, (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).send({ msg: error });
          } else {
            return res.status(200).send({ msg: "success" });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/getcomponents/:id", (req, res) => {
  try {
    const { id } = req.params;

    async function ProcessData(id) {
      let sql = SelectStatement(
        "select * from components where c_productid=?",
        [id]
      );

      Select(sql, async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).send({ msg: error });
        }

        if (result.length != 0) {
          let data = DataModeling(result, "c_");
          let components = [];
          let details = JSON.parse(data[0].details);
          for (const detail of details) {
            const { materialID, materialname, quantity } = detail;

            let stock = await GetComponents(materialID);

            components.push({
              materialid: materialID,
              materialname: materialname,
              quantity: quantity,
              stock: stock,
            });
          }

          return res.status(200).send({ msg: "success", data: components });
        } else {
          return res.status(200).send({ msg: "success", data: result });
        }
      });
    }

    ProcessData(id);
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

router.get("/getproductcomponents/:id", (req, res) => {
  try {
    const { id } = req.params;
    let sql = SelectStatement(
      "select c_details as p_details from product inner join components on c_productid = p_id where c_id = ?",
      [id]
    );

    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "p_");
        let details = JSON.parse(data[0].details);
        let components = [];
        for (const detail of details) {
          const { materialID, materialname, unit, cost, quantity } = detail;

          components.push({
            materialid: materialID,
            materialname: materialname,
            quantity: quantity,
            unit: unit,
            cost: cost,
          });
        }
        return res.status(200).send({ msg: "success", data: components });
      } else {
        return res.status(200).send({ msg: "success", data: result });
      }
    });
  } catch (error) {
    res.status(500).send({ msg: error });
  }
});

//#region Functions

async function GetComponents(id) {
  return new Promise((resolve, reject) => {
    let sql = SelectStatement(
      "select mi_stock as stock from material_inventory where mi_id= ?",
      [id]
    );
    Select(sql, (error, result) => {
      if (error) {
        console.error(error);
        reject(error);
      }
      if (result.length != 0) {
        resolve(result[0].stock);
      } else {
        resolve(0);
      }
    });
  });
}

//#endregion
