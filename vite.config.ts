import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    proxy: {
      "/data": {
        target: "http://localhost:5000/",
        changeOrigin: true,
        configure: (proxy, options) => {
          // proxy will be an instance of 'http-proxy'
          const username = "username";
          const password = "password";
          options.auth = `${username}:${password}`;
        },
      },
    },
  },
});
