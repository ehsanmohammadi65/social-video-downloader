const ytdl = require("ytdl-core");
const { SocksProxyAgent } = require("socks-proxy-agent");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const proxy = "socks://127.0.0.1:2080";
const agent = new SocksProxyAgent(proxy);

async function getYVideo(videoId) {
  let output = [];

  try {
    const info = await ytdl.getInfo(videoId, {});
    //proxy
    // const info = await ytdl.getInfo(videoId, {
    //   requestOptions: { agent },
    // });

    const seenQualities = new Set();

    const listQuality = info.formats
      .filter(
        (format) => format.qualityLabel && format.hasAudio && format.hasVideo
      )
      .reduce((unique, format) => {
        if (!seenQualities.has(format.qualityLabel)) {
          seenQualities.add(format.qualityLabel);
          unique.push({
            quality: format.qualityLabel,
            itag: format.itag,
            mimeType: format.mimeType,
            format: format,
          });
        }
        return unique;
      }, []);

    for (const quality of listQuality) {
      const videoFilePath = `youtube/video/${
        info.videoDetails.title.split(0 - 3) +
        info.videoDetails.title.split(0 - 3)
      }_${quality.quality}.mp4`;

      fs.mkdirSync("youtube/video", { recursive: true });

      const videoStream = ytdl.downloadFromInfo(info, {
        format: quality.format,
      });
      //proxy
      // const videoStream = ytdl.downloadFromInfo(info, {
      //   format: quality.format,
      // });

      const videoOutput = fs.createWriteStream(videoFilePath);

      let videoSize = 0;
      let videoDownloaded = 0;

      videoStream.on("response", (res) => {
        videoSize = parseInt(res.headers["content-length"], 10);
      });

      videoStream.on("data", (chunk) => {
        videoDownloaded += chunk.length;
        const percent = ((videoDownloaded / videoSize) * 100).toFixed(2);
        console.log(
          `Video download progress (${quality.quality}): ${percent}%`
        );
      });

      videoStream.pipe(videoOutput);

      await new Promise((resolve, reject) => {
        videoOutput.on("finish", () => {
          console.log(`Finished downloading: ${videoFilePath}`);
          output.push({ download_url: videoFilePath, name: quality.quality });
          resolve();
        });
        videoOutput.on("error", reject);
      });
    }
  } catch (err) {
    console.error("Error getting video info:", err);
  }

  return output;
}

function deleteDownloadedFiles(filePaths) {
  for (const filePath of filePaths) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });
  }
}

module.exports = { getYVideo, deleteDownloadedFiles };
