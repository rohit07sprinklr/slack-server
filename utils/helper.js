import "core-js";
import * as constants from "./constants.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const fs = require("fs").promises;
// const path = require("path");

export async function readFile(pathName) {
  try {
    const configPath = path.join(__dirname, pathName);
    const configData = await fs.readFile(configPath);
    return JSON.parse(configData);
  } catch (e) {
    throw new Error(e.toString());
  }
}

export async function writeFile(configJSONData, pathName) {
  try {
    const configPath = path.join(__dirname, pathName);
    await fs.writeFile(configPath, JSON.stringify(configJSONData));
  } catch (e) {
    throw new Error(e.toString());
  }
}

export const getFilteredMessageWithSendor = async (filteredMessage) => {
  const profileInfo = await readFile(constants.PROFILE_DATA);
  return filteredMessage.map((message) => {
    const sendorID = message?.sendorId?.toString();
    const sendorProfile = profileInfo?.profiles?.filter(
      (itm) => itm.id.toString() === sendorID
    )[0];
    return {
      ...message,
      sendorAvatarSrc: sendorProfile?.imageSrc,
      sendorName: sendorProfile?.name,
    };
  });
};

export const paginateResponse = (responseList, limit) => {
  return responseList.slice(Math.max(responseList.length - limit, 0));
};
