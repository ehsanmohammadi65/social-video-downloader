<template>
  <div class="w-full font-inter">
    <loading
      v-model:active="isLoading"
      :can-cancel="true"
      :on-cancel="onCancel"
      :is-full-page="fullPage" />
    <header class="w-full mt-10">
      <h2 class="md:text-[30px] text-[20px]">
        Welcome to Social Video Downloader
      </h2>
    </header>
    <body>
      <div>
        <h4>Download video instagram | Youtube | Linkedin</h4>
      </div>
      <div class="flex w-full items-center justify-center mt-10">
        <input
          type="text"
          name="url"
          class="border h-10 md:w-[20rem] w-[15rem] rounded me-3 ms-2 md:ms-0"
          placeholder="URL: http://example.com"
          v-model="url" />

        <button
          id="check"
          class="button md:w-32 h-10 text-[15px] md:text-[25px]"
          @click="sendUrl">
          Download
        </button>
      </div>
      <div class="w-full flex justify-center items-center text-center">
        <div class="w-full text-center">
          <div
            v-if="newUrl.length > 0"
            class="w-full text-[20px] text-red-400 items-start text-start flex justify-start">
            <h4 class="w-full flex text-center justify-center items-center">
              All links will be deleted after 30 minutes
            </h4>
          </div>
          <div
            class="flex justify-center items-center text-center w-full"
            v-if="btndownload">
            <div>
              <div
                class="button w-32 h-10 mt-5 flex justify-center text-center items-center"
                v-for="urln in newUrl"
                :key="urln.name">
                <a :href="`${hostDomain}:8443/` + urln.download_url"
                  >{{ urln.name }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
  </div>
</template>

<script setup>
  import { ref } from "vue";

  import Loading from "vue-loading-overlay";
  import "vue-loading-overlay/dist/css/index.css";
  import axios from "axios";
  const hostDomain = "https://svdl.pro";
  console.log("hsot", hostDomain);
  let newUrl = ref("");
  let url = ref("");
  var isLoading = ref(false);
  var fullPage = ref(true);
  var btndownload = ref(false);
  const sendUrl = async () => {
    try {
      isLoading.value = true;
      const response = await axios
        .post(`${hostDomain}:8443/check`, {
          url: url.value,
        })
        .then((val) => {
          isLoading.value = false;
          btndownload.value = true;
          return val;
        })
        .catch((err) => {
          isLoading.value = false;
          btndownload.value = false;
          return err;
        });

      newUrl.value = response.data.download_link;

      console.log(response.data.download_link); // برای مشاهده مقدار newUrl در کنسول
    } catch (error) {
      console.error("Error:", error);
      newUrl.value = "Error fetching data";
    }
  };
</script>

<style lang="scss" scoped></style>
