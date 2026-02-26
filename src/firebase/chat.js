import { db, storage } from './config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  updateDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

// 이미지 메시지 전송 (Firebase Storage 업로드 후 URL 저장)
export const sendImageMessage = async (chatId, senderId, file) => {
  const imageRef = ref(storage, `chat/${chatId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(imageRef, file);
  const imageUrl = await getDownloadURL(snapshot.ref);

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
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', accountname),
  );
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(
        (a, b) => (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0),
      );
    callback(chats);
  });
};

// 채팅방 메시지 실시간 구독 (createdAt 오름차순)
export const subscribeToMessages = (chatId, callback) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
