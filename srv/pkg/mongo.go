package pkg

import (
	"context"
	"fmt"
	"log"
	"os"
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

const defaultMongoURI = "mongodb://127.0.0.1:27017/trace"

func init() {
	var err error
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = defaultMongoURI
	}
	if databaseName := os.Getenv("MONGO_DATABASE"); databaseName != "" {
		Mongo_Database_Name = databaseName
	}
	if collectionName := os.Getenv("MONGO_COLLECTION"); collectionName != "" {
		Mongo_Collection_Name = collectionName
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	Mongo_Client, err = mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Init MongoDB: 创建 Connect 失败, %v", err)
	}
	err = Mongo_Client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Init MongoDB: 尝试Ping服务器失败, %v", err)
	}

	Mongo_Database = Mongo_Client.Database(Mongo_Database_Name)
	Mongo_Collection = Mongo_Database.Collection(Mongo_Collection_Name)

	fmt.Printf("MongoDB连接成功: database=%s collection=%s\n", Mongo_Database_Name, Mongo_Collection_Name)
}
