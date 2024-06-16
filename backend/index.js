const { getYVideo, deleteDownloadedFiles } = require("./youtube/index.js");
const { identifyWebsite } = require("./checkurl.js");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
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
