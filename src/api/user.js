import axiosInstance from './config';

/**
 * 특정 유저의 프로필 정보를 가져온다.
 *
 * @param {string} accountname - 조회할 유저의 계정 ID
 * @returns {Promise<Object>} 유저 프로필 데이터
 */
export const getUserProfile = async (accountname) => {
  const response = await axiosInstance.get(`/profile/${accountname}`);
  return response.data;
};

/**
 * 특정 유저의 팔로잉 목록을 가져온다.
 *
 * @param {string} accountname - 계정 ID
 * @returns {Promise<Object>} 팔로잉 유저 목록
 */
export const getFollowingList = async (accountname) => {
  const response = await axiosInstance.get(`/profile/${accountname}/following`);
  return response.data;
};

/**
 * 특정 유저의 팔로워 목록을 가져온다.
 *
 * @param {string} accountname - 계정 ID
 * @returns {Promise<Object>} 팔로워 유저 목록
 */
export const getFollowerList = async (accountname) => {
  const response = await axiosInstance.get(`/profile/${accountname}/follower`);
  return response.data;
};

/**
 * 특정 유저를 팔로우한다.
 *
 * @param {string} accountname - 팔로우할 유저의 계정 ID
 * @returns {Promise<Object>} 팔로우 결과
 */
export const followUser = async (accountname) => {
  const response = await axiosInstance.post(`/profile/${accountname}/follow`);
  return response.data;
};

/**
 * 특정 유저를 언팔로우한다.
 *
 * @param {string} accountname - 언팔로우할 유저의 계정 ID
 * @returns {Promise<Object>} 언팔로우 결과
 */
export const unfollowUser = async (accountname) => {
  const response = await axiosInstance.delete(`/profile/${accountname}/unfollow`);
  return response.data;
};

/**
 * 키워드로 유저를 검색한다.
 *
 * @param {string} keyword - 검색어
 * @returns {Promise<Object>} 검색된 유저 목록
 */
export const searchUser = async (keyword) => {
  const response = await axiosInstance.get(`/user/searchuser/?keyword=${keyword}`);
  return response.data;
};

/**
 * 특정 유저가 작성한 게시글 목록을 가져온다.
 *
 * @param {string} accountname - 계정 ID
 * @returns {Promise<Object>} 게시글 목록
 */
export const getUserPosts = async (accountname) => {
  const response = await axiosInstance.get(`/post/${accountname}/userpost`);
  return response.data;
};
