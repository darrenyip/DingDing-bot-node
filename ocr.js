// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require("tencentcloud-sdk-nodejs");

const secretId = process.env.TX_SECRET_ID;
const secretKey = process.env.TX_SECRET_KEY;

const OcrClient = tencentcloud.ocr.v20181119.Client;

const clientConfig = {
  credential: {
    secretId,
    secretKey,
  },
  region: "ap-guangzhou",
  profile: {
    httpProfile: {
      endpoint: "ocr.tencentcloudapi.com",
    },
  },
};

// 实例化要请求产品的client对象,clientProfile是可选的
const client = new OcrClient(clientConfig);

function recognizeBusinessCard(imageUrl) {
  return new Promise((resolve, reject) => {
    // "ImageBase64": "base64",
    // "ImageUrl": "url"
    const params = {
      ImageUrl: imageUrl,
    };

    client.BusinessCardOCR(params).then(
      (data) => {
        resolve(data);
      },
      (err) => {
        reject(err);
      }
    );
  });
}

module.exports = recognizeBusinessCard;
