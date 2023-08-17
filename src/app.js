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
      res.end(JSON.stringify(profileResponse));
    })
    .catch((e) => {
      res.status(401);
      res.send(e.JSON);
    });
});

app.get("/direct-chats", (req, res) => {
  getDirectChatProfiles().then((profileResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(profileResponse));
  });
});

app.get("/direct-chats/:profileId", (req, res) => {
  getDirectMessages(req.params.profileId).then((profileResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(profileResponse));
  });
});

app.post("/direct-chats/:profileId", (req, res) => {
  postDirectMessages(req.params.profileId, req.body).then((response) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(response));
  });
});

app.get("/group-chats", (req, res) => {
  getChatGroups().then((groupResonse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(groupResonse));
  });
});

app.get("/group-chats/:gropupID", (req, res) => {
  getGroupChatMessages(req.params.gropupID).then((profileResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(profileResponse));
  });
});

app.post("/group-chats/:gropupID", (req, res) => {
  postGroupMessages(req.params.gropupID, req.body).then((response) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(response));
  });
});

app.get("/channels", (req, res) => {
  getChatChannels().then((groupResonse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(groupResonse));
  });
});

app.get("/channels/:channelID", (req, res) => {
  getGroupChatMessages(req.params.channelID).then((profileResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(profileResponse));
  });
});

app.post("/channels/:channelID", (req, res) => {
  postGroupMessages(req.params.channelID, req.body).then((response) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("access-control-allow-origin", "*");
    res.end(JSON.stringify(response));
  });
});

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
