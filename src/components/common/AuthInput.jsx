import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
`;

const Input = styled.input`
  border: none;
  border-bottom: ${({ $error, theme }) =>
    $error ? `1.5px solid ${theme.colors.error}` : `1px solid ${theme.colors.border}`};
  background: transparent;
  padding: 8px 0;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.border};
  }

  &:focus {
    border-bottom: ${({ $error, theme }) =>
      $error
        ? `1.5px solid ${theme.colors.error}`
        : `1.5px solid ${theme.colors.primary}`};
  }
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.error};
`;

export default function AuthInput({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  errorText,
  ...rest
}) {
  return (
    <Wrapper>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        $error={!!errorText}
        {...rest}
      />
      {errorText && <ErrorText>{errorText}</ErrorText>}
    </Wrapper>
  );
}
