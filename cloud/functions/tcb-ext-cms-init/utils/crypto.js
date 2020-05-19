const crypto = require("crypto");

module.exports.genPassword = async function (orginPassword, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      orginPassword,
      salt,
      100000,
      64,
      "sha512",
      (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey.toString("hex"));
        }
      }
    );
  });
};
