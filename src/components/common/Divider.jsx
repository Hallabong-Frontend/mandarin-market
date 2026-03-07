import styled from 'styled-components';

const Divider = styled.div`
  height: ${({ height }) => height || '8px'};
  background-color: ${({ theme, bg }) => theme.colors[bg || 'gray100']};
  margin: ${({ margin }) => margin || '0'};
`;

export default Divider;
