const { getYVideo, deleteDownloadedFiles } = require("./youtube/index.js");
const { identifyWebsite } = require("./checkurl.js");
const { getPostLinkInsta } = require("./instagram/index.js");
const { deleteFile } = require("./deleteFile.js");
const { downloadVideosFromLinkedIn } = require("./linkedin/index.js");
const { downloadVideosFromTikTok } = require("./tiktok/index.js");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
app.use(cors());
app.use(bodyParser.json());
var http = require("http");
var https = require("https");
var privateKey = fs.readFileSync("./PrivateKey.key", "utf8");
var certificate = fs.readFileSync("./Certificate.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

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
async function downInstagram(videoUrl) {
  try {
    console.log(videoUrl);
    const output = await getPostLinkInsta(videoUrl)
      .then((link) => {
        console.log(link);
        return link;
      })
      .catch((error) => {
        console.error("Error:", error);
        return error;
      });
    return { output };
  } catch (err) {
    console.log("Error Insta", err);
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
app.use("/instagram/video/:filename", (req, res) => {
  console.log("ok");
  const filename = req.params.filename;
  const filePath = path.join(__dirname + "/instagram/video/", filename);

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
app.use("/linkedin/video/:filename", (req, res) => {
  console.log("ok");
  const filename = req.params.filename;
  const filePath = path.join(__dirname + "/linkedin/video/", filename);

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
    console.log("youtube");
    const downloadResult = await downYoutube(url);
    console.log("y", downloadResult);
    setTimeout(async () => {
      await deleteFile(downloadResult.videolink);
    }, 30 * 6 * 1000);
    return res.json({ download_link: downloadResult.videolink });
  } else if (social === "Instagram") {
    console.log("insta");

    const downloadResult = await downInstagram(url);
    setTimeout(async () => {
      await deleteFile(downloadResult.output.videolink);
    }, 30 * 6 * 1000);

    return res.json({ download_link: downloadResult.output });
  } else if (social === "LinkedIn") {
    // Example usage:

    const downloadResult = await downloadVideosFromLinkedIn(url)
      .then((savedPaths) => {
        console.log("All videos downloaded successfully.");
        return savedPaths;
      })
      .catch((err) => {
        console.error("Failed to download videos:", err);
        return err;
      });
    setTimeout(async () => {
      await deleteFile(downloadResult.videolink);
    }, 30 * 6 * 1000);
    console.warn({ download_link: downloadResult });
    return res.json({ download_link: downloadResult });
  } else if (social === "TikTok") {
    // const downloadResult = await downloadVideosFromTikTok(url)
    //   .then((savedPaths) => {
    //     console.log("All videos downloaded successfully.");
    //     return savedPaths;
    //   })
    //   .catch((err) => {
    //     console.error("Failed to download videos:", err);
    //     return err;
    //   });
    // setTimeout(async () => {
    //   await deleteFile(downloadResult.videolink);
    // }, 30 * 6 * 1000);
    console.warn({ download_link: downloadResult });
    return res.json({ download_link: downloadResult });
  } else if (social === "None of the specified sites") {
    console.log("None of the specified sites");
    return res.json({ url: social });
  }
});

httpServer.listen(4000);
httpsServer.listen(8443);
