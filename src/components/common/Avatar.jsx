import styled from 'styled-components';
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from '../../utils/format';

const StyledAvatar = styled.img`
  width: ${({ $size }) => $size || '50px'};
  height: ${({ $size }) => $size || '50px'};
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  background-color: ${({ theme }) => theme.colors?.gray100 || '#f2f2f2'};
  ${({ $border, theme }) => $border && `border: 1px solid ${theme.colors?.border || '#dbdbdb'};`}
`;

/**
 * 원형 프로필 이미지. 이미지 로드 실패 시 기본 이미지로 대체된다.
 *
 * @param {{ src: string, alt: string, size: string, border: boolean, onClick: Function, className: string }} props
 * @returns {JSX.Element}
 */
const Avatar = ({ src, alt = '프로필 이미지', size, border, onClick, className }) => {
  const handleImageError = (e) => {
    e.target.src = DEFAULT_PROFILE_IMAGE;
  };

  return (
    <StyledAvatar
      src={getImageUrl(src) || DEFAULT_PROFILE_IMAGE}
      alt={alt}
      $size={size}
      $border={border}
      $clickable={!!onClick}
      onClick={onClick}
      onError={handleImageError}
      className={className}
    />
  );
};

export default Avatar;
