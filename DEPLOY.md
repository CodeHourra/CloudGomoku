# 五子棋项目部署文档

## 项目结构

```
.
├── Dockerfile          # 前端服务 Dockerfile
├── Caddyfile          # Caddy 配置文件
├── docker-compose.yml  # Docker Compose 配置文件
└── server/
    └── Dockerfile     # 后端服务 Dockerfile
```

## 环境要求

- Docker 20.10.0 或更高版本
- Docker Compose 2.0.0 或更高版本

## 部署步骤

1. 确保服务器已安装 Docker 和 Docker Compose

2. 克隆项目代码到服务器

3. 修改配置文件
   - 检查 `Caddyfile` 中的 WebSocket 代理地址是否正确（当前配置为 9.134.2.4:3000）
   - 如需修改端口，请同时更新 `docker-compose.yml` 和 `Caddyfile` 中的端口配置

4. 构建和启动服务
   ```bash
   # 在项目根目录下执行
   docker-compose up -d --build
   ```

5. 验证服务状态
   ```bash
   # 查看容器运行状态
   docker-compose ps
   ```

## 访问服务

- 前端页面：http://9.134.2.4:5174
- WebSocket 服务：ws://9.134.2.4:3000

## 常见问题

1. 如果遇到端口占用问题，可以修改 `docker-compose.yml` 中的端口映射

2. 如果前端无法连接 WebSocket，请检查：
   - Caddyfile 中的 WebSocket 代理配置
   - 服务器防火墙是否放行相应端口

## 维护命令

```bash
# 查看服务日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新部署
git pull
docker-compose up -d --build
```

## 注意事项

1. 生产环境部署前请确保：
   - 已进行充分的测试
   - 所有敏感信息已正确配置
   - 服务器防火墙规则已正确设置

2. 建议定期备份数据和配置文件

3. 监控服务器资源使用情况，确保服务稳定运行