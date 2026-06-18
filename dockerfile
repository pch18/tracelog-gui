# 编译 golang
from golang:alpine3.20 as builder

workdir /srv

copy ./srv /srv

run go build -o /app-bin .

# 构建镜像，内置 MongoDB 和 trace-gui 服务
from mongo:8-nanoserver

env MONGO_USERNAME=trace
env MONGO_DATABASE=trace
env MONGO_COLLECTION=log
env MONGO_AUTH_SOURCE=admin

copy --from=builder /app-bin /trace-gui_app
copy ./entrypoint /trace-gui_entrypoint
run chmod 755 /trace-gui_app /trace-gui_entrypoint

volume /data/db

expose 80
expose 27017
entrypoint ["/trace-gui_entrypoint"]
