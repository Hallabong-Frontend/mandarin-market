import axiosInstance from './config';

/**
 * 특정 유저의 상품 목록을 가져온다.
 *
 * @param {string} accountname - 계정 ID
 * @returns {Promise<Object>} 상품 목록
 */
export const getMyProducts = async (accountname) => {
  const response = await axiosInstance.get(`/product/${accountname}`);
  return response.data;
};

/**
 * 상품 상세 정보를 가져온다.
 *
 * @param {string} productId - 상품 ID
 * @returns {Promise<Object>} 상품 상세 데이터
 */
export const getProduct = async (productId) => {
  const response = await axiosInstance.get(`/product/detail/${productId}`);
  return response.data;
};

/**
 * 새 상품을 등록한다.
 *
 * @param {Object} productData - 상품명, 가격, 이미지, 링크 등 상품 정보
 * @returns {Promise<Object>} 생성된 상품 데이터
 */
export const createProduct = async (productData) => {
  const response = await axiosInstance.post('/product', {
    product: productData,
  });
  return response.data;
};

/**
 * 상품 정보를 수정한다.
 *
 * @param {string} productId - 상품 ID
 * @param {Object} productData - 수정할 상품 정보
 * @returns {Promise<Object>} 수정된 상품 데이터
 */
export const updateProduct = async (productId, productData) => {
  const response = await axiosInstance.put(`/product/${productId}`, {
    product: productData,
  });
  return response.data;
};

/**
 * 상품을 삭제한다.
 *
 * @param {string} productId - 삭제할 상품 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteProduct = async (productId) => {
  const response = await axiosInstance.delete(`/product/${productId}`);
  return response.data;
};
