# 开发项目

- 安装pnpm

  `npm i pnpm -g`

- 安装依赖

  `pnpm i`

- 运行项目

  `npm run dev`

---

**修改运行端口**

修改根目录`vite.config.ts`文件中`server` -> `port`（默认3338）

---

**修改http请求地址**

修改根目录`vite.config.ts`文件中`define` -> `__HTTP_URL__`。此处注意，由于是直接替换文本，所以请务必像初始值一样，是`"'XXX'"`的形式，而非`"XXX"`(注意引号的区别)。