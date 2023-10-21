const express = require("express");
const { handlePictureMessage } = require("./utils");
require("dotenv").config({ path: "./.env" });

const app = express();
const port = 9000;
// express parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/ocr", async (req, res) => {
  try {
    const dingdingMessage = req.body;
    console.log(
      "Received DingDing message:",
      JSON.stringify(dingdingMessage, null, 2)
    );

    switch (dingdingMessage.msgtype) {
      case "picture":
        await handlePictureMessage(dingdingMessage);
        break;
      case "text":
        console.log("Received text:", dingdingMessage.content.text);
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
