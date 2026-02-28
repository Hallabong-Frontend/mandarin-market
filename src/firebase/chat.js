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
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  where,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { uploadImage } from '../api/auth';
import { getImageUrl } from '../utils/format';

// chatId: 두 accountname을 알파벳순 정렬 후 '|' 로 결합
// accountname은 영문/숫자/._만 허용되므로 '|'는 충돌 없음
export const getChatId = (a, b) => [a, b].sort().join('|');

// 채팅방이 없으면 생성, 있으면 그대로 사용
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

// 그룹 채팅방 생성 (자동 ID 부여, 그룹 제목/이미지 설정)
export const createGroupChat = async (myInfo, selectedUsers, groupTitle, groupImage) => {
  const chatRef = doc(collection(db, 'chats'));

  const participants = [myInfo.accountname, ...selectedUsers.map((u) => u.accountname)];

  const participantInfo = {
    [myInfo.accountname]: {
      username: myInfo.username,
      image: myInfo.image || '',
    },
  };

  selectedUsers.forEach((u) => {
    participantInfo[u.accountname] = {
      username: u.username,
      image: u.image || '',
    };
  });

  await setDoc(chatRef, {
    isGroupChat: true,
    groupTitle: groupTitle || participants.join(', '),
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

// 텍스트 메시지 전송
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

// 이미지 메시지 전송 (Mandarin API 업로드 후 URL 저장)
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

// 채팅방 입장 시 읽음 처리
export const markAsRead = async (chatId, accountname) => {
  await updateDoc(doc(db, 'chats', chatId), {
    [`readAt.${accountname}`]: serverTimestamp(),
  });
};

// 내 채팅 목록 실시간 구독 (lastMessageAt 내림차순)
export const subscribeToChats = (accountname, callback) => {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', accountname));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0));
    callback(chats);
  });
};

// 채팅방 및 하위 메시지 전체 삭제
export const deleteChat = async (chatId) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const snapshot = await getDocs(messagesRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await deleteDoc(doc(db, 'chats', chatId));
};

// 메시지 수정
export const editMessage = async (chatId, messageId, newText) => {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), { text: newText });
};

// 메시지 삭제
export const deleteMessage = async (chatId, messageId) => {
  await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
};

// 채팅방 테마 저장 (사용자별)
export const saveChatTheme = async (chatId, accountname, theme) => {
  await updateDoc(doc(db, 'chats', chatId), {
    [`themes.${accountname}`]: theme,
  });
};

// 스티커 메시지 전송
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

// 메시지 리액션 토글 (heart, thumbs_up, star)
export const toggleReaction = async (chatId, messageId, accountname, reactionType, hasReacted) => {
  const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(msgRef, {
    [`reactions.${reactionType}`]: hasReacted ? arrayRemove(accountname) : arrayUnion(accountname),
  });
};

// 채팅방 메시지 실시간 구독 (createdAt 오름차순)
export const subscribeToMessages = (chatId, callback) => {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
