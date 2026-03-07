import { useNavigate } from 'react-router-dom';
import {
  HeaderWrapper,
  HeaderSpacer,
  BackButton,
  BackIcon,
  SearchInputWrapper,
  SearchInput,
  SearchIcon,
} from './styles';
import { useScrollHide } from './useScrollHide';

const SearchHeader = ({ onBack, keyword = '', onKeywordChange, searchPlaceholder = '계정을 검색해보세요' }) => {
  const navigate = useNavigate();
  const hidden = useScrollHide();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <>
      <HeaderWrapper $hidden={hidden}>
        <BackButton onClick={handleBack} aria-label="뒤로가기">
          <BackIcon />
        </BackButton>
        <SearchInputWrapper>
          <SearchIcon size={18} />
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
};

export default SearchHeader;
