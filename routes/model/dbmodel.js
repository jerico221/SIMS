const { DataModel, RawDataModel } = require("./model");

exports.DataModeling = (data, prefix) => {
    let result = [];
  
    data.forEach((d) => {
      result.push(new DataModel(d, prefix));
    });
  
    return result;
  };
  
  exports.RawData = (data) => {
    let result = [];
  
    data.forEach((d) => {
      result.push(new RawDataModel(d));
    });
  
    return result;
  };
  