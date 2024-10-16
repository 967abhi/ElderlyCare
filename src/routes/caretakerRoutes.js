const express = require("express");
const caretakerRouter = express();

caretakerRouter.get("/caretaker", (req, res) => {
  res.send("hi from the care taker");
});

module.exports = caretakerRouter;
