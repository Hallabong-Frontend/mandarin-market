import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ $padding }) => $padding || '80px 16px'};
  gap: 16px;
  height: ${({ $height }) => $height || 'auto'};
`;

const Text = styled.p`
  font-size: ${({ theme, $fontSize }) => ($fontSize ? theme.fonts.size[$fontSize] : theme.fonts.size.base)};
  color: ${({ theme, $color }) => ($color ? theme.colors[$color] : theme.colors.gray400)};
  text-align: center;
`;

/**
 * 목록이 비었을 때 표시하는 빈 상태 컴포넌트.
 *
 * @param {{ text: string, children: React.ReactNode, padding: string, height: string, fontSize: string, color: string }} props
 * @returns {JSX.Element}
 */
const EmptyState = ({ text, children, padding, height, fontSize, color }) => {
  return (
    <Container $padding={padding} $height={height}>
      {children}
      {text && (
        <Text $fontSize={fontSize} $color={color}>
          {text}
        </Text>
      )}
    </Container>
  );
};

export default EmptyState;
