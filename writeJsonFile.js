var createFile = require("create-file");
let contentToWrite = process.argv[2];
let fileName = process.argv[3];

// 'FirebaseKeyProd'
createFile(fileName, contentToWrite, function(err) {
  if (err) console.log(err);
  else console.log("succesfully wrote file");
});
