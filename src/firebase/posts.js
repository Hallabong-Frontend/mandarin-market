import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';

// 게시글 메타 (pinnedCommentId 등)
export const getPostMeta = async (postId) => {
  const snap = await getDoc(doc(db, 'posts', postId));
  return snap.exists() ? snap.data() : {};
};

// 댓글 고정
export const pinComment = async (postId, commentId) => {
  await setDoc(doc(db, 'posts', postId), { pinnedCommentId: String(commentId) }, { merge: true });
};

// 댓글 고정 해제
export const unpinComment = async (postId) => {
  await setDoc(doc(db, 'posts', postId), { pinnedCommentId: null }, { merge: true });
};

// 댓글 공감 토글
export const toggleCommentLike = async (postId, commentId, accountname, hasLiked) => {
  const ref = doc(db, 'posts', postId, 'commentMeta', String(commentId));
  await setDoc(
    ref,
    { likes: hasLiked ? arrayRemove(accountname) : arrayUnion(accountname) },
    { merge: true },
  );
};

// 댓글 메타 전체 (likes) 가져오기
export const getCommentMetas = async (postId) => {
  const snap = await getDocs(collection(db, 'posts', postId, 'commentMeta'));
  const result = {};
  snap.forEach((d) => {
    result[d.id] = d.data();
  });
  return result;
};

// 대댓글 추가
export const addReply = async (postId, parentCommentId, { content, authorName, authorImage, authorAccountname }) => {
  const ref = collection(db, 'posts', postId, 'replies');
  const docRef = await addDoc(ref, {
    parentCommentId: String(parentCommentId),
    content,
    authorName,
    authorImage: authorImage || '',
    authorAccountname,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// 대댓글 삭제
export const deleteReply = async (postId, replyId) => {
  await deleteDoc(doc(db, 'posts', postId, 'replies', replyId));
};

// 대댓글 전체 가져오기
export const getReplies = async (postId) => {
  const q = query(collection(db, 'posts', postId, 'replies'), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
