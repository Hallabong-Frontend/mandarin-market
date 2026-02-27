import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { searchUser } from '../../api/user';
import UserItem from '../../components/user/UserItem';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
`;

const ResultList = styled.ul``;

const Search = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 디바운스 처리
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

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
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400),
    [],
  );

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
