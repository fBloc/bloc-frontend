# 开发项目

- 安装pnpm

  `npm i pnpm -g`

- 安装依赖

  `pnpm i`

- 运行项目

  `npm run dev`

---

**docker**

生成镜像： `docker build -t blocf .`

运行:
```bash
docker run --name bloc -e BASE_URL="YOUR API BASE URL" -p 8083:80 blocf:latest

# BASE_URL指API域名
```

浏览器打开: `http://localhost:8083/flow`