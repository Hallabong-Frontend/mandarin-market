import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getFollowerList, getFollowingList } from '../../api/user';
import UserItem from '../../components/user/UserItem';
import Spinner from '../../components/common/Spinner';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
`;

const TabRow = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 14px;
  text-align: center;
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ $active, theme }) => ($active ? theme.fonts.weight.bold : theme.fonts.weight.regular)};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.gray400)};
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: ${({ theme }) => theme.transitions.base};
`;

/**
 * 팔로워/팔로잉 목록 페이지. 탭 전환으로 두 목록을 모두 조회할 수 있다.
 *
 * @param {{ type: 'follower'|'following' }} props
 * @returns {JSX.Element}
 */
const FollowList = ({ type = 'follower' }) => {
  const { accountname } = useParams();
  const [activeTab, setActiveTab] = useState(type);
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * 활성 탭에 따라 팔로워 또는 팔로잉 목록을 불러온다.
     *
     * @returns {Promise<void>}
     */
    const fetchList = async () => {
      setIsLoading(true);
      try {
        const data =
          activeTab === 'follower' ? await getFollowerList(accountname) : await getFollowingList(accountname);
        setList(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, [accountname, activeTab]);

  return (
    <Wrapper>
      <Header type="back-title" title={activeTab === 'follower' ? 'Followers' : 'Followings'} titleLeft />

      <TabRow>
        <Tab $active={activeTab === 'follower'} onClick={() => setActiveTab('follower')}>
          팔로워
        </Tab>
        <Tab $active={activeTab === 'following'} onClick={() => setActiveTab('following')}>
          팔로잉
        </Tab>
      </TabRow>

      {isLoading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState text={activeTab === 'follower' ? '팔로워가 없습니다.' : '팔로잉이 없습니다.'} padding="60px 16px" />
      ) : (
        <ul>
          {list.map((user) => (
            <li key={user.accountname}>
              <UserItem userData={user} />
            </li>
          ))}
        </ul>
      )}
    </Wrapper>
  );
};

export default FollowList;
