import {
  SettingRow,
  SettingLabel,
  ThemeToggle,
  ThemeToggleKnob,
  PrivacyToggleRow,
  PrivacyChevron,
  PrivacyDetails,
  PrivacyItem,
  PrivacyKey,
  PrivacyValue,
} from '../../pages/Profile/Profile';
import FullPagePanel from '../common/FullPagePanel';

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
