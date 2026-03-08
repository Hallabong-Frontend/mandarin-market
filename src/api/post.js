import axiosInstance from './config';

/**
 * 팔로우한 유저의 피드 게시글 목록을 가져온다.
 *
 * @param {number} [limit=10] - 가져올 게시글 수
 * @param {number} [skip=0] - 건너뛸 게시글 수
 * @returns {Promise<Object>} 게시글 목록 (posts 배열 포함)
 */
export const getFeedPosts = async (limit = 10, skip = 0) => {
  const response = await axiosInstance.get(`/post/feed/?limit=${limit}&skip=${skip}`);
  return response.data;
};

/**
 * 특정 게시글 상세 정보를 가져온다.
 *
 * @param {string} postId - 게시글 ID
 * @returns {Promise<Object>} 게시글 상세 데이터
 */
export const getPost = async (postId) => {
  const response = await axiosInstance.get(`/post/${postId}`);
  return response.data;
};

/**
 * 새 게시글을 작성한다.
 *
 * @param {string} content - 게시글 내용
 * @param {string} image - 이미지 URL (없으면 빈 문자열)
 * @returns {Promise<Object>} 생성된 게시글 데이터
 */
export const createPost = async (content, image) => {
  const response = await axiosInstance.post('/post', {
    post: { content, image },
  });
  return response.data;
};

/**
 * 게시글 내용을 수정한다.
 *
 * @param {string} postId - 게시글 ID
 * @param {string} content - 수정할 내용
 * @param {string} image - 수정할 이미지 URL
 * @returns {Promise<Object>} 수정된 게시글 데이터
 */
export const updatePost = async (postId, content, image) => {
  const response = await axiosInstance.put(`/post/${postId}`, {
    post: { content, image },
  });
  return response.data;
};

/**
 * 게시글을 삭제한다.
 *
 * @param {string} postId - 게시글 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deletePost = async (postId) => {
  const response = await axiosInstance.delete(`/post/${postId}`);
  return response.data;
};

/**
 * 게시글을 신고한다.
 *
 * @param {string} postId - 신고할 게시글 ID
 * @returns {Promise<Object>} 신고 결과
 */
export const reportPost = async (postId) => {
  const response = await axiosInstance.post(`/post/${postId}/report`);
  return response.data;
};

/**
 * 게시글에 좋아요를 누른다.
 *
 * @param {string} postId - 게시글 ID
 * @returns {Promise<Object>} 좋아요 후 게시글 데이터
 */
export const likePost = async (postId) => {
  const response = await axiosInstance.post(`/post/${postId}/heart`);
  return response.data;
};

/**
 * 게시글 좋아요를 취소한다.
 *
 * @param {string} postId - 게시글 ID
 * @returns {Promise<Object>} 취소 후 게시글 데이터
 */
export const unlikePost = async (postId) => {
  const response = await axiosInstance.delete(`/post/${postId}/unheart`);
  return response.data;
};
