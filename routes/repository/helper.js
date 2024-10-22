const moment = require("moment");
const { Select } = require("./dbconnect");
//#region SLQ SNIPPET CODE
exports.InsertStatement = (tablename, prefix, columns) => {
  let cols = "";

  columns.forEach((col) => {
    cols += `${prefix}_${col},`;
  });

  cols = cols.slice(0, -1);

  let statement = `INSERT INTO ${tablename}(${cols}) VALUES ?`;

  return statement;
};

exports.UpdateStatement = (tablename, prefix, columns, arguments) => {
  let cols = "";
  let agrs = "";

  columns.forEach((col) => {
    cols += `${prefix}_${col} = ?,`;
  });

  arguments.forEach((arg) => {
    agrs += `${prefix}_${arg} = ? AND `;
  });

  cols = cols.slice(0, -1);
  agrs = agrs.slice(0, -5);

  let statement = `UPDATE ${tablename} SET ${cols} WHERE ${agrs}`;

  return statement;
};

exports.SelectStatement = (str, data) => {
  let statement = "";
  let found = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "?") {
      statement += `'${data[found]}'`;
      found += 1;
    } else {
      statement += str[i];
    }
  }
  return statement;
};
//#endregion

//#region  DATETIME
exports.GetCurrentYear = () => {
  return moment().format("YYYY");
};

exports.GetCurrentMonth = () => {
  return moment().format("MM");
};

exports.GetCurrentDay = () => {
  return moment().format("DD");
};

exports.GetCurrentDate = () => {
  return moment().format("YYYY-MM-DD");
};

exports.GetCurrentDatetime = () => {
  return moment().format("YYYY-MM-DD HH:mm");
};

exports.GetCurrentDatetimeSecconds = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss");
};

exports.GetCurrentTime = () => {
  return moment().format("HH:mm");
};

exports.GetCurrentTimeSeconds = () => {
  return moment().format("HH:mm:ss");
};

exports.GetCurrentMonthFirstDay = () => {
  return moment().startOf("month").format("YYYY-MM-DD");
};

exports.GetCurrentMonthLastDay = () => {
  return moment().endOf("month").format("YYYY-MM-DD");
};

exports.ConvertToDate = (datetime) => {
  return moment(`${datetime}`).format("YYYY-MM-DD");
};

exports.ConvertDate = (date) => {
  const dateObject = new Date(date);

  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObject.getDate().toString().padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

exports.AddDayTime = (day, hour) => {
  let now = moment();
  let future = now.add({ days: day, hours: hour });

  return future.format("YYYY-MM-DD hh:mm");
};

exports.SubtractDayTime = (idate, fdate) => {
  const initaldate = moment(`${idate}`);
  const finaldate = moment(`${fdate}`);
  const diffInDays = finaldate.diff(initaldate, "days");

  return diffInDays;
};
//#endregion

exports.Check = (sql) => {
  return new Promise((resolve, reject) => {
    Select(sql, (error, result) => {
      if (error) reject(error);

      console.log(result);

      resolve(result);
    });
  });
};

/*
If you set pageSize to a string, you can use one of the following values:
  '4A0', '2A0', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10',
  'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10',
  'C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
  'RA0', 'RA1', 'RA2', 'RA3', 'RA4',
  'SRA0', 'SRA1', 'SRA2', 'SRA3', 'SRA4',
  'EXECUTIVE', 'FOLIO', 'LEGAL', 'LETTER', 'TABLOID'
 */

exports.PDFTemplateFormatter = (
  template,
  subheadertemplate = {},
  tablewidths = [], //['*', '*', '*', '*', '*']
  details = []
) => {
  return {
    margin: 0,
    pageSize: "A4",
    // by default we use portrait, you can change it to landscape if you wish
    pageOrientation: "portrait",
    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins: [35, 100, 35, 35],
    header: {
      image: "",
      width: 800,
      height: 100,
      alignment: "center",
      margin: [0, 0, 0, 0],
    },
    content: [
      {
        layout: "noBorders",
        text: template,
        style: "header",
        margin: [0, 75.5, 0, 0],
      },
      subheadertemplate,
      {
        margin: [0, 15, 0, 0],
        table: {
          widths: tablewidths,
          body: details,
        },
      }, //Append the table
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 10,
            x2: 762,
            y2: 10,
            lineWidth: 1.3,
            //x2: 517 portrait
          },
        ],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        alignment: "center",
      },
      subheader: {
        fontSize: 11,
        alignment: "center",
      },
      tableheader: {
        bold: true,
        margin: [0, 5, 0, 5],
        alignment: "center",
        fontSize: 10,
      },
      tablecontent: {
        fontSize: 9,
        margin: [0, 2.5, 0, 2.5],
        alignment: "center",
      },
      tabletitle: {
        fontSize: 11,
        alignment: "left",
        margin: [0, 5, 0, 0],
        bold: true,
      },
      costColumn: {
        bold: true,
        margin: [0, 5, 0, 5],
        alignment: "left",
        fontSize: 10,
      },
      costContent: {
        fontSize: 9,
        margin: [0, 2.5, 0, 2.5],
        alignment: "left",
      },
    },
  };
};

exports.PDFSubheaderFormatter = (key, value) => {
  return {
    layout: "noBorders",
    alignment: "left",
    table: {
      body: [
        [
          {
            text: `${ket}: ${value}`,
            margin: [0, 1, 50, 0],
          },
        ],
      ],
    },
  };
};

exports.PDFTableHeaderFormatter = (data = []) => {
  let header = [];
  data.forEach((item) => {
    const { name } = item;

    header.push({
      text: name,
      style: "tableheader",
      border: [false, true, false, true],
    });
  });

  return header;
};

exports.PDFContentFormatter = (data = []) => {
  let details = [];
  data.forEach((item) => {
    const { product, price, quantity, total } = item;

    details.push(
      {
        text: product,
        style: "tablecontent",
        border: [false, true, false, true],
      },
      {
        text: price,
        style: "tablecontent",
        border: [false, true, false, true],
      },
      {
        text: quantity,
        style: "tablecontent",
        border: [false, true, false, true],
      },
      {
        text: total,
        style: "tablecontent",
        border: [false, true, false, true],
      }
    );
  });

  return details;
};
