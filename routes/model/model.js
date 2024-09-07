class DataModel {
  constructor(data, prefix) {
    for (const key in data) {
      this[key.replace(prefix, "")] = data[key];
    }
  }
}

class RawDataModel {
  constructor(data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}

module.exports = {
  DataModel,
  RawDataModel,
};
