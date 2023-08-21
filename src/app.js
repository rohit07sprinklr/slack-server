import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  getDirectChatProfiles,
  getDirectMessages,
  getLoginProfile,
  postDirectMessages,
} from "../utils/profileUtils.js";
import {
  getChatChannels,
  getChatGroups,
  getGroupChatMessages,
  postGroupMessages,
} from "../utils/groupUtils.js";
import jwt from "jsonwebtoken";
import { secretKey } from "../utils/constants.js";
import { authenticateJWT } from "./middleware.js";

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { getDirectChatProfiles } = require("../utils/profileUtils");

//Globals
const port = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//Routes
app.get("/", (req, res) => {
  res.send("App is running");
});

app.post("/login", (req, res) => {
  getLoginProfile(req.body)
    .then((profileResponse) => {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("access-control-allow-origin", "*");
      const accessToken = jwt.sign(profileResponse, secretKey);
      res.end(JSON.stringify({ token: accessToken }));
    })
    .catch((e) => {
      res.status(401);
      res.send(e.JSON);
    });
});

app.get("/profile", authenticateJWT, (req, res) => {
  const { user } = req.body;
  if (user) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(user));
  } else {
    res.status(401);
    res.send("No profile Found");
  }
});

app.get("/direct-chats", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  getDirectChatProfiles(userID).then((profileResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(profileResponse));
  });
});

app.get("/direct-chats/:profileId", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  getDirectMessages(req.params.profileId, userID).then((profileResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(profileResponse));
  });
});

app.post("/direct-chats/:profileId", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  postDirectMessages(req.params.profileId, req.body, userID).then(
    (response) => {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("access-control-allow-origin", "*");
      res.end(JSON.stringify(response));
    }
  );
});

app.get("/group-chats", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  getChatGroups(userID).then((groupResonse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(groupResonse));
  });
});

app.get("/group-chats/:gropupID", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  getGroupChatMessages(req.params.gropupID).then((profileResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(profileResponse));
  });
});

app.post("/group-chats/:gropupID", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  postGroupMessages(req.params.gropupID, req.body, userID).then((response) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(response));
  });
});

app.get("/channels", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  getChatChannels(userID).then((groupResonse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(groupResonse));
  });
});

app.get("/channels/:channelID", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  getGroupChatMessages(req.params.channelID).then((profileResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(profileResponse));
  });
});

app.post("/channels/:channelID", authenticateJWT, (req, res) => {
  const { user } = req.body;
  const userID = user.id;
  postGroupMessages(req.params.channelID, req.body, userID).then((response) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(response));
  });
});

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});

// server.keepAliveTimeout = 120 * 1000;
// server.headersTimeout = 120 * 1000;
