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
    let sql = SelectStatement(`select 
                    pn.p_id,
                    pn.p_date,
                    pt.p_name as p_productid,
                    pn.p_quantity,
                    pn.p_status
                    from production as pn
                    inner join product as pt on pt.p_id = pn.p_productid
                    order by p_date desc`);
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
    const production_status = StatusMessage.INPR;

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
      });

      let componentData = await GetComponent(productID);
      let details = JSON.parse(componentData[0].details);

      for (const component of details) {
        const { materialID, quantity, unit } = component;
        let stockDeduction = quantity * parseFloat(quantityProduction);

        console.log(materialID);

        await UpdateMaterialInventory(materialID, stockDeduction, unit);
      }

      res.status(200).json({ msg: "success" });
    }

    ProcessData();
  } catch (error) {
    res.status(500).json({ msg: "error", data: error });
  }
});

router.put("/approve", async (req, res) => {
  try {
    const { id } = req.body;

    async function ProcessData() {
      const productionData = await GetProduction(id);
      let productid = productionData[0].productid;
      const inventoryData = await GetProductInventory(productid);
      let inventoryID = inventoryData[0].id;
      let stock = inventoryData[0].stock;
      let quantity = productionData[0].quantity;
      let newStock = stock + quantity;

      console.log(newStock);

      let update_inventory = UpdateStatement(
        "inventory",
        "i",
        ["stock"],
        ["id"]
      );
      let inventory_data = [newStock, inventoryID];

      let update_production = UpdateStatement(
        "production",
        "p",
        ["status"],
        ["id"]
      );

      let production_data = [StatusMessage.APD, id];

      Update(update_inventory, inventory_data, (error, result) => {
        if (error) {
          console.log(error);

          res.status(500).json({ msg: "error", data: error });
        }
      });

      Update(update_production, production_data, (error, result) => {
        if (error) {
          console.log(error);

          res.status(500).json({ msg: "error", data: error });
        }
      });

      res.status(200).json({ msg: "success" });
    }

    ProcessData();
  } catch (error) {
    res.status(500).json({ msg: "error", data: error });
  }
});

router.put("/cancel", async (req, res) => {
  try {
    const { id } = req.body;

    async function ProcessData() {
      const productionData = await GetProduction(id);
      let productid = productionData[0].productid;
      const inventoryData = await GetMaterialInventory(productid);


      console.log(newStock);

      let update_inventory = UpdateStatement(
        "inventory",
        "i",
        ["stock"],
        ["id"]
      );
      let inventory_data = [newStock, inventoryID];

      let update_production = UpdateStatement(
        "production",
        "p",
        ["status"],
        ["id"]
      );

      let production_data = [StatusMessage.CANC, id];

      Update(update_inventory, inventory_data, (error, result) => {
        if (error) {
          console.log(error);

          res.status(500).json({ msg: "error", data: error });
        }
      });

      Update(update_production, production_data, (error, result) => {
        if (error) {
          console.log(error);

          res.status(500).json({ msg: "error", data: error });
        }
      });

      res.status(200).json({ msg: "success" });
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
    Select(sql, (error, result) => {
      if (error) {
        reject(error);
      }

      if (result.length != 0) {
        let data = DataModeling(result, "c_");

        resolve(data);
      } else {
        resolve(result);
      }
    });
  });
}

async function UpdateMaterialInventory(materialId, stockDeduction, unit) {
  return new Promise(async (resolve, reject) => {
    let sql = UpdateStatement("material_inventory", "mi", ["stock"], ["id"]);

    let materialInfo = await GetMaterialInventory(materialId);
    let currentStock = materialInfo[0].stock;
    let updatedStock = 0;

    if (unit == materialInfo[0].unit) {
      updatedStock = currentStock - stockDeduction;
    }

    console.log(updatedStock);

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

    console.log(sql);

    Select(sql, (error, result) => {
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

async function GetProduction(id) {
  return new Promise((resolve, reject) => {
    let sql = SelectStatement("select * from production where p_id = ?", [id]);

    console.log(sql);

    Select(sql, (error, result) => {
      if (error) {
        reject(error);
      }

      if (result.length != 0) {
        let data = DataModeling(result, "p_");

        resolve(data);
      } else {
        resolve(result);
      }
    });
  });
}

async function GetProductInventory(productid) {
  return new Promise((resolve, reject) => {
    let sql = SelectStatement("select * from inventory where i_productid = ?", [
      productid,
    ]);

    console.log(sql);

    Select(sql, (error, result) => {
      if (error) {
        reject(error);
      }

      if (result.length != 0) {
        let data = DataModeling(result, "i_");

        console.log(data);

        resolve(data);
      } else {
        resolve(result);
      }
    });
  });
}
//#endregion
