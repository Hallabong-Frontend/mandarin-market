import { useNavigate } from 'react-router-dom';
import {
  HeaderWrapper,
  HeaderSpacer,
  BackButton,
  BackIcon,
  Title,
  RightButton,
  RightButtons,
  TextButton,
  UploadButton,
  MoreIcon,
  SearchIcon,
} from './styles';
import { useScrollHide } from './useScrollHide';

const getRightContent = ({
  type,
  onSearch,
  onMore,
  onUpload,
  uploadDisabled,
  uploadText,
  onSave,
  saveDisabled,
  onRightText,
  rightDisabled,
  rightText,
}) => {
  switch (type) {
    case 'back-search':
      return (
        <RightButton onClick={onSearch} aria-label="검색">
          <SearchIcon />
        </RightButton>
      );
    case 'back-more':
    case 'back-title-more':
      return (
        <RightButton onClick={onMore} aria-label="더보기">
          <MoreIcon />
        </RightButton>
      );
    case 'back-title-upload':
      return (
        <UploadButton disabled={uploadDisabled} onClick={onUpload}>
          {uploadText}
        </UploadButton>
      );
    case 'back-title-save':
      return (
        <TextButton disabled={saveDisabled} onClick={onSave}>
          저장
        </TextButton>
      );
    case 'back-title-text':
      return (
        <TextButton disabled={rightDisabled} onClick={onRightText}>
          {rightText}
        </TextButton>
      );
    case 'back-search-more':
      return (
        <RightButtons>
          <RightButton onClick={onSearch} aria-label="검색">
            <SearchIcon />
          </RightButton>
          <RightButton onClick={onMore} aria-label="더보기">
            <MoreIcon />
          </RightButton>
        </RightButtons>
      );
    default:
      return <div style={{ width: 32 }} />;
  }
};

const StandardHeader = ({
  type,
  title = '',
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
  onTitleClick,
  alwaysVisible = false,
}) => {
  const navigate = useNavigate();
  const hidden = useScrollHide();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <>
      <HeaderWrapper $hidden={alwaysVisible ? false : hidden}>
        <BackButton onClick={handleBack} aria-label="뒤로가기">
          <BackIcon />
        </BackButton>
        {title ? (
          <Title $titleLeft={titleLeft} $clickable={!!onTitleClick} onClick={onTitleClick}>
            {title}
          </Title>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        {getRightContent({
          type,
          onSearch,
          onMore,
          onUpload,
          uploadDisabled,
          uploadText,
          onSave,
          saveDisabled,
          onRightText,
          rightDisabled,
          rightText,
        })}
      </HeaderWrapper>
      <HeaderSpacer />
    </>
  );
};

export default StandardHeader;
