import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Icon404svg from '../../assets/icons/icon-404.svg?react';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
`;

const Icon404 = styled(Icon404svg)`
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
`;

const Text = styled.p`
  font-size: 14px;
  color: #767676;
`;

const Button = styled.button`
  padding: 12px 36px;
  border-radius: 999px;
  background-color: #f26e22;
  color: white;
  font-size: 14px;
`;

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Wrapper>
      <Icon404 width="158" height="158" />
      <Text>페이지를 찾을 수 없습니다. :(</Text>
      <Button onClick={() => navigate(-1)}>이전 페이지</Button>
    </Wrapper>
  );
};

export default NotFound;
