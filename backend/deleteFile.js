const fs = require("fs");

async function deleteFile(filename) {
  console.log("start delete file");
  filename.forEach((element) => {
    fs.unlink(element.download_url, (err) => {
      if (err) {
        console.error(`Error deleting file ${element.download_url}:`, err);
      } else {
        console.log(`Deleted file: ${element.download_url}`);
      }
    });
  });
}
module.exports = { deleteFile };
