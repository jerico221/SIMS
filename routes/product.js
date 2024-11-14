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
const { Validator } = require("./controller/validator");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "productlayout");
});

module.exports = router;

router.get("/load", (req, res) => {
  try {
    let cmd = `select p_id,p_name,p_image,p_price, c_name as p_category,p_isinventory,p_status from product inner join category on p_category = c_id`;

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "p_");
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
    const { name, category, price, isinventory, image } = req.body;
    const status = StatusMessage.ACT;

    let cmd = InsertStatement("product", "p", [
      "name",
      "category",
      "price",
      "isinventory",
      "image",
      "status",
    ]);

    console.log();

    let data = [[name, category, price, isinventory, image, status]];

    let cmd_exist = SelectStatement("select * from product where p_name=?", [
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

    let updateStatement = UpdateStatement("product", "p", ["status"], ["id"]);

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
    const { id, name, category, price, isinventory, image } = req.body;

    let data = [];
    let col = [];

    if (name) {
      col.push("name");
      data.push(name);
    }
    if (category) {
      col.push("category");
      data.push(category);
    }
    if (price) {
      col.push("price");
      data.push(price);
    }
    if (isinventory) {
      col.push("isinventory");
      data.push(isinventory);
    }
    if (image) {
      col.push("image");
      data.push(image);
    }

    data.push(id);

    let updateStatement = UpdateStatement("product", "p", col, ["id"]);

    let checkStatement = SelectStatement(
      "select * from product where p_name=?",
      [name]
    );

    Update(updateStatement, data, (err, result) => {
      if (err) console.error("Error: ", err);

      console.log(result);

      res.json({
        msg: "success",
      });
    });

    // Check(checkStatement)
    //   .then((result) => {
    //     if (result != 0) {
    //       return res.json({ msg: "exist" });
    //     } else {
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     res.json({ msg: error });
    //   });
  } catch (error) {
    console.log(error);
    res.json({ msg: error });
  }
});

router.delete("/delete", (req, res) => {
  try {
    let id = req.body.id;
    let sql = "delete from product where p_id=?";
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

router.get("/getproductinventory", (req, res) => {
  try {
    let cmd = `select p_id,p_name from product where p_isinventory=1`;

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "p_");
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

router.get("/stockload", (req, res) => {
  try {
    let cmd = `
          select 
          p_id,
          p_name,
          p_image,
          p_price,
          c_name as p_category,
          p_isinventory,
          p_status ,
          i_stock as p_stock
          from product 
          inner join category on p_category = c_id
          left join inventory on i_productid = p_id
          where i_stock > 1
          OR p_isinventory = 'False'`;

    Select(cmd, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send({ msg: error });
      }

      if (result.length != 0) {
        let data = DataModeling(result, "p_");

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
