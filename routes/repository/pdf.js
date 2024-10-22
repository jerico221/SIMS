const PdfMake = require("pdfmake");
const path = require("path");

const { Validator } = require("./controller/validator");

const regularfont = path.join(__dirname, "/fonts/roboto-regular-webfont.ttf");
const boldfont = path.join(__dirname, "/fonts/roboto-bold-webfont.ttf");

/* GET home page. */
router.get("/", function (req, res, next) {
  Validator(req, res, "accesslayout");
});

exports.GeneratePDF = () => {
  return new Promise((resolve, reject) => {
    var fonts = {
      Roboto: {
        normal: regularfont,
        bold: boldfont,
        italics: regularfont,
        bolditalics: regularfont,
      },
    };

    const printer = new PdfMake(fonts);

    var pdfDoc = printer.createPdfKitDocument(reportContent);

    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", (error) => reject(error));

    pdfDoc.end();
  });
};
