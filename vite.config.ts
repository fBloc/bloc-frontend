import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";

console.log(path.resolve(__dirname, "./src/"));
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    // alias: {
    //   "@": path.resolve(__dirname, "./src"),
    //   "~": path.resolve(__dirname, "./node_modules/"),
    // },
    alias: [
      {
        find: /@\/(.+)/,
        replacement: path.resolve(__dirname, "./src/$1"),
      },
      {
        find: /~(.+)/,
        replacement: path.resolve(__dirname, "node_modules/$1"),
      },
    ],
  },
  define: {
    "process.env": {},
  },
  server: {
    proxy: {
      "/api": "http://82.157.98.91",
    },
  },
});
