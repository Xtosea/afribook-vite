import { precacheAndRoute } from 'workbox-precaching';

// This line is required by Workbox
precacheAndRoute(self.__WB_MANIFEST);