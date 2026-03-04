import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import styled from 'styled-components';
import ImageIcon from '../../assets/icons/icon-image.svg?react';
import EmojiIcon from '../../assets/icons/icon-emoji.svg?react';
import EmojiPicker from './EmojiPicker';
import { sendTextMessage, sendImageMessage, sendStickerMessage } from '../../firebase/chat';

const InputArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  background-color: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 8px;
`;

const ImageInputBtn = styled.button`
  width: 36px;
  height: 36px;
  background-color: ${({ theme }) => theme.colors.gray200};
  border: none;
  outline: none;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`;

const EmojiBtn = styled.button`
  width: 36px;
  height: 36px;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.gray300 : theme.colors.gray200)};
  border: none;
  outline: none;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.1s;
`;

const TextInput = styled.textarea`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: none;
  outline: none;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};
  resize: none;
  overflow-y: auto;
  max-height: 120px;
  line-height: 1.4;
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray300};
  }
`;

const SendButton = styled.button`
  border: none;
  outline: none;
  background: transparent;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ disabled, theme }) => (disabled ? theme.colors.gray300 : theme.colors.primary)};
`;

const PasteMenu = styled.ul`
  position: fixed;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.base};
  z-index: 250;
  list-style: none;
  padding: 4px 0;
  min-width: 120px;
`;

const PasteMenuItem = styled.li`
  padding: 10px 16px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    background: ${({ theme }) => theme.colors.gray100};
  }
`;

const ChatInputBar = ({ chatId, senderAccountname }) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pasteMenu, setPasteMenu] = useState({ show: false, x: 0, y: 0 });
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const pasteMenuRef = useRef(null);
  const inputSelectionRef = useRef({ selectionStart: 0, selectionEnd: 0 });

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClick = () => setShowEmojiPicker(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showEmojiPicker]);

  useEffect(() => {
    if (!pasteMenu.show) return;
    const handleClick = () => setPasteMenu((prev) => ({ ...prev, show: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [pasteMenu.show]);

  useLayoutEffect(() => {
    if (!pasteMenu.show || !pasteMenuRef.current) return;
    const { width, height } = pasteMenuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let { x, y } = pasteMenu;
    if (x + width > vw) x = vw - width - 8;
    if (y + height > vh) y = vh - height - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;
    pasteMenuRef.current.style.left = `${x}px`;
    pasteMenuRef.current.style.top = `${y}px`;
  }, [pasteMenu]);

  const handleInputContextMenu = (e) => {
    e.preventDefault();
    inputSelectionRef.current = {
      selectionStart: e.target.selectionStart,
      selectionEnd: e.target.selectionEnd,
    };
    const rect = e.currentTarget.getBoundingClientRect();
    setPasteMenu({ show: true, x: rect.left, y: rect.top });
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      const { selectionStart, selectionEnd } = inputSelectionRef.current;
      setInputText((prev) => prev.slice(0, selectionStart) + clipText + prev.slice(selectionEnd));
    } catch {
      // 클립보드 권한 없을 경우 무시
    }
    setPasteMenu((prev) => ({ ...prev, show: false }));
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsSending(true);
    try {
      await sendTextMessage(chatId, senderAccountname, text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSending(true);
    try {
      await sendImageMessage(chatId, senderAccountname, file);
    } finally {
      setIsSending(false);
      e.target.value = '';
    }
  };

  const handleStickerSend = async (stickerKey) => {
    setShowEmojiPicker(false);
    if (isSending) return;
    setIsSending(true);
    try {
      await sendStickerMessage(chatId, senderAccountname, stickerKey);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <EmojiPicker isOpen={showEmojiPicker} onSelect={handleStickerSend} />
      <InputArea>
        <ImageInputBtn onClick={() => fileRef.current?.click()} disabled={isSending}>
          <ImageIcon width="22" height="22" />
        </ImageInputBtn>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        <EmojiBtn
          $active={showEmojiPicker}
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker((prev) => !prev);
          }}
          disabled={isSending}
        >
          <EmojiIcon width="22" height="22" color="white" />
        </EmojiBtn>
        <TextInput
          ref={textareaRef}
          value={inputText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onContextMenu={handleInputContextMenu}
          onFocus={() => setShowEmojiPicker(false)}
          placeholder="메시지 입력하기..."
          rows={1}
        />
        <SendButton onClick={handleSend} disabled={!inputText.trim() || isSending}>
          전송
        </SendButton>
      </InputArea>

      {pasteMenu.show && (
        <PasteMenu ref={pasteMenuRef} style={{ top: 0, left: 0 }} onClick={(e) => e.stopPropagation()}>
          <PasteMenuItem onClick={handlePaste}>붙여넣기</PasteMenuItem>
        </PasteMenu>
      )}
    </>
  );
};

export default ChatInputBar;
