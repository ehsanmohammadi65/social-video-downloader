<template>
  <div class="flex flex-col items-center p-4 relative">
    <!-- ویدئو و کنترل‌های آن -->
    <div
      class="relative w-full"
      :class="{ 'max-w-lg': !isFullscreen, fullscreen: isFullscreen }">
      <video
        ref="video"
        :poster="poster"
        @loadeddata="capturePoster"
        @timeupdate="updateTime"
        @ended="stopVideo"
        class="w-full mb-4">
        <source :src="videoSrc" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <!-- کنترل‌های ویدئو -->
      <div
        class="absolute bottom-0 left-0 right-0 flex flex-col items-center p-2 bg-gray-800 bg-opacity-60">
        <div class="flex flex-wrap justify-center space-x-2 mb-2">
          <button
            @click="playVideo"
            class="px-4 py-2 bg-blue-500 text-white rounded mb-2 sm:mb-0">
            Play
          </button>
          <button
            @click="pauseVideo"
            class="px-4 py-2 bg-blue-500 text-white rounded mb-2 sm:mb-0">
            Pause
          </button>
          <button
            @click="stopVideo"
            class="px-4 py-2 bg-blue-500 text-white rounded mb-2 sm:mb-0">
            Stop
          </button>
          <button
            @click="toggleMute"
            class="px-4 py-2 bg-blue-500 text-white rounded mb-2 sm:mb-0">
            {{ isMuted ? "Unmute" : "Mute" }}
          </button>
        </div>
        <div class="w-full max-w-lg flex items-center space-x-2">
          <input
            type="range"
            min="0"
            :max="duration"
            step="0.1"
            v-model="currentTime"
            @input="seek"
            class="w-full" />
          <span class="text-sm"
            >{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span
          >
        </div>
      </div>
      <!-- دکمه تمام صفحه -->
      <div class="absolute top-2 right-2">
        <button
          @click="toggleFullscreen"
          class="px-2 py-1 rounded bg-blue-500 bg-opacity-60">
          <img :src="fullscrenimg" class="w-8 h-8" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, defineProps } from "vue";
  import fullscrenimg from "../../assets/img/fullscreen.png";
  const props = defineProps({
    videoSrc: {
      type: String,
      required: true,
    },
  });

  const video = ref(null);
  const currentTime = ref(0);
  const duration = ref(0);
  const isMuted = ref(false);
  const isFullscreen = ref(false);
  const poster = ref("");

  const playVideo = () => {
    video.value.play();
  };

  const pauseVideo = () => {
    video.value.pause();
  };

  const stopVideo = () => {
    video.value.pause();
    video.value.currentTime = 0;
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    video.value.muted = isMuted.value;
  };

  const toggleFullscreen = () => {
    const videoContainer = video.value.parentNode;
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.mozRequestFullScreen) {
        // Firefox
        videoContainer.mozRequestFullScreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        // Chrome, Safari and Opera
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        // IE/Edge
        videoContainer.msRequestFullscreen();
      }
      isFullscreen.value = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        // Chrome, Safari and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
      }
      isFullscreen.value = false;
    }
  };

  const updateTime = () => {
    currentTime.value = video.value.currentTime;
    duration.value = video.value.duration;
  };

  const seek = () => {
    video.value.currentTime = currentTime.value;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const capturePoster = () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.value.videoWidth;
    canvas.height = video.value.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video.value, 0, 0, canvas.width, canvas.height);
    poster.value = canvas.toDataURL("image/jpeg");
    video.value.currentTime = 0; // reset video to start
  };

  // Watch for changes in the videoSrc prop to reset the player
  watch(
    () => props.videoSrc,
    () => {
      if (video.value) {
        video.value.load();
        currentTime.value = 0;
        duration.value = 0;
        poster.value = ""; // reset poster
      }
    }
  );
</script>

<style scoped>
  /* استایل برای حالت تمام صفحه */
  .fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }

  /* استایل برای کنترل‌های ویدئو */
  video {
    display: block;
  }

  input[type="range"] {
    cursor: pointer;
  }

  /* استایل برای کنترل‌ها و نوار پیشرفت */
  .bg-gray-800 {
    background-color: rgba(0, 0, 0, 0.6);
  }
</style>
