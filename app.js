const express = require("express");
const DingDingTokenClient = require("./token");
const recognizeBusinessCard = require("./ocr");
const { extractBusinessCardInfo, sendMessageToUser } = require("./utils");
const axios = require("axios"); // 使用axios发送HTTP请求
require("dotenv").config();

const app = express();
const port = 9000;
// express parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post("/ocr", async (req, res) => {
  try {
    const dingdingMessage = req.body;
    // console.log(
    //   "Received DingDing message:",
    //   JSON.stringify(dingdingMessage, null, 2)
    // );
    const currentChatUserId = dingdingMessage.senderStaffId;

    switch (dingdingMessage.msgtype) {
      case "picture":
        // 获取token
        const token = await DingDingTokenClient.get_token();
        if (!token || !token.accessToken) {
          console.error("Failed to get token.");
          break;
        }

        // 使用token发送请求获取图片URL
        const downloadCode = dingdingMessage.content.downloadCode;
        const robotCode = dingdingMessage.robotCode;

        const imageUrlResponse = await axios.post(
          "https://api.dingtalk.com/v1.0/robot/messageFiles/download",
          {
            downloadCode: downloadCode,
            robotCode: robotCode,
          },
          {
            headers: {
              "x-acs-dingtalk-access-token": token.accessToken,
              "Content-Type": "application/json",
            },
          }
        );
        if (imageUrlResponse.data && imageUrlResponse.data.downloadUrl) {
          const imageUrl = imageUrlResponse.data.downloadUrl;
          console.log("Image URL:", imageUrl);
          // 处理imageUrl（调用OCR API）
          const cardRes = await recognizeBusinessCard(imageUrl);
          const cardInfoFormatted = extractBusinessCardInfo(cardRes);
          // 调用方法存入后端数据库
          // 通过第一次机器人聊天传入的json里面的conversationId，将这个ocr结果返回给用户
          const userIds = [];
          userIds.push(currentChatUserId);
          const msg = cardInfoFormatted;
          await sendMessageToUser({
            token: token.accessToken,
            robotCode,
            userIds,
            msgKey: "sampleText",
            msg,
          });
          console.log("cardInfoFormatted", cardInfoFormatted);
        } else {
          console.error("Failed to get image URL.");
        }

        break;

      case "text":
        const textContent = dingdingMessage.content.text;
        console.log("Received text:", textContent);
        break;

      default:
        console.log("Unknown message type.");
        break;
    }

    res.status(200).send("Message received.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to process the message.");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
