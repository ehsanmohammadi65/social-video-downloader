<template>
  <div
    class="bg-gray-100 absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center">
    <header class="bg-blue-500 text-white w-full ps-4 pe-4 pt-4 text-center">
      <h1 class="text-2xl font-bold">Social Media Video Downloader</h1>
      <p class="mt-2">
        Telegram Robot
        <a :href="TelegramLink" target="_blank" class="underline"
          >Go To Telegarm</a
        >
      </p>
      <p class="mt-2">
        Developed by
        <a :href="githubLink" target="_blank" class="underline"
          >Ehsan Mohammadi</a
        >
      </p>
    </header>

    <footer
      class="bg-blue-500 text-white w-full ps-4 pe-4 pb-4 text-center mt-0">
      <p>
        Connect with Ehsan Mohammadi on
        <a :href="linkedinLink" target="_blank" class="underline">LinkedIn</a>
      </p>
    </footer>
  </div>
</template>
<script setup>
  import { ref } from "vue";

  const githubLink = ref("https://github.com/ehsanmohammadi65");
  const linkedinLink = ref("https://www.linkedin.com/in/ehsan-mohammadi-pv/");
  const TelegramLink = ref("https://t.me/svdlpro_bot");
</script>

<style scoped>
  /* Additional scoped styles can be added here */
</style>
