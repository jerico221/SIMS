var express = require("express");
const {
  PDFTableHeaderFormatter,
  PDFTemplateFormatter,
  PDFContentFormatter,
} = require("./repository/helper");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("pdf");
});

module.exports = router;

router.get("/generatepdf", (req, res) => {
  try {
    const { headerdata, detailsdata } = GeneratePDF();
    let header = PDFTableHeaderFormatter([headerdata]);

    let details = PDFContentFormatter([detailsdata]);

    // PDFTemplateFormatter("Sales Report", ["*", "*", "*", "*"]);

    res.status(200).json({
      msg: "PDF generated successfully",
      data: {
        header,
        details,
      },
    });
  } catch (error) {
    res.status(500).json({
      msg: error,
    });
  }
});

router.get("/generatepdf/:filename/:currentDate", async (req, res, next) => {
  try {
    const { filename, currentDate } = req.params;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}_${currentDate}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    res.json({
      msg: error,
    });
    console.log(error);
  }
});
