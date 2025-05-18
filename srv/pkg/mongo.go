package pkg

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Mongo_Client          *mongo.Client
	Mongo_Database        *mongo.Database
	Mongo_Collection      *mongo.Collection
	Mongo_Database_Name   = "trace"
	Mongo_Collection_Name = "log"
)

const logDbUri = "mongodb://trace:sP8cV1tR2oY0mJ0h@trace.easit.jp:27017/trace?authSource=admin"

func init() {
	var err error

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	Mongo_Client, err = mongo.Connect(ctx, options.Client().ApplyURI(logDbUri))
	if err != nil {
		log.Fatalf("Init MongoDB: 创建 Connect 失败, %v", err)
	}
	err = Mongo_Client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Init MongoDB: 尝试Ping服务器失败, %v", err)
	}

	Mongo_Database = Mongo_Client.Database("trace")
	Mongo_Collection = Mongo_Database.Collection("log")

	fmt.Println("MongoDB连接成功")
}
