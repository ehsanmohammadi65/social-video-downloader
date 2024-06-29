const TelegramBot = require("node-telegram-bot-api");
const { getYVideo, deleteDownloadedFiles } = require("../youtube/index.js");
const { identifyWebsite } = require("../checkurl.js");
const { getPostLinkInsta } = require("../instagram/index.js");
const { deleteFile } = require("../deleteFile.js");
const { downloadVideosFromLinkedIn } = require("../linkedin/index.js");
//replace Robot Token
const token = "7292096747:AAGmdRBi8LvxNt0JiR31NnJMnmbmu1m-Ehs";
const path = require("path");
const fs = require("fs");

// مسیر فایل JSON برای ذخیره شناسه‌های چت
const chatIdsFilePath = path.join(__dirname, "chatIds.json");

// بارگذاری شناسه‌های چت از فایل JSON
function loadChatIds() {
  if (fs.existsSync(chatIdsFilePath)) {
    const data = fs.readFileSync(chatIdsFilePath, "utf8");
    return new Set(JSON.parse(data));
  }
  return new Set();
}

// ذخیره شناسه‌های چت در فایل JSON
function saveChatIds(chatIds) {
  fs.writeFileSync(
    chatIdsFilePath,
    JSON.stringify(Array.from(chatIds)),
    "utf8"
  );
}

// بارگذاری شناسه‌های چت از فایل JSON
const chatIds = loadChatIds();
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
  if (!chatIds.has(chatId)) {
    chatIds.add(chatId);
    saveChatIds(chatIds);
    console.log(`New chat ID added: ${chatId}`);
  }
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
        // bot.sendMessage(
        //   chatId,
        //   "http://svdl.pro:4000/" + el.download_url + ""
        // );
        const testVideoUrl = path.join(__dirname, "../" + el.download_url);

        bot
          .sendVideo(chatId, testVideoUrl, {
            caption: "Download video Youtube Success.",
          })
          .then(() => {
            console.log("Video sent successfully");
          })
          .catch((err) => {
            console.error("Error while sending video:", err);
            console.error("Status code:", err.response.statusCode);
            console.error("Response body:", err.response.body);
          });
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
      const testVideoUrl = path.join(__dirname, "../" + downloadResult);

      bot
        .sendVideo(chatId, testVideoUrl, {
          caption: "Download video Linkedin Success.",
        })
        .then(() => {
          console.log("Video sent successfully");
        })
        .catch((err) => {
          console.error("Error while sending video:", err);
          console.error("Status code:", err.response.statusCode);
          console.error("Response body:", err.response.body);
        });
    } else if (messageText.includes("instagram.com")) {
      const downloadResult = await downInstagram(messageText);
      setTimeout(async () => {
        await deleteFile(downloadResult.output.videolink);
      }, 30 * 6 * 1000);

      const testVideoUrl = path.join(
        __dirname,
        "../" + downloadResult.output[0].download_url
      );

      bot
        .sendVideo(chatId, testVideoUrl, {
          caption: "Download video Instagram Success.",
        })
        .then(() => {
          console.log("Video sent successfully");
        })
        .catch((err) => {
          console.error("Error while sending video:", err);
          console.error("Status code:", err.response.statusCode);
          console.error("Response body:", err.response.body);
        });
    } else if (messageText.includes("/sendmsgall") && chatId == 749506583) {
      const newmsg = messageText.replace("/sendmsgall ", "");
      sendMessageToAllUsers(newmsg);

      // bot.sendMessage(chatId, "مدیری");
    } else if (messageText === "/chatid") {
      bot.sendMessage(chatId, msg.chat.id + "");
    } else {
      bot.sendMessage(chatId, "None of the specified sites");
    }
  }
});

// تابع برای ارسال پیام به تمام مخاطبین
function sendMessageToAllUsers(message) {
  chatIds.forEach((chatId) => {
    bot
      .sendMessage(chatId, message)
      .then(() => {
        console.log(`Message sent to ${chatId}`);
      })
      .catch((error) => {
        console.error(`Failed to send message to ${chatId}:`, error);
      });
  });
}
