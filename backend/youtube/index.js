const ytdl = require("ytdl-core");
const { SocksProxyAgent } = require("socks-proxy-agent");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { format } = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

// const proxy = "socks://127.0.0.1:2080";
// const agent = new SocksProxyAgent(proxy);

async function getYVideo(videoId) {
  let output = [];

  try {
    const info = await ytdl.getInfo(videoId);
    //for proxy
    // const info = await ytdl.getInfo(videoId, {
    //   requestOptions: { agent },
    // });
    const seenQualities = new Set();

    const listQuality = info.formats
      .filter((format) => format.qualityLabel)
      .reduce((unique, format) => {
        if (!seenQualities.has(format.qualityLabel)) {
          seenQualities.add(format.qualityLabel);
          unique.push({
            quality: format.qualityLabel,
            itag: format.itag,
            mimeType: format.mimeType,
          });
        }
        return unique;
      }, []);
    //console.log(listQuality);
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
    });
    const videoFormats = listQuality.reduce((acc, obj) => {
      acc[obj.quality.replace("p", "")] = ytdl.chooseFormat(info.formats, {
        quality: obj.itag,
      });
      return acc;
    }, {});
    //    console.log("vf", videoFormats);
    const qualityLevels = listQuality.map((format) =>
      format.quality.replace("p", "")
    );
    for (const quality of qualityLevels) {
      const videoFormat = videoFormats[quality];

      if (videoFormat) {
        const videoFilePath = `youtube/video/${info.videoDetails.title}_${quality}.mp4`;
        const audioFilePath = `youtube/audio/${info.videoDetails.title}_audio.mp4`;
        const outputFilePath = `youtube/combined/${info.videoDetails.title}_${quality}_combined.mp4`;

        // ایجاد پوشه‌ها در صورت عدم وجود
        fs.mkdirSync("youtube/video", { recursive: true });
        fs.mkdirSync("youtube/audio", { recursive: true });
        fs.mkdirSync("youtube/combined", { recursive: true });

        const videoStream = ytdl.downloadFromInfo(info, {
          format: videoFormat,
        });
        const audioStream = ytdl.downloadFromInfo(info, {
          format: audioFormat,
        });
        //for proxy
        // const videoStream = ytdl.downloadFromInfo(info, {
        //   format: videoFormat,
        //   requestOptions: { agent },
        // });
        // const audioStream = ytdl.downloadFromInfo(info, {
        //   format: audioFormat,
        //   requestOptions: { agent },
        // });

        const videoOutput = fs.createWriteStream(videoFilePath);
        const audioOutput = fs.createWriteStream(audioFilePath);

        videoStream.pipe(videoOutput);
        audioStream.pipe(audioOutput);

        await new Promise((resolve, reject) => {
          videoOutput.on("finish", resolve);
          videoOutput.on("error", reject);
        });

        await new Promise((resolve, reject) => {
          audioOutput.on("finish", resolve);
          audioOutput.on("error", reject);
        });

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(videoFilePath)
            .input(audioFilePath)
            .outputOptions("-c:v copy")
            .outputOptions("-c:a aac")
            .save(outputFilePath)
            .on("end", () => {
              console.log(`Finished combining: ${outputFilePath}`);
              resolve();
            })
            .on("error", (err) => {
              console.error(`Error combining ${outputFilePath}:`, err);
              reject(err);
            });
        });

        output.push(outputFilePath);
      } else {
        console.log(`Format not found for quality: ${quality}`);
      }
    }
  } catch (err) {
    console.error("Error getting video info:", err);
  }

  return output;
}
// تابع برای حذف فایل‌ها
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
