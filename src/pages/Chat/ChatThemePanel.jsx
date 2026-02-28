import styled from 'styled-components';
import FullPagePanel from '../../components/common/FullPagePanel';

export const BG_COLORS = [
  { label: '기본', value: '#F2F2F2' },
  { label: '베이지', value: '#FFF5E6' },
  { label: '하늘', value: '#EFF6FF' },
  { label: '민트', value: '#F0FFF4' },
  { label: '라벤더', value: '#F5F0FF' },
  { label: '핑크', value: '#FFF0F5' },
];

export const BUBBLE_COLORS = [
  { label: '감귤', value: '#F26E22' },
  { label: '블루', value: '#3B82F6' },
  { label: '그린', value: '#10B981' },
  { label: '퍼플', value: '#8B5CF6' },
  { label: '핑크', value: '#EC4899' },
  { label: '레드', value: '#EF4444' },
];

const ColorSection = styled.div`
  margin-bottom: 24px;
`;

const ColorSectionTitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.gray400};
  margin: 0 0 12px;
`;

const ColorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ColorSwatch = styled.button`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background-color: ${({ $color }) => $color};
  border: 3px solid ${({ $selected, theme }) => ($selected ? theme.colors.primary : 'transparent')};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
  cursor: pointer;
  position: relative;

  &::after {
    content: ${({ $selected }) => ($selected ? '"✓"' : '""')};
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: ${({ $dark }) => ($dark ? '#fff' : '#333')};
    font-weight: bold;
  }
`;

const SwatchLabel = styled.span`
  display: block;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray400};
  text-align: center;
  margin-top: 4px;
`;

const SwatchItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ChatThemePanel = ({ isOpen, onClose, bgColor, bubbleColor, onBgColorChange, onBubbleColorChange }) => {
  return (
    <FullPagePanel isOpen={isOpen} onClose={onClose} title="배경 설정">
      <ColorSection>
        <ColorSectionTitle>배경 색상</ColorSectionTitle>
        <ColorGrid>
          {BG_COLORS.map((c) => (
            <SwatchItem key={c.value}>
              <ColorSwatch
                $color={c.value}
                $selected={bgColor === c.value}
                onClick={() => onBgColorChange(c.value)}
                aria-label={c.label}
              />
              <SwatchLabel>{c.label}</SwatchLabel>
            </SwatchItem>
          ))}
        </ColorGrid>
      </ColorSection>

      <ColorSection>
        <ColorSectionTitle>내 채팅 색상</ColorSectionTitle>
        <ColorGrid>
          {BUBBLE_COLORS.map((c) => (
            <SwatchItem key={c.value}>
              <ColorSwatch
                $color={c.value}
                $selected={bubbleColor === c.value}
                $dark
                onClick={() => onBubbleColorChange(c.value)}
                aria-label={c.label}
              />
              <SwatchLabel>{c.label}</SwatchLabel>
            </SwatchItem>
          ))}
        </ColorGrid>
      </ColorSection>
    </FullPagePanel>
  );
};

export default ChatThemePanel;
