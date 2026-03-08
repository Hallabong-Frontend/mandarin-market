import { IMAGE_BASE_URL } from '../constants/url';

/**
 * 숫자를 한국 원화 형식으로 포맷한다. (예: 10000 → "10,000")
 *
 * @param {number|string} price - 포맷할 가격
 * @returns {string} 포맷된 가격 문자열
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '';
  return Number(price).toLocaleString('ko-KR');
};

/**
 * 가격 입력값에서 숫자만 추출한다.
 *
 * @param {string} value - 입력 문자열
 * @returns {string} 숫자만 남긴 문자열
 */
export const parsePrice = (value) => {
  return value.replace(/[^0-9]/g, '');
};

/**
 * 날짜 문자열을 "N초/분/시간/일/달/년 전" 형식으로 반환한다.
 *
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @returns {string} 상대 시간 문자열
 */
export const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}달 전`;
  return `${Math.floor(diff / 31536000)}년 전`;
};

/**
 * 날짜 문자열을 "YYYY년 M월 D일" 형식으로 반환한다.
 *
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 상대 경로 이미지 URL을 절대 경로로 변환한다. 이미 절대 경로면 그대로 반환.
 *
 * @param {string} url - 이미지 URL
 * @returns {string} 절대 경로 URL
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${IMAGE_BASE_URL}/${url}`;
};

// 기본 프로필 이미지
export const DEFAULT_PROFILE_IMAGE = `${IMAGE_BASE_URL}/Ellipse.png`;

/**
 * 이미지 URL이 유효한지 확인한다. (http 또는 상대경로)
 *
 * @param {string} url - 확인할 URL
 * @returns {boolean} 유효 여부
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http') || url.startsWith('/');
};

/**
 * 계정 ID가 유효한지 검사한다. (영문, 숫자, 밑줄, 마침표만 허용)
 *
 * @param {string} value - 계정 ID
 * @returns {boolean} 유효 여부
 */
export const validateAccountname = (value) => {
  const regex = /^[a-zA-Z0-9._]+$/;
  return regex.test(value);
};

/**
 * 이메일 형식이 유효한지 검사한다.
 *
 * @param {string} value - 이메일 주소
 * @returns {boolean} 유효 여부
 */
export const validateEmail = (value) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
};

/**
 * 비밀번호가 유효한지 검사한다. (6자 이상)
 *
 * @param {string} value - 비밀번호
 * @returns {boolean} 유효 여부
 */
export const validatePassword = (value) => {
  return value.length >= 6;
};
