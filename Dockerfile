# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM caddy:2-alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/caddy

# 复制 Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# 暴露端口
EXPOSE 5174

# 启动 Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]