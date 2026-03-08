import axiosInstance from './config';

/**
 * 이메일로 로그인한다.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} 유저 정보 및 토큰
 */
export const login = async (email, password) => {
  const response = await axiosInstance.post('/user/login', {
    user: { email, password },
  });
  return response.data;
};

/**
 * 이메일 중복 여부를 검사한다.
 *
 * @param {string} email
 * @returns {Promise<Object>} 유효성 결과
 */
export const checkEmailValid = async (email) => {
  const response = await axiosInstance.post('/user/emailvalid', {
    user: { email },
  });
  return response.data;
};

/**
 * 계정 ID 중복 여부를 검사한다.
 *
 * @param {string} accountname
 * @returns {Promise<Object>} 유효성 결과
 */
export const checkAccountValid = async (accountname) => {
  const response = await axiosInstance.post('/user/accountnamevalid', {
    user: { accountname },
  });
  return response.data;
};

/**
 * 회원가입 요청을 보낸다.
 *
 * @param {Object} userData - 이메일, 비밀번호, 닉네임 등 유저 정보
 * @returns {Promise<Object>} 생성된 유저 정보
 */
export const register = async (userData) => {
  const response = await axiosInstance.post('/user', {
    user: userData,
  });
  return response.data;
};

/**
 * 현재 로그인한 유저 정보를 가져온다.
 *
 * @returns {Promise<Object>} 내 유저 정보
 */
export const getMyInfo = async () => {
  const response = await axiosInstance.get('/user/myinfo');
  return response.data;
};

/**
 * 저장된 토큰이 유효한지 확인한다.
 *
 * @returns {Promise<Object>} 토큰 유효성 결과
 */
export const checkTokenValid = async () => {
  const response = await axiosInstance.get('/user/checktoken');
  return response.data;
};

/**
 * 이미지 파일을 업로드하고 파일 정보를 반환한다.
 *
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<Object>} 업로드된 이미지 정보 (filename 등)
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosInstance.post('/image/uploadfile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = response.data;
  return data.info;
};

/**
 * 내 프로필 정보를 수정한다.
 *
 * @param {Object} userData - 수정할 유저 정보
 * @returns {Promise<Object>} 수정된 유저 정보
 */
export const updateMyProfile = async (userData) => {
  const response = await axiosInstance.put('/user', {
    user: userData,
  });
  return response.data;
};
