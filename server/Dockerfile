FROM mirror.ccs.tencentyun.com/library/node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "server.js"]