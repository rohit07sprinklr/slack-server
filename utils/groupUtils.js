import "core-js";
import { getFilteredMessageWithSendor, readFile, writeFile } from "./helper.js";
import * as constants from "./constants.js";

async function getUserGroups(userID) {
  const profiles = await readFile(constants.PROFILE_DATA);
  const user_profile = profiles?.profiles?.filter(
    (itm) => itm.id.toString() === userID.toString()
  )[0];
  return user_profile?.groups;
}

export async function getChatGroups(userID) {
  const groupsData = await readFile(constants.GROUP_DATA);
  const chat_groups = groupsData?.group_messages?.filter(
    (itm) => itm?.type === constants.GROUP.CHAT_GROUP
  );
  const user_groups = await getUserGroups(userID);
  const group_response = chat_groups.filter((itm) =>
    user_groups.includes(itm.id)
  );
  return { groups: group_response };
}

export async function getChatChannels(userID) {
  const groupsData = await readFile(constants.GROUP_DATA);
  const chat_groups = groupsData?.group_messages?.filter(
    (itm) => itm?.type === constants.GROUP.CHANNEL
  );
  const user_groups = await getUserGroups(userID);
  const group_response = chat_groups.filter((itm) =>
    user_groups.includes(itm.id)
  );
  return { channels: group_response };
}

export async function getGroupChatMessages(group_id) {
  const group_messages = await readFile(constants.GROUP_MESSAGES);
  const filteredMessages = group_messages?.groups?.filter(
    (itm) => itm?.groupID?.toString() === group_id
  );
  const filteredMessageWithSendor = await getFilteredMessageWithSendor(
    filteredMessages
  );
  return { messages: filteredMessageWithSendor };
}

export async function postGroupMessages(groupID, body, userID) {
  const message = body.message;
  const directMessages = await readFile(constants.GROUP_MESSAGES);
  const messageID = directMessages?.groups?.at(-1).id + 1;
  const newMessageBody = {
    id: messageID,
    timestamp: Math.floor(+new Date() / 1000),
    sendorId: userID.toString(),
    groupID: groupID,
    text: message,
  };
  directMessages?.groups?.push(newMessageBody);
  await writeFile(directMessages, constants.GROUP_MESSAGES);
  const responseBodyArr = await getFilteredMessageWithSendor([newMessageBody]);
  return responseBodyArr[0];
}
