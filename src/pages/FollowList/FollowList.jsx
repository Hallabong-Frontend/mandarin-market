import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getFollowerList, getFollowingList } from '../../api/user';
import UserItem from '../../components/user/UserItem';
import Spinner from '../../components/common/Spinner';
import Header from '../../components/common/Header';

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
  font-weight: ${({ $active, theme }) => $active ? theme.fonts.weight.bold : theme.fonts.weight.regular};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.gray400};
  border-bottom: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  transition: ${({ theme }) => theme.transitions.base};
`;

const EmptyList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.gray400};
`;

const FollowList = ({ type = 'follower' }) => {
  const { accountname } = useParams();
  const [activeTab, setActiveTab] = useState(type);
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      setIsLoading(true);
      try {
        const data = activeTab === 'follower'
          ? await getFollowerList(accountname)
          : await getFollowingList(accountname);
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
      <Header
        type="back-title"
        title={activeTab === 'follower' ? 'Followers' : 'Followings'}
        titleLeft
      />

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
        <EmptyList>
          <EmptyText>
            {activeTab === 'follower' ? '팔로워가 없습니다.' : '팔로잉이 없습니다.'}
          </EmptyText>
        </EmptyList>
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
