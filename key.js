var aesjs = require("aes-js");
var pbkdf2 = require("pbkdf2");
var key = pbkdf2.pbkdf2Sync("password", "salt", 5, 256 / 8, "sha512");
console.log(key);