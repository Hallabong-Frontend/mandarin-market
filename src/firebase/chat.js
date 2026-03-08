import { db } from './config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  limit,
  limitToLast,
  endBefore,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  where,
  arrayUnion,
  arrayRemove,
  deleteField,
} from 'firebase/firestore';
import { uploadImage } from '../api/auth';
import { getImageUrl } from '../utils/format';

/**
 * 두 accountname으로 1:1 채팅방 ID를 생성한다. (알파벳순 정렬 후 '|' 결합)
 *
 * @param {string} a - 첫 번째 계정 ID
 * @param {string} b - 두 번째 계정 ID
 * @returns {string} 채팅방 ID
 */
export const getChatId = (a, b) => [a, b].sort().join('|');

/**
 * 1:1 채팅방이 없으면 생성하고, 있으면 그대로 사용한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {Object} myInfo - 내 유저 정보 (accountname, username, image)
 * @param {Object} otherInfo - 상대방 유저 정보
 * @returns {Promise<void>}
 */
export const getOrCreateChat = async (chatId, myInfo, otherInfo) => {
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [myInfo.accountname, otherInfo.accountname],
      participantInfo: {
        [myInfo.accountname]: {
          username: myInfo.username,
          image: myInfo.image || '',
        },
        [otherInfo.accountname]: {
          username: otherInfo.username,
          image: otherInfo.image || '',
        },
      },
      lastMessage: '',
      lastSenderId: '',
      lastMessageAt: serverTimestamp(),
      readAt: {},
    });
  }
};

/**
 * 그룹 채팅방을 생성한다. 제목/이미지 미입력 시 참여자 이름으로 자동 설정.
 *
 * @param {Object} myInfo - 내 유저 정보
 * @param {Object[]} selectedUsers - 초대할 유저 목록
 * @param {string} groupTitle - 그룹 채팅방 제목
 * @param {string} groupImage - 그룹 채팅방 이미지 URL
 * @returns {Promise<string>} 생성된 채팅방 ID
 */
export const createGroupChat = async (myInfo, selectedUsers, groupTitle, groupImage) => {
  const chatRef = doc(collection(db, 'chats'));

  const participants = [myInfo.accountname, ...selectedUsers.map((u) => u.accountname)];

  const participantInfo = {
    [myInfo.accountname]: {
      username: myInfo.username,
      image: myInfo.image || '',
      joinedAt: serverTimestamp(),
    },
  };

  selectedUsers.forEach((u) => {
    participantInfo[u.accountname] = {
      username: u.username,
      image: u.image || '',
      joinedAt: serverTimestamp(),
    };
  });

  const participantUsernames = [myInfo.username, ...selectedUsers.map((u) => u.username)];

  await setDoc(chatRef, {
    isGroupChat: true,
    groupTitle: groupTitle || participantUsernames.join(', '),
    groupImage: groupImage || '',
    participants,
    participantInfo,
    lastMessage: '그룹 채팅방이 생성되었습니다.',
    lastSenderId: myInfo.accountname,
    lastMessageAt: serverTimestamp(),
    readAt: {
      [myInfo.accountname]: serverTimestamp(),
    },
  });

  return chatRef.id;
};

/**
 * 그룹 채팅방에 새 유저를 초대하고 시스템 메시지를 전송한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {Object[]} newUsers - 초대할 유저 목록
 * @param {string} inviterAccountname - 초대한 유저의 계정 ID
 * @returns {Promise<void>}
 */
export const inviteUsersToChat = async (chatId, newUsers, inviterAccountname) => {
  const chatRef = doc(db, 'chats', chatId);
  const snapshot = await getDoc(chatRef);
  if (!snapshot.exists()) return;

  const data = snapshot.data();
  const updatedParticipants = [...data.participants];
  const updatedInfo = { ...data.participantInfo };

  newUsers.forEach((u) => {
    if (!updatedParticipants.includes(u.accountname)) {
      updatedParticipants.push(u.accountname);
    }
    updatedInfo[u.accountname] = {
      username: u.username,
      image: u.image || '',
      joinedAt: serverTimestamp(),
    };
  });

  await updateDoc(chatRef, {
    participants: updatedParticipants,
    participantInfo: updatedInfo,
  });

  const inviterName = data.participantInfo?.[inviterAccountname]?.username || inviterAccountname;
  const newUsernames = newUsers.map((u) => u.username).join(', ');
  await sendSystemMessage(chatId, `${inviterName}님이 ${newUsernames}님을 초대했습니다.`, {
    type: 'invite',
    inviter: { accountname: inviterAccountname, username: inviterName },
    invited: newUsers.map((u) => ({ accountname: u.accountname, username: u.username })),
  });
};

const sendSystemMessage = async (chatId, text, metadata = null) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: 'system',
    text,
    metadata,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    lastSenderId: 'system',
    lastMessageAt: serverTimestamp(),
  });
};

/**
 * 텍스트 메시지를 전송하고 채팅방 마지막 메시지를 업데이트한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} senderId - 보낸 사람 계정 ID
 * @param {string} text - 메시지 내용
 * @returns {Promise<void>}
 */
export const sendTextMessage = async (chatId, senderId, text) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    imageUrl: null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    lastSenderId: senderId,
    lastMessageAt: serverTimestamp(),
  });
};

/**
 * 유저 프로필 카드를 메시지로 공유한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} senderId - 보낸 사람 계정 ID
 * @param {Object} profile - 공유할 유저 프로필 (accountname, username, image, intro)
 * @returns {Promise<void>}
 */
export const sendProfileMessage = async (chatId, senderId, profile) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text: '',
    imageUrl: null,
    profileShare: {
      accountname: profile?.accountname || '',
      username: profile?.username || '',
      image: profile?.image || '',
      intro: profile?.intro || '',
    },
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: '프로필을 공유했어요.',
    lastSenderId: senderId,
    lastMessageAt: serverTimestamp(),
  });
};

/**
 * 이미지 파일을 업로드한 뒤 이미지 메시지를 전송한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} senderId - 보낸 사람 계정 ID
 * @param {File} file - 전송할 이미지 파일
 * @returns {Promise<void>}
 */
export const sendImageMessage = async (chatId, senderId, file) => {
  const info = await uploadImage(file);
  const imageUrl = getImageUrl(info.filename);

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text: '',
    imageUrl,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: '사진을 보냈습니다.',
    lastSenderId: senderId,
    lastMessageAt: serverTimestamp(),
  });
};

/**
 * 채팅방 입장 시 해당 유저의 읽음 시간을 기록한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} accountname - 읽음 처리할 유저 계정 ID
 * @returns {Promise<void>}
 */
export const markAsRead = async (chatId, accountname) => {
  await updateDoc(doc(db, 'chats', chatId), {
    [`readAt.${accountname}`]: serverTimestamp(),
  });
};

/**
 * 내 채팅 목록을 실시간으로 구독한다. 나간 채팅방은 클라이언트에서 필터링.
 *
 * @param {string} accountname - 내 계정 ID
 * @param {Function} callback - 채팅 목록 배열을 받는 콜백
 * @returns {Function} Firestore 구독 해제 함수
 */
export const subscribeToChats = (accountname, callback) => {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', accountname));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((chat) => !chat.hiddenFor?.includes(accountname))
      .sort((a, b) => (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0));
    callback(chats);
  });
};

/**
 * 프로필 변경 시 참여 중인 모든 채팅방의 participantInfo를 일괄 업데이트한다.
 *
 * @param {string} accountname - 계정 ID
 * @param {Object} profile - 업데이트할 프로필 정보 (username, image)
 * @returns {Promise<void>}
 */
export const syncParticipantProfileInChats = async (accountname, profile) => {
  if (!accountname) return;
  const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', accountname));
  const snapshot = await getDocs(chatsQuery);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((chatDoc) => {
    batch.update(chatDoc.ref, {
      [`participantInfo.${accountname}.username`]: profile?.username || '',
      [`participantInfo.${accountname}.image`]: profile?.image || '',
    });
  });
  await batch.commit();
};

/**
 * 프로필 변경 시 공유된 프로필 메시지의 정보를 일괄 업데이트한다.
 *
 * @param {string} accountname - 계정 ID
 * @param {Object} profile - 업데이트할 프로필 정보 (username, image, intro)
 * @returns {Promise<void>}
 */
export const syncSharedProfileMessagesInChats = async (accountname, profile) => {
  if (!accountname) return;
  const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', accountname));
  const chatsSnapshot = await getDocs(chatsQuery);
  if (chatsSnapshot.empty) return;

  for (const chatDoc of chatsSnapshot.docs) {
    const messagesQuery = query(
      collection(db, 'chats', chatDoc.id, 'messages'),
      where('profileShare.accountname', '==', accountname),
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    if (messagesSnapshot.empty) continue;

    const batch = writeBatch(db);
    messagesSnapshot.docs.forEach((msgDoc) => {
      batch.update(msgDoc.ref, {
        'profileShare.username': profile?.username || '',
        'profileShare.image': profile?.image || '',
        'profileShare.intro': profile?.intro || '',
      });
    });
    await batch.commit();
  }
};

/**
 * 채팅방을 나간다. 그룹은 참여자 목록에서 제거, 1:1은 hiddenFor에 추가(숨김 처리).
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} accountname - 나가는 유저 계정 ID
 * @param {boolean} isGroupChat - 그룹 채팅 여부
 * @returns {Promise<void>}
 */
export const leaveChat = async (chatId, accountname, isGroupChat) => {
  const chatRef = doc(db, 'chats', chatId);
  if (isGroupChat) {
    const snapshot = await getDoc(chatRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const username = data.participantInfo?.[accountname]?.username || accountname;
      await sendSystemMessage(chatId, `${username}님이 채팅방을 나갔습니다.`, {
        type: 'leave',
        target: { accountname, username },
      });
    }

    await updateDoc(chatRef, {
      participants: arrayRemove(accountname),
      [`participantInfo.${accountname}`]: deleteField(),
    });
  } else {
    await updateDoc(chatRef, {
      hiddenFor: arrayUnion(accountname),
    });
  }
};

/**
 * 채팅방과 하위 메시지를 모두 삭제한다.
 *
 * @param {string} chatId - 삭제할 채팅방 ID
 * @returns {Promise<void>}
 */
export const deleteChat = async (chatId) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const snapshot = await getDocs(messagesRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await deleteDoc(doc(db, 'chats', chatId));
};

/**
 * 메시지 내용을 수정하고 채팅방 마지막 메시지 미리보기를 갱신한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} messageId - 수정할 메시지 ID
 * @param {string} newText - 수정할 내용
 * @returns {Promise<void>}
 */
export const editMessage = async (chatId, messageId, newText) => {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), { text: newText });

  const latestQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'desc'), limit(1));
  const latestSnapshot = await getDocs(latestQuery);
  if (latestSnapshot.empty) return;

  const latest = latestSnapshot.docs[0].data();
  let preview = latest.text || '';

  if (latest.stickerKey) preview = '스티커를 보냈습니다.';
  else if (latest.imageUrl) preview = '사진을 보냈습니다.';
  else if (latest.profileShare) preview = '프로필을 공유했어요.';

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: preview,
    lastSenderId: latest.senderId || '',
    lastMessageAt: latest.createdAt || serverTimestamp(),
  });
};

/**
 * 메시지를 삭제하고 채팅방 마지막 메시지 미리보기를 갱신한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} messageId - 삭제할 메시지 ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (chatId, messageId) => {
  await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));

  const latestQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'desc'), limit(1));
  const latestSnapshot = await getDocs(latestQuery);

  if (latestSnapshot.empty) {
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: '',
      lastSenderId: '',
      lastMessageAt: deleteField(),
    });
    return;
  }

  const latest = latestSnapshot.docs[0].data();
  let preview = latest.text || '';

  if (latest.stickerKey) preview = '스티커를 보냈습니다.';
  else if (latest.imageUrl) preview = '사진을 보냈습니다.';
  else if (latest.profileShare) preview = '프로필을 공유했어요.';

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: preview,
    lastSenderId: latest.senderId || '',
    lastMessageAt: latest.createdAt || serverTimestamp(),
  });
};

/**
 * 상대방 별명을 설정한다. 나에게만 보이며, 빈 문자열이면 별명을 삭제한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} myAccountname - 내 계정 ID
 * @param {string} targetAccountname - 별명을 설정할 상대 계정 ID
 * @param {string} nickname - 별명 (빈 문자열이면 삭제)
 * @returns {Promise<void>}
 */
export const setNickname = async (chatId, myAccountname, targetAccountname, nickname) => {
  const chatRef = doc(db, 'chats', chatId);
  if ((nickname || '').trim()) {
    await updateDoc(chatRef, {
      [`nicknames.${myAccountname}.${targetAccountname}`]: nickname.trim(),
    });
  } else {
    await updateDoc(chatRef, {
      [`nicknames.${myAccountname}.${targetAccountname}`]: deleteField(),
    });
  }
};

/**
 * 채팅방 테마를 저장한다. 유저별로 독립적으로 적용된다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} accountname - 계정 ID
 * @param {string} theme - 테마 이름
 * @returns {Promise<void>}
 */
export const saveChatTheme = async (chatId, accountname, theme) => {
  await updateDoc(doc(db, 'chats', chatId), {
    [`themes.${accountname}`]: theme,
  });
};

/**
 * 그룹 채팅방 제목을 수정한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} title - 새 제목
 * @returns {Promise<void>}
 */
export const updateChatTitle = async (chatId, title) => {
  await updateDoc(doc(db, 'chats', chatId), {
    groupTitle: (title || '').trim(),
  });
};

/**
 * 스티커 메시지를 전송한다.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} senderId - 보낸 사람 계정 ID
 * @param {string} stickerKey - 스티커 식별 키
 * @returns {Promise<void>}
 */
export const sendStickerMessage = async (chatId, senderId, stickerKey) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text: '',
    imageUrl: null,
    stickerKey,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: '스티커를 보냈습니다.',
    lastSenderId: senderId,
    lastMessageAt: serverTimestamp(),
  });
};

/**
 * 메시지 리액션을 토글한다. 이미 반응한 경우 취소, 아니면 추가.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {string} messageId - 메시지 ID
 * @param {string} accountname - 반응하는 유저 계정 ID
 * @param {'heart'|'thumbs_up'|'star'} reactionType - 리액션 종류
 * @param {boolean} hasReacted - 이미 반응했는지 여부
 * @returns {Promise<void>}
 */
export const toggleReaction = async (chatId, messageId, accountname, reactionType, hasReacted) => {
  const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(msgRef, {
    [`reactions.${reactionType}`]: hasReacted ? arrayRemove(accountname) : arrayUnion(accountname),
  });
};

/**
 * 채팅방 메시지를 실시간으로 구독한다. 최신 limitCount개를 오름차순으로 전달.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {Function} callback - 메시지 배열을 받는 콜백
 * @param {Object} [joinTime] - 그룹 채팅 입장 시간 (입장 이전 메시지 제외)
 * @param {number} [limitCount=40] - 가져올 최대 메시지 수
 * @returns {Function} Firestore 구독 해제 함수
 */
export const subscribeToMessages = (chatId, callback, joinTime, limitCount = 40) => {
  const constraints = [
    orderBy('createdAt', 'asc'),
    ...(joinTime ? [where('createdAt', '>=', joinTime)] : []),
    limitToLast(limitCount),
  ];
  const q = query(collection(db, 'chats', chatId, 'messages'), ...constraints);
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })));
  });
};

/**
 * 특정 시점 이전의 메시지를 조회한다. 위로 스크롤 시 이전 메시지 로드에 사용.
 *
 * @param {string} chatId - 채팅방 ID
 * @param {Object} beforeTimestamp - 이 시점 이전 메시지만 조회
 * @param {number} [limitCount=30] - 가져올 최대 메시지 수
 * @param {Object} [joinTime=null] - 그룹 채팅 입장 시간 필터
 * @returns {Promise<{ messages: Object[], hasMore: boolean }>}
 */
export const fetchOlderMessages = async (chatId, beforeTimestamp, limitCount = 30, joinTime = null) => {
  const constraints = [
    orderBy('createdAt', 'asc'),
    ...(joinTime ? [where('createdAt', '>=', joinTime)] : []),
    endBefore(beforeTimestamp),
    limitToLast(limitCount),
  ];
  const snapshot = await getDocs(query(collection(db, 'chats', chatId, 'messages'), ...constraints));
  return {
    messages: snapshot.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })),
    hasMore: snapshot.docs.length === limitCount,
  };
};
