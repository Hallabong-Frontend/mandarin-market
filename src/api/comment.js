import axiosInstance from './config';

/**
 * 게시글의 댓글 목록을 가져온다.
 *
 * @param {string} postId - 게시글 ID
 * @returns {Promise<Object>} 댓글 목록
 */
export const getComments = async (postId) => {
  const response = await axiosInstance.get(`/post/${postId}/comments`);
  return response.data;
};

/**
 * 게시글에 댓글을 작성한다.
 *
 * @param {string} postId - 게시글 ID
 * @param {string} content - 댓글 내용
 * @returns {Promise<Object>} 생성된 댓글 데이터
 */
export const createComment = async (postId, content) => {
  const response = await axiosInstance.post(`/post/${postId}/comments`, {
    comment: { content },
  });
  return response.data;
};

/**
 * 댓글을 삭제한다.
 *
 * @param {string} postId - 게시글 ID
 * @param {string} commentId - 삭제할 댓글 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteComment = async (postId, commentId) => {
  const response = await axiosInstance.delete(`/post/${postId}/comments/${commentId}`);
  return response.data;
};

/**
 * 댓글을 신고한다.
 *
 * @param {string} postId - 게시글 ID
 * @param {string} commentId - 신고할 댓글 ID
 * @returns {Promise<Object>} 신고 결과
 */
export const reportComment = async (postId, commentId) => {
  const response = await axiosInstance.post(`/post/${postId}/comments/${commentId}/report`);
  return response.data;
};
