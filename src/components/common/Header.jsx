import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import SubmitButton from './SubmitButton';
import BackIconSvg from '../../assets/icons/icon-arrow-left.svg?react';
import MoreIconSvg from '../../assets/icons/icon-more-vertical.svg?react';
import SearchIconSvg from '../../assets/icons/icon-search.svg?react';

const BackIcon = () => <BackIconSvg width="22" height="22" />;

const MoreIcon = () => <MoreIconSvg width="24" height="24" />;

const SearchIcon = () => <SearchIconSvg width="24" height="24" />;

const HeaderWrapper = styled.header`
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

const HeaderSpacer = styled.div`
  height: 48px;
  flex-shrink: 0;
`;

const BackButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  flex: 1;
  text-align: ${({ $titleLeft }) => ($titleLeft ? 'left' : 'center')};
`;

const LogoText = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  flex: 1;
`;

const RightButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextButton = styled(SubmitButton)`
  width: auto;
  padding: 6px 30px;
`;

const UploadButton = styled(SubmitButton)`
  width: auto;
  padding: 6px 16px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.gray100};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 8px 12px;
  gap: 8px;
  margin-left: 8px;
`;

const SearchInput = styled.input`
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

// type: 'back-only' | 'back-search' | 'back-more' | 'back-title' | 'back-title-more' | 'back-title-upload' | 'back-title-save' | 'back-title-text' | 'logo-search' | 'search-input'
const Header = ({
  type = 'back-title',
  title = '',
  logo = '',
  titleLeft = false,
  onBack,
  onMore,
  onSearch,
  rightText,
  onRightText,
  rightDisabled = false,
  uploadDisabled = true,
  uploadText = '업로드',
  onUpload,
  saveDisabled = true,
  onSave,
  keyword = '',
  onKeywordChange,
  searchPlaceholder = '계정을 검색해보세요',
}) => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (diff < 0) {
        setHidden(false);
      } else if (diff > 5 && currentY > 48) {
        setHidden(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  if (type === 'logo-search') {
    return (
      <>
        <HeaderWrapper $hidden={hidden}>
          <LogoText>{logo}</LogoText>
          <RightButton onClick={onSearch} aria-label="검색">
            <SearchIcon />
          </RightButton>
        </HeaderWrapper>
        <HeaderSpacer />
      </>
    );
  }

  if (type === 'search-input') {
    return (
      <>
        <HeaderWrapper $hidden={hidden}>
          <BackButton onClick={handleBack} aria-label="뒤로가기">
            <BackIcon />
          </BackButton>
          <SearchInputWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              value={keyword}
              onChange={onKeywordChange}
              placeholder={searchPlaceholder}
              autoFocus
            />
          </SearchInputWrapper>
        </HeaderWrapper>
        <HeaderSpacer />
      </>
    );
  }

  return (
    <>
    <HeaderWrapper $hidden={hidden}>
      <BackButton onClick={handleBack} aria-label="뒤로가기">
        <BackIcon />
      </BackButton>

      {title && <Title $titleLeft={titleLeft}>{title}</Title>}
      {!title && <div style={{ flex: 1 }} />}

      {type === 'back-search' && (
        <RightButton onClick={onSearch} aria-label="검색">
          <SearchIcon />
        </RightButton>
      )}
      {(type === 'back-more' || type === 'back-title-more') && (
        <RightButton onClick={onMore} aria-label="더보기">
          <MoreIcon />
        </RightButton>
      )}
      {type === 'back-title-upload' && (
        <UploadButton disabled={uploadDisabled} onClick={onUpload}>
          {uploadText}
        </UploadButton>
      )}
      {type === 'back-title-save' && (
        <TextButton disabled={saveDisabled} onClick={onSave}>
          저장
        </TextButton>
      )}
      {type === 'back-title-text' && (
        <TextButton disabled={rightDisabled} onClick={onRightText}>
          {rightText}
        </TextButton>
      )}
      {![
        'back-search',
        'back-more',
        'back-title-more',
        'back-title-upload',
        'back-title-save',
        'back-title-text',
      ].includes(type) && <div style={{ width: 32 }} />}
    </HeaderWrapper>
    <HeaderSpacer />
    </>
  );
};

export default Header;
