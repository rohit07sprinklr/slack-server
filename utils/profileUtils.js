import "core-js";
import { getFilteredMessageWithSendor, readFile, writeFile } from "./helper.js";
import * as constants from "./constants.js";

export async function profileSignup(body) {
  const formData = body;
  const profileInfo = await readFile(constants.PROFILE_DATA);
  const newProfileID = profileInfo?.profiles?.at(-1)?.id + 1;

  const newProfileBody = {
    id: newProfileID,
    name: formData.name,
    imageSrc: constants.DEFAULT_PROFILE_IMAGE_SRC,
    groups: [],
  };
  profileInfo?.profiles?.push(newProfileBody);
  await writeFile(profileInfo, constants.PROFILE_DATA);

  const profilecreds = await readFile(constants.CREDS);
  const newCredBody = {
    id: newProfileID,
    email: formData.email,
    password: formData.password,
  };
  profilecreds?.creds?.push(newCredBody);
  await writeFile(profilecreds, constants.CREDS);
  return { email: newCredBody.email, password: newCredBody.password };
}
export async function getLoginProfile(body) {
  const credential = body;
  const profilecreds = await readFile(constants.CREDS);
  const profileInfo = await readFile(constants.PROFILE_DATA);
  const profile = profilecreds["creds"].filter(
    (itm) =>
      itm?.email === credential.email && itm?.password === credential.password
  );
  if (profile && profile?.length) {
    const profileID = profile[0]?.id;
    const res = profileInfo?.profiles.filter((itm) => itm.id === profileID);
    return res[0];
  } else {
    throw new Error();
  }
}

export async function getDirectChatProfiles(userID) {
  const directMessages = await readFile(constants.DIRECT_MESSAGE_USERS);
  const currentUserMessages = directMessages?.direct_messages?.filter(
    (itm) => itm.id === userID
  )[0];
  const profileInfo = await readFile(constants.PROFILE_DATA);
  const res = profileInfo?.profiles?.filter((itm) =>
    currentUserMessages?.message_user_id?.includes(itm.id)
  );
  return { profiles: res };
}

const filterUserMessage = (message, profileId, userID) => {
  return (
    (message?.sendorId?.toString() === userID.toString() &&
      message?.recieverId?.toString() === profileId) ||
    (message?.sendorId?.toString() === profileId &&
      message?.recieverId.toString() === userID.toString())
  );
};

export async function getDirectMessages(profileId, userID) {
  const directMessages = await readFile(constants.MESSAGES);
  const filteredMessage = directMessages?.messages?.filter((message) =>
    filterUserMessage(message, profileId, userID)
  );
  const filteredMessageWithSendor = await getFilteredMessageWithSendor(
    filteredMessage
  );
  return { messages: filteredMessageWithSendor };
}

export async function postDirectMessages(profileId, body, userID) {
  const message = body.message;
  const directMessages = await readFile(constants.MESSAGES);
  const messageID = directMessages?.messages?.at(-1)?.id + 1;
  const newMessageBody = {
    id: messageID,
    timestamp: Math.floor(+new Date() / 1000),
    sendorId: userID.toString(),
    recieverId: profileId,
    text: message,
  };
  directMessages?.messages?.push(newMessageBody);
  await writeFile(directMessages, constants.MESSAGES);
  const responseBodyArr = await getFilteredMessageWithSendor([newMessageBody]);
  return responseBodyArr[0];
}
