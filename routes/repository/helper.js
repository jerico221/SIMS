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

      resolve(result);
    });
  });
};
