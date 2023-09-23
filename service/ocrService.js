const http = require("../.api/index.js");
const storeToDb = async (data) => {
  const baseUrl = "";

  return await http.post(baseUrl + "/bussinessCardInfo", params);
};

module.export = {
  storeToDb,
};
