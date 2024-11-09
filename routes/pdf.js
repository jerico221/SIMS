var express = require("express");
const {
  PDFTableHeaderFormatter,
  PDFTemplateFormatter,
  PDFContentFormatter,
  GetCurrentDatetime,
  GetCurrentDate,
  PDFReceiptTemplateFormatter,
  ReceiptItemsFormatter,
} = require("./repository/helper");
const { GeneratePDF } = require("./repository/pdf");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("pdf");
});

module.exports = router;

let pdfBuffer = "";

router.post("/generatepdf", (req, res) => {
  try {
    const { detailsdata, overalltotal, daterange } = req.body;

    let headerConstant = ["Product", "Price", "Quantity", "Total"];
    let header = PDFTableHeaderFormatter(headerConstant);
    let details = PDFContentFormatter(detailsdata);

    let tablewitdh = [];
    headerConstant.forEach((i) => {
      tablewitdh.push("*");
    });

    GeneratePDF(
      PDFTemplateFormatter(
        "Sales Report",
        header,
        details,
        tablewitdh,
        overalltotal,
        daterange
      )
    )
      .then((result) => {
        pdfBuffer = result;
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).json({
      msg: "PDF generated successfully",
      // data: {
      //   header,
      //   details,
      // },
    });
  } catch (error) {
    res.status(500).json({
      msg: error,
    });
  }
});

router.post("/generatereceipt", (req, res) => {
  try {
    const { data, date, posid, total, id } = req.body;

    let items = ReceiptItemsFormatter(data.items);
    let details = data.detail;
    const { cashier, paymenttype, cashreceive, change } = details[0];
    GeneratePDF(
      PDFReceiptTemplateFormatter(
        cashier,
        paymenttype,
        cashreceive,
        change,
        items,
        date,
        posid,
        total,
        id
      )
    )
      .then((result) => {
        pdfBuffer = result;
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).json({
      msg: "PDF generated successfully",
      // data: {
      //   header,
      //   details,
      // },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: error,
    });
  }
});

router.get("/generatepdf/:filename/", async (req, res, next) => {
  try {
    const { filename } = req.params;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}_${GetCurrentDate()}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    res.json({
      msg: error,
    });
    console.log(error);
  }
});
