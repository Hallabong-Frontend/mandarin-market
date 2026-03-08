import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { searchUser } from '../../api/user';
import UserItem from '../../components/user/UserItem';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
`;

const ResultList = styled.ul``;

/**
 * 유저 검색 페이지. 계정명 키워드로 사용자를 검색하며 400ms 디바운스를 적용한다.
 *
 * @returns {JSX.Element}
 */
const Search = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * 함수 호출을 지정 시간만큼 지연시키는 디바운스 유틸리티.
   *
   * @param {Function} fn - 지연할 함수
   * @param {number} delay - 지연 시간(ms)
   * @returns {Function}
   */
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /**
   * 키워드로 사용자를 검색한다. 빈 키워드면 결과를 초기화한다.
   *
   * @param {string} value - 검색 키워드
   * @returns {Promise<void>}
   */
  const handleSearch = useCallback(
    debounce(async (value) => {
      if (!value.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setIsLoading(true);
      setHasSearched(true);
      try {
        const data = await searchUser(value);
        setResults(data || []);
      } catch (err) {
        console.error(err);
        toast.error('사용자 검색에 실패했습니다.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400),
    [],
  );

  /**
   * 검색어를 업데이트하고 디바운스된 검색을 실행한다.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setKeyword(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <Wrapper>
      <Header
        type="search-input"
        keyword={keyword}
        onKeywordChange={handleChange}
        searchPlaceholder="계정을 검색해보세요"
      />

      {isLoading ? (
        <Spinner />
      ) : hasSearched && results.length === 0 ? (
        <EmptyState text="검색 결과가 없습니다." padding="80px 32px" />
      ) : (
        <ResultList>
          {results.map((user) => (
            <li key={user.accountname}>
              <UserItem userData={user} keyword={keyword} />
            </li>
          ))}
        </ResultList>
      )}
    </Wrapper>
  );
};

export default Search;
