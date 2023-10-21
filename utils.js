const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const DingDingTokenClient = require("./token");
const recognizeBusinessCard = require("./ocr");

/**
 * @name 发送给用户的消息
 * @param { token, robotCode, userIds,msgKey, msg} token ,robotCode, 用户id，消息key，消息内容
 * @returns
 */
async function sendMessageToUser({ token, robotCode, userIds, msgKey, msg }) {
  const API_URL = `https://api.dingtalk.com/v1.0/robot/oToMessages/batchSend?access_token=${token}`;
  const headers = {
    "x-acs-dingtalk-access-token": token,
    "Content-Type": "application/json",
  };

  // 根据你的描述，msgParam应该是一个字符串
  const msgParam = JSON.stringify({
    content: msg,
  });

  const payload = {
    robotCode,
    userIds,
    msgKey,
    msgParam,
  };

  console.log("API_URL", API_URL);
  console.log("msg payload", payload);
  console.log("header ", headers);

  try {
    const response = await axios.post(API_URL, payload, { headers });
    return response.data; // 返回响应数据
  } catch (error) {
    // console.error("Error sending message:", error);
    throw error; // 抛出错误让调用者处理
  }
}

/**
 * @name 发送状态交互卡片
 */
async function sendStatusCard(options, token) {
  const receiverUserIdList = ["manager1767"]; // manager1767 为秋玲的id
  receiverUserIdList.push(options.senderStaffId);
  const endpoint = "https://api.dingtalk.com/v1.0/im/interactiveCards/send";

  const headers = {
    "x-acs-dingtalk-access-token": token, // 请替换为实际的access token
    "Content-Type": "application/json",
  };

  const data = {
    cardTemplateId: "87b8a44b-08de-40c1-b717-8b3323396bac.schema", // 你可以提供默认值或直接使用必须的值
    openConversationId: options.openConversationId,
    receiverUserIdList,
    outTrackId: uuidv4(),
    robotCode: options.robotCode,
    conversationType: options.conversationType, // 0 单聊，1 群聊
    // callbackRouteKey: options.callbackRouteKey || "DEFAULT_CALLBACK_ROUTE_KEY",
    cardData: options.cardData || {},
    // privateData: options.privateData || {},
    chatBotId: options.chatbotUserId || "DEFAULT_CHATBOT_ID",
    // cardOptions: options.cardOptions || { supportForward: true },
    // pullStrategy: options.pullStrategy || false,
  };

  try {
    const response = await axios.post(endpoint, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error sending status card:", error);
    throw error;
  }
}

/**
 * @name format从OCR服务传回的卡片信息
 * @param {*} cardRes
 * @returns
 */
function extractBusinessCardInfo(cardRes) {
  let resultString = "";

  if (cardRes && cardRes.BusinessCardInfos) {
    cardRes.BusinessCardInfos.forEach((info, index) => {
      resultString += `${info.Name}: ${info.Value}`;

      // 如果不是最后一项，添加换行符
      if (index !== cardRes.BusinessCardInfos.length - 1) {
        resultString += "\n";
      }
    });
  }
  console.log(resultString);
  return resultString;
}

function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) || // 判断空数组
    (typeof value === "object" && Object.keys(value).length === 0) // 判断空对象
  );
}

// 抽取函数处理图片消息
async function handlePictureMessage(dingdingMessage) {
  const token = await DingDingTokenClient.get_token();
  if (!token || !token.accessToken) {
    throw new Error("Failed to get token.");
  }

  const downloadCode = dingdingMessage.content.downloadCode;
  const robotCode = dingdingMessage.robotCode;

  const imageUrl = await getImageUrl(
    token.accessToken,
    downloadCode,
    robotCode
  );
  const cardRes = await recognizeBusinessCard(imageUrl);
  const cardInfoFormatted = extractBusinessCardInfo(cardRes);

  const userIds = ["manager1767"]; // manager1767 为秋玲的id
  userIds.push(dingdingMessage.senderStaffId);

  await sendMessageToUser({
    token: token.accessToken,
    robotCode,
    userIds,
    msgKey: "sampleText",
    msg: cardInfoFormatted,
  });

  await sendStatusCard(dingdingMessage, token.accessToken);
}

async function getImageUrl(accessToken, downloadCode, robotCode) {
  const response = await axios.post(
    "https://api.dingtalk.com/v1.0/robot/messageFiles/download",
    { downloadCode, robotCode },
    {
      headers: {
        "x-acs-dingtalk-access-token": accessToken,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data && response.data.downloadUrl) {
    return response.data.downloadUrl;
  } else {
    throw new Error("Failed to get image URL.");
  }
}

module.exports = {
  handlePictureMessage,
};
