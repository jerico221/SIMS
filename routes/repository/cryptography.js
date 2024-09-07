const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const initVector = Buffer.alloc(16, "JERICHO");
const Securitykey = Buffer.alloc(32, "MIRAFUENTE");

exports.Encrypter = (password, callback) => {
  try {
    let cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
    let encryptedData = cipher.update(password, "utf-8", "hex");
    encryptedData += cipher.final("hex");

    callback(null, encryptedData);
  } catch (error) {
    callback(error, null);
  }
};

exports.EncryptString = (password) => {
  try {
    let cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
    let encryptedData = cipher.update(password, "utf-8", "hex");
    encryptedData += cipher.final("hex");

    return encryptedData;
  } catch (error) {
    throw error;
  }
};

exports.Decrypter = (hash, callback) => {
  try {
    let decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
    let decryptedData = decipher.update(hash, "hex", "utf8");
    decryptedData += decipher.final("utf-8");

    callback(null, decryptedData);
  } catch (error) {
    callback(error, null);
  }
};
