// This file is auto-generated, don't edit it
const isEmpty = require("./utils").isEmpty;
const dingtalk = require("@alicloud/dingtalk/dist");
const $OpenApi = require("@alicloud/openapi-client");

const appKey = process.env.DING_APP_KEY;
const appSecret = process.env.DING_APP_SECRET;

console.log("appENV", process.env);
console.log("app key", appKey);
console.log("app secret", appSecret);

class DingDingTokenClient {
  /**
   * 使用 Token 初始化账号Client
   * @return Client
   * @throws Exception
   */
  static createClient() {
    let config = new $OpenApi.Config({});
    config.protocol = "https";
    config.regionId = "central";
    return new dingtalk.oauth2_1_0.default(config);
  }

  static async get_token() {
    let client = DingDingTokenClient.createClient();
    let getAccessTokenRequest = new dingtalk.oauth2_1_0.GetAccessTokenRequest({
      appKey,
      appSecret,
    });
    try {
      const res = await client.getAccessToken(getAccessTokenRequest);
      const tokenBody = res.body;
      console.log("Got Token Body from Dingding", tokenBody);
      return tokenBody;
    } catch (err) {
      if (!isEmpty(err.code) && !isEmpty(err.message)) {
        console.log("token.js Error code: ", err.code);
        console.log("token.js Error message: ", err.message);
        // err 中含有 code 和 message 属性，可帮助开发定位问题
      }
    }
  }
}

// DingDingTokenClient.get_token();

module.exports = DingDingTokenClient; // 如果你打算在其他文件中使用这个 Client 类，记得导出它
