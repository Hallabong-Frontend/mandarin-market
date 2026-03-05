import styled from 'styled-components';
import SubmitButton from '../SubmitButton';
import BackIconSvg from '../../../assets/icons/icon-arrow-left.svg?react';
import MoreIconSvg from '../../../assets/icons/icon-more-vertical.svg?react';
import SearchIconSvg from '../../../assets/icons/icon-search.svg?react';
import HeartIconSvg from '../../../assets/icons/icon-heart.svg?react';

export const BackIcon = styled(BackIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ theme }) => theme.colors.black};
  }
`;

export const HeartIcon = styled(HeartIconSvg)`
  width: 24px;
  height: 24px;
  path {
    stroke: ${({ theme }) => theme.colors.gray400};
  }
`;

export const MoreIcon = () => <MoreIconSvg width="24" height="24" />;

export const SearchIcon = styled(SearchIconSvg)`
  width: 24px;
  height: 24px;
  path {
    stroke: ${({ theme }) => theme.colors.gray400};
  }
`;
export const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 50%;
  width: min(100%, 390px);
  z-index: ${({ theme }) => theme.zIndex.header};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  transform: translateX(-50%) translateY(${({ $hidden }) => ($hidden ? '-100%' : '0')});
  transition: transform 0.25s ease;
`;

export const HeaderSpacer = styled.div`
  height: 48px;
  flex-shrink: 0;
`;

export const BackButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  flex: 1;
  text-align: ${({ $titleLeft }) => ($titleLeft ? 'left' : 'center')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`;

export const LogoText = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  font-family: 'GangwonEducationTteontteon' !important;
  color: ${({ theme }) => theme.colors.black};
  flex: 1;
  margin-top: 10px;
  height: 48px;
  display: flex;
  align-items: center;
  line-height: 1;
`;

export const RightButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const RightButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const TextButton = styled(SubmitButton)`
  width: 95px;
  height: 32px;
  padding: 6px 30px;
`;

export const UploadButton = styled(SubmitButton)`
  width: 95px;
  height: 32px;
  padding: 6px 16px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

export const SearchInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.gray100};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 8px 12px;
  gap: 8px;
  margin-left: 8px;
`;

export const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};
  border: none;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray300};
  }
`;
