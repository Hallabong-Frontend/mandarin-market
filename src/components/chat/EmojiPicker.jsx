import styled, { keyframes } from 'styled-components';
import img1 from '../../assets/emoji/img1.png';
import img2 from '../../assets/emoji/img2.png';
import img3 from '../../assets/emoji/img3.png';
import img4 from '../../assets/emoji/img4.png';

export const STICKERS = [
  { key: 'img1', src: img1 },
  { key: 'img2', src: img2 },
  { key: 'img3', src: img3 },
  { key: 'img4', src: img4 },
];

export const STICKER_MAP = Object.fromEntries(STICKERS.map((s) => [s.key, s.src]));

const slideUp = keyframes`
  from { transform: translateX(-50%) translateY(20px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
`;

const Panel = styled.div`
  position: fixed;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  background: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  z-index: 200;
  animation: ${slideUp} 0.18s ease;
`;

const StickerBtn = styled.button`
  background: none;
  border: none;
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.colors.gray100};
  }

  img {
    width: 72px;
    height: 72px;
    object-fit: contain;
  }
`;

const EmojiPicker = ({ isOpen, onSelect }) => {
  if (!isOpen) return null;

  return (
    <Panel onClick={(e) => e.stopPropagation()}>
      {STICKERS.map((s) => (
        <StickerBtn key={s.key} onClick={() => onSelect(s.key)}>
          <img src={s.src} alt={s.key} />
        </StickerBtn>
      ))}
    </Panel>
  );
};

export default EmojiPicker;
