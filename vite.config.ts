import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    port: 3338,
  },
  define: {
    __HTTP_URL__: "'http://82.157.98.91/'",
    __MAX_TEXTAREA_LENGTH__: 100,
    __MAX_INPUT_LENGTH__: 40,
    __MAX_MULTI_FORM_COUNT__: 10,
    __DEFAULT_INPUT_PLACEHOLDER__: "'请输入'",
    __DEFAULT_TEXTAREA_PLACEHOLDER__: "'请输入'",
    __DEFAULT_SELECT_PLACEHOLDER__: "'请选择'",
    __DEFAULT_JSON_PLACEHOLDER__: "'请输入有效的json数据'",
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
  css: {
    preprocessorOptions: { scss: { charset: false, additionalData: `$primary: #0293ab;` } },
  },
  build: {
    sourcemap: true,
  },
});
