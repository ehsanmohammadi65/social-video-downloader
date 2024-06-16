<template>
  <div class="w-full font-inter">
    <div class="w-full">
      <h2 class="text-[30px]">Welcome to Social Video Downloader</h2>
    </div>
    <div class="flex w-full items-center justify-center mt-10">
      <label for="url" class="text-[20px] pe-3"> URL</label>
      <input
        type="text"
        name="url"
        class="border h-10 w-[20rem] rounded me-3"
        placeholder="URL: http://example.com"
        v-model="url" />

      <button id="check" class="button w-32 h-10" @click="sendUrl">
        Download Video
      </button>
    </div>
    <div class="w-full">{{ newUrl }}</div>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import axios from "axios";

  let newUrl = ref("");
  let url = ref("");
  const sendUrl = async () => {
    try {
      const response = await axios.post("http://5.161.155.227:4000/check", {
        url: url.value,
      });

      newUrl.value = response.data.download_link
        ? response.data.download_link.videolink
        : response.data.url;
      console.log(newUrl.value); // برای مشاهده مقدار newUrl در کنسول
    } catch (error) {
      console.error("Error:", error);
      newUrl.value = "Error fetching data";
    }
  };
</script>

<style lang="scss" scoped></style>
