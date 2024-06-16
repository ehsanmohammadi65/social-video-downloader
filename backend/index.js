const { getYVideo, deleteDownloadedFiles } = require("./youtube/index.js");
const { identifyWebsite } = require("./checkurl.js");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
app.use(cors());
app.use(bodyParser.json());

async function downYoutube(videoUrl) {
  try {
    console.log(videoUrl);
    const output = await getYVideo(videoUrl);
    console.log(`Finished downloading all videos: ${output}`);

    return { videolink: output };
  } catch (err) {
    console.error("Error:", err);
    return { Error: err };
  }
}
app.use("/youtube/video/:filename", (req, res) => {
  console.log("ok");
  const filename = req.params.filename;
  const filePath = path.join(__dirname + "/youtube/video/", filename);

  // بررسی وجود فایل قبل از دانلود
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).send("File not found");
    }

    // ارسال فایل برای دانلود
    res.download(filePath, (err) => {
      if (err) {
        console.error(`Error downloading file: ${err}`);
        return res.status(500).send("Error downloading file");
      }
    });
  });
});

app.post("/check", async (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const social = identifyWebsite(url);
  if (social === "YouTube") {
    const downloadResult = await downYoutube(url);
    return res.json({ download_link: downloadResult });
  } else {
    return res.json({ url: social });
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
