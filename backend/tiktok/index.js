const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { SocksProxyAgent } = require("socks-proxy-agent");
const proxy = "socks://127.0.0.1:2080";
const agent = new SocksProxyAgent(proxy);
async function downloadVideosFromTikTok(pageUrl) {
  try {
    const saveDirectory = "./linkedin/video"; // Update the save directory path
    ensureDirectoryExistence(saveDirectory);

    // Send a GET request to the page URL
    const response = await axios.get(pageUrl, {
      httpsAgent: agent,
      timeout: 10000,
      responseType: "stream",
    });

    // Load the HTML into Cheerio for parsing
    const $ = cheerio.load(response.data);
    // Find all video elements on the page
    const videoElements = $("video");
    console.log(videoElements);
    // Check if any video element is found
    if (videoElements.length === 0) {
      console.log("No video elements found on the page.");
      return [];
    }

    // Array to store downloaded video paths
    const downloadedVideos = [];

    // Iterate through each video element
    await Promise.all(
      videoElements.map(async (index, element) => {
        // Get the data-sources attribute which contains video URLs
        const dataSources = $(element).attr("data-sources");

        // Ensure data-sources attribute exists
        if (!dataSources) {
          console.log(`Data sources not found for video element ${index}`);
          return; // Skip to next video element
        }

        try {
          // Parse JSON from data-sources attribute
          const sources = JSON.parse(dataSources);

          // Find the highest quality video source (assuming sources are ordered by quality)
          const highestQualitySource = sources[sources.length - 1]; // Change this index based on your preference

          // Get the video URL from the highest quality source
          const videoUrl = highestQualitySource.src;

          // Ensure video URL exists
          if (!videoUrl) {
            console.log(`Video URL not found for element ${index}`);
            return; // Skip to next video element
          }

          // Generate a filename based on the video URL
          const videoFilename = path.basename(videoUrl);

          // Determine the save path for the video
          const savePath = path.join(
            saveDirectory,
            videoFilename.substring(0, 6) + ".mp4"
          );

          // Download the video
          const videoResponse = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream",
            httpsAgent: agent,

            timeout: 10000,
          });

          // Create a write stream to save the video file
          const writer = fs.createWriteStream(savePath);
          videoResponse.data.pipe(writer);

          // Return a promise that resolves when the video is downloaded
          await new Promise((resolve, reject) => {
            writer.on("finish", () => {
              console.log(`Video downloaded successfully: ${savePath}`);
              downloadedVideos.push({
                download_url: savePath,
                name: "DownloadVideo",
              });
              resolve();
            });
            writer.on("error", (err) => {
              console.error("Error writing video to file:", err);
              reject(err);
            });
          });
        } catch (error) {
          console.error(`Error downloading video ${index}:`, error);
        }
      })
    );

    // Return the array of downloaded video paths
    return downloadedVideos;
  } catch (error) {
    console.error("Error fetching page:", error);
    throw error; // Rethrow the error for handling in higher levels
  }
}

// Function to ensure directory existence
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

module.exports = { downloadVideosFromTikTok };
