const bcrypt = require("bcrypt");

const password = "mypassword123";
const hash = "$2a$10$abcdefghijklmnopqrstuu8z7VxQ9x1Q9k2Qz4M5f6n7o8p9q";

bcrypt.compare(password, hash, (err, result) => {
  if (result) {
    console.log("Password matches");
  } else {
    console.log("Wrong password");
  }
});
