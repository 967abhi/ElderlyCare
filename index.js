const express = require("express");
const database = require("./config/db");
const app = express();
const port = 3000;
const cors = require("cors");
const userRoutes = require("./src/routes/userRoutes");
const cookieParser = require("cookie-parser");
// const dotenv = require("dotenv");
require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
// app.use(dotenv);

app.get("/from", (req, res) => {
  res.send("Hello from the api");
});

app.use("/", userRoutes);

database
  .then(() => {
    console.log("database is connected");
    app.listen(port, () => {
      console.log(`server is running on the ${port}`);
    });
  })
  .catch((err) => {
    console.log("server is not connected", err);
  });
