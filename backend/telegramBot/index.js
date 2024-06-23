const TelegramBot = require("node-telegram-bot-api");

//replace Robot Token
const token = "xxxx";

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
  if (messageText != "start") {
    // بررسی hostname برای تشخیص سایت
    if (
      messageText.includes("youtube.com") ||
      messageText.includes("youtu.be")
    ) {
      console.log("youtube");
      const downloadResult = await downYoutube(url);
      console.log("youtube", downloadResult);
      setTimeout(async () => {
        await deleteFile(downloadResult.videolink);
      }, 30 * 6 * 1000);
      bot.sendMessage(chatId, "video download link:", downloadResult.videolink);
      //  return res.json({ download_link: downloadResult.videolink });
    } else if (messageText.includes("linkedin.com")) {
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
      bot.sendMessage(chatId, "video download link:", downloadResult);
    } else if (messageText.includes("instagram.com")) {
      return "Instagram";
    } else if (messageText.includes("pinterest.com")) {
      return "Pinterest";
    } else if (messageText.includes("twitter.com")) {
      return "Twitter";
    } else if (messageText.includes("tiktok.com")) {
      return "TikTok";
    } else {
      return "None of the specified sites";
    }
  }
});

const handleResponse = (chatId, response) => {
  const user = userResponses[chatId];
  if (response === "back to Menu") {
    delete userResponses[chatId];
    const keyboard = {
      reply_markup: {
        keyboard: [
          [{ text: "welcome" }],
          [{ text: "category" }],
          [{ text: " About US" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };
    bot.sendMessage(chatId, "Back to main Menu", keyboard);
  } else {
    const questionType = questions[user.currentQuestion].type;
    user.responses.push({ type: questionType, answer: response });
    user.currentQuestion++;
  }
};
