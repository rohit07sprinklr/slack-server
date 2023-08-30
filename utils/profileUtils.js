import "core-js";
import {
  getFilteredMessageWithSendor,
  paginateResponse,
  readFile,
  writeFile,
} from "./helper.js";
import * as constants from "./constants.js";

export async function profileSignup(body) {
  const formData = body;
  const profileInfo = await readFile(constants.PROFILE_DATA);
  const profilecreds = await readFile(constants.CREDS);
  if (profilecreds?.creds.some((profile) => profile.email === formData.email)) {
    throw Error("This Email already exists");
  }
  const newProfileID = profileInfo?.profiles?.at(-1)?.id + 1;

  const newProfileBody = {
    id: newProfileID,
    name: formData.name,
    imageSrc: constants.DEFAULT_PROFILE_IMAGE_SRC,
    groups: [],
  };
  profileInfo?.profiles?.push(newProfileBody);
  await writeFile(profileInfo, constants.PROFILE_DATA);

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
  const profileEmail = profilecreds["creds"].filter(
    (itm) => itm?.email === credential.email
  );
  if (!profileEmail || profileEmail.length === 0) {
    throw Error("This Email ID is not registered");
  }
  const profile = profilecreds["creds"].filter(
    (itm) =>
      itm?.id === profileEmail[0].id && itm?.password === credential.password
  );
  if (!profile || profile?.length === 0) {
    throw Error("Invalid Password");
  }
  const profileID = profile[0]?.id;
  const res = profileInfo?.profiles.filter((itm) => itm.id === profileID);
  return res[0];
}

export async function getDirectChatProfiles(userID) {
  // const directMessages = await readFile(constants.DIRECT_MESSAGE_USERS);
  // const currentUserMessages = directMessages?.direct_messages?.filter(
  //   (itm) => itm.id === userID
  // )[0];
  const profileInfo = await readFile(constants.PROFILE_DATA);
  const currentUserProfile = profileInfo?.profiles?.filter(
    (itm) => itm.id === userID
  )[0];
  const otherUsersProfile = profileInfo?.profiles?.filter(
    (itm) => itm.id !== userID
  );
  return { profiles: [currentUserProfile, ...otherUsersProfile] };
}

const filterUserMessage = (message, profileId, userID) => {
  return (
    (message?.sendorId?.toString() === userID.toString() &&
      message?.recieverId?.toString() === profileId) ||
    (message?.sendorId?.toString() === profileId &&
      message?.recieverId.toString() === userID.toString())
  );
};

export async function getDirectMessages(profileId, userID, limit) {
  const directMessages = await readFile(constants.MESSAGES);
  const filteredMessage = directMessages?.messages?.filter((message) =>
    filterUserMessage(message, profileId, userID)
  );
  const filteredMessageWithSendor = await getFilteredMessageWithSendor(
    filteredMessage
  );
  const paginatedResponse = paginateResponse(filteredMessageWithSendor, limit);
  return {
    messages: paginatedResponse,
    pageLimit: filteredMessageWithSendor.length,
  };
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

export async function addGroupToUser(userID, groupID) {
  const profileInfo = await readFile(constants.PROFILE_DATA);
  const newProfileInfo = profileInfo?.profiles?.map((profile) => {
    if (profile.id === userID) {
      profile.groups.push(groupID);
    }
    return profile;
  });
  await writeFile({ profiles: newProfileInfo }, constants.PROFILE_DATA);
}
