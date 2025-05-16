package pkg

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

const initUserPass = "admin:admin7777"
const cookieName = "_x_"
const cookieExpire = 3600

var AuthHashKey []byte
var CurAuthWithHash string

func init() {
	timestamp := time.Now().UnixNano()
	AuthHashKey = []byte(strconv.FormatInt(timestamp, 36))

	_userPass := os.Getenv("USER_PASS")
	if _userPass != "" {
		CurAuthWithHash = HashAuth(_userPass)
	} else {
		CurAuthWithHash = HashAuth(initUserPass)
	}
}

func SignCookie(c *gin.Context, hash string) {
	c.SetCookie(cookieName, hash, cookieExpire,
		"/", "", false, true)
}

func HashAuth(input string) string {
	inputByte := []byte(input)
	inputB64 := make([]byte, base64.StdEncoding.EncodedLen(len(inputByte)))
	base64.StdEncoding.Encode(inputB64, inputByte)

	hash := md5.Sum(append(AuthHashKey, inputB64...))
	return hex.EncodeToString(hash[:])
}

func AuthMiddleWare(c *gin.Context) {
	cookieAuth, err := c.Request.Cookie(cookieName)
	if err != nil || cookieAuth.Value != CurAuthWithHash {
		c.AbortWithStatus(401)
		return
	}
	SignCookie(c, cookieAuth.Value)
	c.Next()
}
