const { SocksProxyAgent } = require("socks-proxy-agent");
const proxy = "socks://127.0.0.1:2080";
const agent = new SocksProxyAgent(proxy);
const axios = require("axios");
const instagramGetUrl = require("instagram-url-direct");
const fs = require("fs");
const path = require("path");

async function getPostLinkInsta(instagramUrl) {
  try {
    // Get the direct download URL of the Instagram video
    const urlInfo = await instagramGetUrl(instagramUrl);
    const videoUrl = urlInfo.url_list[0];

    // Generate a suitable filename (e.g., using the Instagram post ID)
    const urlParts = instagramUrl.split("/");
    const postId = urlParts[urlParts.length - 2];
    const videoFilename = [
      {
        download_url: "instagram/video/" + `${postId}.mp4`,
        name: "DownloadVideo",
      },
    ]; // Ensure the file is saved in the current directory

    // Get the video data
    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
      // httpsAgent: agent,
      timeout: 10000,
    });

    // Create a write stream to save the video
    const writer = fs.createWriteStream(
      path.join(__dirname + "/video/" + `${postId}.mp4`)
    );

    // Pipe the response data to the file
    response.data.pipe(writer);

    // Return a promise that resolves when the writing is finished
    return new Promise((resolve, reject) => {
      writer.on("finish", () =>
        resolve({
          download_url: videoFilename,
          name: "DownloadVideo",
        })
      ); // Return the filename when done
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading instagram video:", error);
  }
}

module.exports = { getPostLinkInsta };
