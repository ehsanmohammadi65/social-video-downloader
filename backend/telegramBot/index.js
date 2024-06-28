const TelegramBot = require("node-telegram-bot-api");
const { getYVideo, deleteDownloadedFiles } = require("../youtube/index.js");
const { identifyWebsite } = require("../checkurl.js");
const { getPostLinkInsta } = require("../instagram/index.js");
const { deleteFile } = require("../deleteFile.js");
const { downloadVideosFromLinkedIn } = require("../linkedin/index.js");
//replace Robot Token
const token = "7292096747:AAGmdRBi8LvxNt0JiR31NnJMnmbmu1m-Ehs";

// proxy setting (if socks5 replace socks5)

// if connect bot by proxy
// create bot by proxy
const bot = new TelegramBot(token, {
  polling: true,
});
//else if connect  bot not proxy
// const bot = new TelegramBot(token, {
//   polling: true,

// });

const userResponses = {};
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
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === "/start") {
    // create custom keyboard
    const keyboard = {
      reply_markup: {
        keyboard: [[{ text: "/start" }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };

    bot.sendMessage(
      chatId,
      "welcome to Social video Downloader bot please Enter URL"
    );
  }

  // create custom response
  if (messageText != "/start") {
    // بررسی hostname برای تشخیص سایت
    if (
      messageText.includes("youtube.com") ||
      messageText.includes("youtu.be")
    ) {
      console.log("youtube");
      const downloadResult = await downYoutube(messageText);
      setTimeout(async () => {
        await deleteFile(downloadResult.videolink);
      }, 30 * 6 * 1000);
      downloadResult.videolink.forEach((el) => {
        bot.sendMessage(
          chatId,
          "http://5.161.155.227:4000/" + el.download_url + ""
        );
      });

      //  return res.json({ download_link: downloadResult.videolink });
    } else if (messageText.includes("linkedin.com")) {
      const downloadResult = await downloadVideosFromLinkedIn(messageText)
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
      bot.sendMessage(chatId, "video download link:", downloadResult);
    } else if (messageText.includes("instagram.com")) {
      const downloadResult = await downInstagram(messageText);
      setTimeout(async () => {
        await deleteFile(downloadResult.output.videolink);
      }, 30 * 6 * 1000);

      bot.sendMessage(
        chatId,
        "http://5.161.155.227:4000/" + downloadResult.output[0].download_url
      );
    } else {
      bot.sendMessage(chatId, "None of the specified sites");
    }
  }
});
