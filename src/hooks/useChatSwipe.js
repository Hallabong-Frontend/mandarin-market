import { useRef, useState } from 'react';

const useChatSwipe = () => {
  const [swipedChatId, setSwipedChatId] = useState(null);
  const [pinSwipedChatId, setPinSwipedChatId] = useState(null);
  const touchStartX = useRef(null);
  const didSwipe = useRef(false);

  const handlePointerDown = (e) => {
    touchStartX.current = e.clientX;
    didSwipe.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (chatId) => (e) => {
    if (touchStartX.current === null) return;
    const dx = e.clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50) {
      setSwipedChatId(chatId);
      setPinSwipedChatId(null);
      didSwipe.current = true;
    } else if (dx > 50) {
      setPinSwipedChatId(chatId);
      setSwipedChatId(null);
      didSwipe.current = true;
    } else if (Math.abs(dx) > 10) {
      setSwipedChatId(null);
      setPinSwipedChatId(null);
      didSwipe.current = true;
    }
  };

  return {
    swipedChatId,
    setSwipedChatId,
    pinSwipedChatId,
    setPinSwipedChatId,
    didSwipe,
    handlePointerDown,
    handlePointerUp,
  };
};

export default useChatSwipe;
