import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react";
import path from "path";
import analyzer from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    analyzer({
      open: true,
    }),
  ],
  server: {
    port: 3338,
  },
  define: {
    /**
     * FLOW的名字长度限制
     */
    __MAX_FLOW_NAME_LENGTH__: 100,
  },
  resolve: {
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
  build: {
    sourcemap: true,
  },
});
