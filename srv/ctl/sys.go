package ctl

import (
	"errors"
	"net/http"
	"time"
	"trace-gui/pkg"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetSys(ctx *gin.Context) {
	result := gin.H{}

	// 获取集合的统计信息
	stats := bson.M{}
	err := pkg.Mongo_Database.RunCommand(ctx, bson.M{"collStats": pkg.Mongo_Collection_Name}).Decode(&stats)
	if err != nil {
		var cmdErr mongo.CommandError
		if errors.As(err, &cmdErr) && cmdErr.Code == 26 {
			stats["size"] = int64(0)
			stats["count"] = int64(0)
		} else {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"err": "Get Collection Stats Failed",
			})
			return
		}
	}

	result["size"] = stats["size"]
	result["rows"] = stats["count"]

	// 3. 近1小时总条数
	oneHourAgo := time.Now().Add(-1 * time.Hour)
	filter := bson.M{"time": bson.M{"$gte": oneHourAgo}}
	result["rate"], err = pkg.Mongo_Collection.CountDocuments(ctx, filter)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"err": "Get Rate Failed",
		})
		return
	}

	// 4. 第一个的时间
	var firstDocument bson.M
	err = pkg.Mongo_Collection.FindOne(ctx, bson.M{}).Decode(&firstDocument)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			result["start"] = nil
		} else {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"err": "Get First Document Failed",
			})
			return
		}
	} else {
		result["start"] = firstDocument["time"]
	}

	// 5. 所有条目中，app这个字段去重后的结果，有哪些
	result["apps"], err = pkg.Mongo_Collection.Distinct(ctx, "app", bson.M{})
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"err": "Get App Distinct Failed",
		})
		return
	}

	// 6. 所有条目中，srv这个字段去重后的结果，有哪些
	result["srvs"], err = pkg.Mongo_Collection.Distinct(ctx, "srv", bson.M{})
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"err": "Get Srv Distinct Failed",
		})
		return
	}

	ctx.JSON(http.StatusOK, result)
}
