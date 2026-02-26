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

export default function SubmitButton({ children, disabled, onClick, type = 'submit', className }) {
  return (
    <Button type={type} disabled={disabled} onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
