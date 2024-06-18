// src/service-worker.js
import { precacheAndRoute } from "workbox-precaching";

// Add your custom service worker logic here
precacheAndRoute(self.__WB_MANIFEST);
