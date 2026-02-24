// 가격 포맷 (숫자 → 원단위)
export const formatPrice = (price) => {
  if (!price && price !== 0) return "";
  return Number(price).toLocaleString("ko-KR");
};

// 가격 입력 정수화 (문자 → 숫자)
export const parsePrice = (value) => {
  return value.replace(/[^0-9]/g, "");
};

// 시간 포맷 (몇 초/분/시간/일 전)
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

const IMAGE_BASE_URL = "https://dev.wenivops.co.kr/services/mandarin";

// 이미지 URL 처리 (상대경로 → 절대경로)
export const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${IMAGE_BASE_URL}/${url}`;
};

// 기본 프로필 이미지
export const DEFAULT_PROFILE_IMAGE = `${IMAGE_BASE_URL}/Ellipse.png`;

// 이미지 URL이 유효한지 확인
export const isValidImageUrl = (url) => {
  if (!url) return false;
  return url.startsWith("http") || url.startsWith("/");
};

// 계정ID 유효성 검사 (영문, 숫자, 밑줄, 마침표만)
export const validateAccountname = (value) => {
  const regex = /^[a-zA-Z0-9._]+$/;
  return regex.test(value);
};

// 이메일 유효성 검사
export const validateEmail = (value) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
};
