import styled from 'styled-components';

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 44px;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: 600;

  &:disabled {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    cursor: default;
  }
`;

/**
 * 전체 너비 제출 버튼. disabled 시 연한 primary 색상으로 표시된다.
 *
 * @param {{ children: React.ReactNode, disabled: boolean, onClick: Function, type: string, className: string }} props
 * @returns {JSX.Element}
 */
export default function SubmitButton({ children, disabled, onClick, type = 'submit', className }) {
  return (
    <Button type={type} disabled={disabled} onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
