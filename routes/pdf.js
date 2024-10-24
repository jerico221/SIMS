var express = require("express");
const {
  PDFTableHeaderFormatter,
  PDFTemplateFormatter,
  PDFContentFormatter,
  GetCurrentDatetime,
  GetCurrentDate,
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

    let detailcontent = [
      {
        product: "Itlog",
        price: "10",
        quantity: "1",
        total: "10",
        cost: "1",
      },
      {
        product: "Porck Chop",
        price: "70",
        quantity: "1",
        total: "70",
        cost: "1",
      },
      {
        product: "Chorizo",
        price: "20",
        quantity: "1",
        total: "20",
        cost: "1",
      },
    ];
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
