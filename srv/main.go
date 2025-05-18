package main

import (
	"embed"
	"io/fs"
	"net/http"
	"trace-gui/ctl"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

//go:embed web/*
var webEmbedFs embed.FS

func main() {

	router := gin.Default()
	router.ContextWithFallback = true

	router.Use(gzip.Gzip(gzip.DefaultCompression))

	webFs, err := fs.Sub(webEmbedFs, "web")
	if err != nil {
		panic(err)
	}
	webHttpFs := http.FileServer(http.FS(webFs))

	router.Use(func(c *gin.Context) {
		if len(c.Request.URL.Path) >= 5 && c.Request.URL.Path[:5] == "/api/" {
			c.Next()
			return
		}

		if _, err := webFs.Open(c.Request.URL.Path[1:]); err != nil {
			c.Request.URL.Path = "/"
		}
		webHttpFs.ServeHTTP(c.Writer, c.Request)
	})

	router.POST("/api/v1/login", ctl.Login)
	router.POST("/api/v1/logout", ctl.Logout)

	apiRouter := router.Group("/api/v1/")
	// apiRouter.Use(pkg.AuthMiddleWare)

	apiRouter.POST("/search_by_id", ctl.SearchById)
	apiRouter.POST("/search_by_cond", ctl.SearchByCond)
	apiRouter.POST("/get_sys", ctl.GetSys)

	// 启动 HTTP 服务，监听在 7777 端口
	router.Run(":80")
}
