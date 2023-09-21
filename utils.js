const axios = require("axios");

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

module.exports = {
  extractBusinessCardInfo,
  sendMessageToUser,
  isEmpty,
};
