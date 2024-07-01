<template>
  <div class="w-full flex flex-col min-h-screen">
    <nav class="">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <main class="flex-1">
      <router-view />
    </main>
    <FooterComp />
  </div>
</template>
<script setup>
  import FooterComp from "./components/plugin/FooterComp.vue";
</script>
<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  nav {
    padding: 30px;
  }

  nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  nav a.router-link-exact-active {
    color: #42b983;
  }
</style>
