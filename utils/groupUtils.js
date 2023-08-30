import "core-js";
import {
  getFilteredMessageWithSendor,
  paginateResponse,
  readFile,
  writeFile,
} from "./helper.js";
import * as constants from "./constants.js";
import { addGroupToUser } from "./profileUtils.js";

async function createGroup(name, type, userID) {
  const groupsData = await readFile(constants.GROUP_DATA);
  const nextGropupID = groupsData?.group_messages?.at(-1).id + 1;
  const newGroupBody = {
    id: nextGropupID,
    name: name,
    type: type,
    members: [userID],
    imageSrc: "assets/defaultGroup.png",
  };
  groupsData?.group_messages?.push(newGroupBody);
  await addGroupToUser(userID, nextGropupID);
  await writeFile(groupsData, constants.GROUP_DATA);
  return newGroupBody;
}

export async function postGroup(body, userID) {
  const groupName = body.name;
  const res = await createGroup(groupName, 2, userID);
  return res;
}
export async function postChannel(body, userID) {
  const channelName = body.name;
  const res = await createGroup(channelName, 1, userID);
  return res;
}

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

export async function getGroupChatMessages(group_id, limit) {
  const group_messages = await readFile(constants.GROUP_MESSAGES);
  const filteredMessages = group_messages?.groups?.filter(
    (itm) => itm?.groupID?.toString() === group_id
  );
  const filteredMessageWithSendor = await getFilteredMessageWithSendor(
    filteredMessages
  );
  const paginatedResponse = paginateResponse(filteredMessageWithSendor, limit);
  return {
    messages: paginatedResponse,
    pageLimit: filteredMessageWithSendor.length,
  };
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

async function editGroupDetails(groupID, body) {
  const groupsData = await readFile(constants.GROUP_DATA);
  const { user, ...patchBody } = body;
  const newGroupData = groupsData?.group_messages?.map((group) => {
    if (group.id === groupID) {
      Object.entries(patchBody)?.forEach(([key, value]) => {
        if (!(key in group)) {
          throw Error(`No ${key} feild found`);
        }
        if (key === "members") {
          const members = value
            .map((val) => Number(val))
            .filter((val) => !group.members.includes(val));
          group.members.push(...value);
        } else {
          group[key] = value;
        }
      });
    }
    return group;
  });
  patchBody.members?.forEach(async (memberID) => {
    await addGroupToUser(memberID, groupID);
  });
  await writeFile({ group_messages: newGroupData }, constants.GROUP_DATA);
}

export const editGroup = async (groupID, body, userID) => {
  await editGroupDetails(groupID, body);
  const response = await getChatGroups(userID);
  const patchResponse = response?.groups.filter((itm) => itm.id === groupID);
  return patchResponse[0];
};

export const editChannel = async (groupID, body, userID) => {
  await editGroupDetails(groupID, body);
  const response = await getChatChannels(userID);
  const patchResponse = response?.channels.filter((itm) => itm.id === groupID);
  return patchResponse[0];
};
