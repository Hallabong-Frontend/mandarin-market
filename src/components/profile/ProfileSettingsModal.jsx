import styled from 'styled-components';
import FullPagePanel from '../common/FullPagePanel';

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SettingLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.text};
`;

const ThemeToggle = styled.button`
  position: relative;
  width: 52px;
  height: 30px;
  border-radius: 999px;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.gray300)};
  transition: ${({ theme }) => theme.transitions.base};
`;

const ThemeToggleKnob = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $active }) => ($active ? '25px' : '3px')};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #fff;
  transition: ${({ theme }) => theme.transitions.base};
`;

const PrivacyToggleRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.size.base};
`;

const PrivacyChevron = styled.span`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const PrivacyDetails = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 0 4px;
`;

const PrivacyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`;

const PrivacyKey = styled.span`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const PrivacyValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  word-break: break-all;
  text-align: right;
`;

const ProfileSettingsModal = ({
  showSettingsModal,
  setShowSettingsModal,
  isDark,
  toggleMode,
  showPrivacyInfo,
  setShowPrivacyInfo,
  privacyEmail,
  me,
}) => {
  return (
    <FullPagePanel isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="설정 및 개인정보">
      <SettingRow>
        <SettingLabel>다크모드</SettingLabel>
        <ThemeToggle
          type="button"
          $active={isDark}
          role="switch"
          aria-checked={isDark}
          aria-label="다크모드 토글"
          onClick={toggleMode}
        >
          <ThemeToggleKnob $active={isDark} />
        </ThemeToggle>
      </SettingRow>

      <PrivacyToggleRow type="button" onClick={() => setShowPrivacyInfo((prev) => !prev)}>
        <span>개인정보</span>
        <PrivacyChevron>{showPrivacyInfo ? '▲' : '▼'}</PrivacyChevron>
      </PrivacyToggleRow>

      {showPrivacyInfo && (
        <PrivacyDetails>
          <PrivacyItem>
            <PrivacyKey>email</PrivacyKey>
            <PrivacyValue>{privacyEmail || '정보 없음'}</PrivacyValue>
          </PrivacyItem>
          <PrivacyItem>
            <PrivacyKey>username</PrivacyKey>
            <PrivacyValue>{me?.username || '정보 없음'}</PrivacyValue>
          </PrivacyItem>
          <PrivacyItem>
            <PrivacyKey>accountname</PrivacyKey>
            <PrivacyValue>{me?.accountname || '정보 없음'}</PrivacyValue>
          </PrivacyItem>
        </PrivacyDetails>
      )}
    </FullPagePanel>
  );
};

export default ProfileSettingsModal;
