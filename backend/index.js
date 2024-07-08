const { getYVideo, deleteDownloadedFiles } = require("./youtube/index.js");
const { identifyWebsite } = require("./checkurl.js");
const { getPostLinkInsta } = require("./instagram/index.js");
const { deleteFile } = require("./deleteFile.js");
const { downloadVideosFromLinkedIn } = require("./linkedin/index.js");
const { downloadVideosFromTikTok } = require("./tiktok/index.js");
const express = require("express");
require("./telegramBot/index.js");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
app.use(cors());

app.use(bodyParser.json());
var fs = require("fs");

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
app.use("/api/youtube/video/:filename", (req, res) => {
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
        return res.send("Error downloading file");
      }
    });
  });
});
app.use("/api/instagram/video/:filename", (req, res) => {
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
app.use("/api/linkedin/video/:filename", (req, res) => {
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

app.post("/api/check", async (req, res) => {
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
      try {
        await deleteFile(downloadResult.output.videolink);
      } catch (error) {
        console.log("error delete file");
      }
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

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
