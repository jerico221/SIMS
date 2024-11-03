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
  Validator(req, res, "productionlayout");
});

module.exports = router;

router.get("/load", async (req, res, next) => {
  try {
    let sql = SelectStatement("select * from production");
    Select(sql, (error, result) => {
      if (error) {
        res.status(500).json({ msg: "error", data: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "p_");

        res.status(200).json({ msg: "success", data: data });
      } else {
        res.status(200).json({ msg: "success", data: result });
      }
    });
  } catch (error) {
    res.status(500).json({ msg: "error", data: error });
  }
});

router.post("/addproduction", async (req, res, next) => {
  try {
    const { productID, quantityProduction } = req.body;
    const currentDate = GetCurrentDatetime();
    const production_status = StatusMessage.ACT;

    async function ProcessData() {
      let data = [
        [currentDate, productID, quantityProduction, production_status],
      ];
      let sql = InsertStatement("production", "p", [
        "date",
        "productid",
        "quantity",
        "status",
      ]);

      InsertTable(sql, data, (error, result) => {
        if (error) {
          res.status(500).json({ msg: "error", data: error });
        }

        res.status(200).json({ msg: "success" });
      });

      let componentData = await GetComponent(productID);

      for (const component of componentData) {
        const { materialID, quantity, unit } = component;
        let stockDeduction = quantity * parseFloat(quantityProduction);

        await UpdateMaterialInventory(materialID, stockDeduction, unit);
      }
    }

    ProcessData();
  } catch (error) {
    res.status(500).json({ msg: "error", data: error });
  }
});

//#region Functions
async function GetComponent(productid) {
  return new Promise((resolve, reject) => {
    let sql = SelectStatement(
      "select * from components where c_productid = ?",
      [productid]
    );
    Select(sql, [productid], (error, result) => {
      if (error) {
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

async function UpdateMaterialInventory(materialId, stockDeduction, unit) {
  return new Promise((resolve, reject) => {
    let sql = UpdateStatement("material_inventory", "mi", ["stock"], ["id"]);

    let materialInfo = GetMaterialInventory(materialId);
    let currentStock = materialInfo[0].stock;
    let updatedStock = 0;

    if (unit == materialInfo[0].unit) {
      updatedStock = currentStock - stockDeduction;
    }

    console.log(sql);

    Update(sql, [updatedStock, materialId], (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
}

async function GetMaterialInventory(materialId) {
  return new Promise((resolve, reject) => {
    let sql = SelectStatement(
      "select mi_stock, mi_unit from material_inventory where mi_id = ?",
      [materialId]
    );
    Select(sql, [materialId], (error, result) => {
      if (error) {
        reject(error);
      }

      if (result.length != 0) {
        let data = DataModeling(result, "mi_");

        console.log(data);

        resolve(data);
      } else {
        resolve(result);
      }
    });
  });
}
//#endregion
