# Trace 日志查询系统

## 登录方式

- 默认连接地址: http://IP:9999
- 默认用户名: admin
- 默认密码: admin7777


## docker 安装命令:
```
docker run -d --name trace-gui \
  -p 9999:80 \
  -p 27017:27017 \
  -e MONGO_PASSWORD='change_this_password' \
  -v trace-gui_mongo:/data/db \
  --restart always \
  pch18/trace-gui
```
镜像内置 MongoDB，数据目录为 `/data/db`。MongoDB 默认账号为 `trace`，认证库为 `admin`，业务数据库为 `trace`，集合为 `log`，必须通过 `MONGO_PASSWORD` 设置密码。

写入日志的服务可以连接:
```
mongodb://trace:change_this_password@服务器IP:27017/trace?authSource=admin
```
建议 `MONGO_PASSWORD` 使用字母、数字、下划线等 URI 友好字符。如果包含 `@`、`:`、`/` 等特殊字符，写入服务连接串里的密码需要 URL 编码。

支持多架构，amd64, arm64 等，如果缺了某个架构的构建，请提 issue

## 构建发布
```
cd web
pnpm build
cd ..
docker buildx create --use
docker buildx build --platform=linux/amd64 -t pch18/trace-gui . --push
```
## 直接编译指定版本的 golang
```
GOOS=linux GOARCH=amd64 go build -o trace-gui main.go
```
