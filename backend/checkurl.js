const url = require("url");

function identifyWebsite(urlString) {
  // تجزیه URL
  const parsedUrl = url.parse(urlString);
  const hostname = parsedUrl.hostname;

  // بررسی hostname برای تشخیص سایت
  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    return "YouTube";
  } else if (hostname.includes("linkedin.com")) {
    return "LinkedIn";
  } else if (hostname.includes("instagram.com")) {
    return "Instagram";
  } else if (hostname.includes("pinterest.com")) {
    return "Pinterest";
  } else if (hostname.includes("twitter.com")) {
    return "Twitter";
  } else if (hostname.includes("tiktok.com")) {
    return "TikTok";
  } else {
    return "None of the specified sites";
  }
}

module.exports = { identifyWebsite };
