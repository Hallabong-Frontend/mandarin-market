import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getPost } from '../../api/post';
import { getComments, createComment, deleteComment, reportComment } from '../../api/comment';
import {
  getPostMeta,
  pinComment,
  unpinComment,
  toggleCommentLike,
  getCommentMetas,
  addReply,
  deleteReply,
  getReplies,
} from '../../firebase/posts';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatTimeAgo } from '../../utils/format';
import PostCard from '../../components/post/PostCard';
import BottomModal from '../../components/common/BottomModal';
import AlertModal from '../../components/common/AlertModal';
import Spinner from '../../components/common/Spinner';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import MoreDotsIconSvg from '../../assets/icons/icon-more-vertical.svg?react';
import HeartIcon from '../../assets/icons/icon-heart.svg?react';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding-bottom: ${({ $hasReplyBanner }) => ($hasReplyBanner ? '116px' : '80px')};
`;

const CommentList = styled.ul`
  padding: 8px 0;
`;

const CommentItem = styled.li``;

const PinIcon = styled.span`
  font-size: 11px;
  filter: grayscale(100%);
  opacity: 0.5;
  margin-left: -4px;
`;

const CommentRow = styled.div`
  padding: 12px 16px 4px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const CommentUsername = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.black};
`;

const CommentTime = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray300};
`;

const CommentText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
`;

const CommentActions = styled.div`
  margin-top: -2px;
`;

const ReplyBtn = styled.button`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
`;

const LikeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const LikeBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $liked, theme }) => ($liked ? theme.colors.error : theme.colors.gray300)};

  svg {
    width: 16px;
    height: 16px;
    fill: ${({ $liked }) => ($liked ? 'currentColor' : 'none')};
    stroke: currentColor;
    stroke-width: 1.8;
  }
`;

const LikeCount = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray400};
`;

const CommentMoreBtn = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ToggleRepliesBtn = styled.button`
  margin-left: 60px;
  padding: 0px 0 8px;
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.gray300};
  }
`;

const ReplyList = styled.ul`
  padding: 0;
`;

const ReplyItem = styled.li`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 6px 16px 6px 60px;
`;

const ReplyBanner = styled.div`
  position: fixed;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  background-color: ${({ theme }) => theme.colors.gray100};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  z-index: 10;

  span {
    font-size: ${({ theme }) => theme.fonts.size.xs};
    color: ${({ theme }) => theme.colors.gray500};
  }

  button {
    font-size: ${({ theme }) => theme.fonts.size.xs};
    color: ${({ theme }) => theme.colors.gray400};
  }
`;

const CommentInput = styled.div`
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
  gap: 12px;
  padding: 10px 16px;
`;

const CommentTextInput = styled.input`
  flex: 1;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray300};
  }
`;

const PostCommentBtn = styled.button`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ disabled, theme }) => (disabled ? theme.colors.gray300 : theme.colors.primary)};
`;

const MoreDots = () => <MoreDotsIconSvg width="18" height="18" />;

/**
 * Firestore Timestamp 또는 ISO 문자열을 상대 시간으로 변환
 * @param {import('firebase/firestore').Timestamp|string|null} createdAt - Firestore Timestamp 또는 날짜 문자열
 * @returns {string} 상대 시간 문자열 (예: '5분 전'), createdAt이 없으면 '방금'
 */
const toTimeAgo = (createdAt) => {
  if (!createdAt) return '방금';
  if (typeof createdAt?.toDate === 'function') return formatTimeAgo(createdAt.toDate().toISOString());
  return formatTimeAgo(createdAt);
};

/**
 * 게시글 상세 페이지 컴포넌트
 * 게시글 내용, 댓글/대댓글, 댓글 고정 기능을 포함
 * @returns {JSX.Element}
 */
const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const inputRef = useRef(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null); // { type: 'comment'|'reply', data }
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [alertType, setAlertType] = useState('');

  const [replyTarget, setReplyTarget] = useState(null); // { commentId, authorUsername }
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replies, setReplies] = useState([]);
  const [commentMetas, setCommentMetas] = useState({});
  const [pinnedCommentId, setPinnedCommentId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postData, commentsData] = await Promise.all([getPost(postId), getComments(postId)]);
        setPost(postData.post);
        setComments(commentsData.comments || []);
      } catch (err) {
        console.error(err);
        navigate('/not-found', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [postId]);

  useEffect(() => {
    const loadFirebaseData = async () => {
      const [meta, metas, repliesData] = await Promise.all([
        getPostMeta(postId),
        getCommentMetas(postId),
        getReplies(postId),
      ]);
      setPinnedCommentId(meta.pinnedCommentId || null);
      setCommentMetas(metas);
      setReplies(repliesData);
    };
    loadFirebaseData();
  }, [postId]);

  /**
   * 댓글 또는 대댓글 제출
   * replyTarget이 있으면 대댓글, 없으면 일반 댓글로 처리
   * @returns {Promise<void>}
   * @throws {Error} API 또는 Firebase 호출 실패 시 토스트 에러 출력
   */
  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (replyTarget) {
        const replyId = await addReply(postId, replyTarget.commentId, {
          content: commentText,
          authorName: user.username,
          authorImage: user.image || '',
          authorAccountname: user.accountname,
        });
        setReplies((prev) => [
          ...prev,
          {
            id: replyId,
            parentCommentId: String(replyTarget.commentId),
            content: commentText,
            authorName: user.username,
            authorImage: user.image || '',
            authorAccountname: user.accountname,
            createdAt: null,
          },
        ]);
        setExpandedReplies((prev) => new Set([...prev, String(replyTarget.commentId)]));
        setReplyTarget(null);
      } else {
        const data = await createComment(postId, commentText);
        setComments((prev) => [...prev, data.comment]);
        setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
      }
      setCommentText('');
    } catch (err) {
      console.error(err);
      toast.error('댓글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 답글 달기 클릭 시 대상 댓글 설정 및 입력창 포커스
   * @param {Object} comment - 대상 댓글 데이터
   * @param {number} comment.id - 댓글 ID
   * @param {Object} comment.author - 댓글 작성자 정보
   * @returns {void}
   */
  const handleReplyClick = (comment) => {
    setReplyTarget({ commentId: String(comment.id), authorUsername: comment.author.username });
    inputRef.current?.focus();
  };

  const handleLike = async (commentId) => {
    const hasLiked = commentMetas[commentId]?.likes?.includes(user?.accountname) || false;
    setCommentMetas((prev) => {
      const current = prev[commentId]?.likes || [];
      const updated = hasLiked ? current.filter((a) => a !== user.accountname) : [...current, user.accountname];
      return { ...prev, [commentId]: { ...prev[commentId], likes: updated } };
    });
    await toggleCommentLike(postId, commentId, user.accountname, hasLiked);
  };

  /**
   * 댓글 고정/해제 토글 (게시글 작성자만 가능)
   * @returns {Promise<void>}
   */
  const handlePinToggle = async () => {
    setShowCommentModal(false);
    const commentId = String(selectedItem?.data?.id);
    if (String(pinnedCommentId) === commentId) {
      await unpinComment(postId);
      setPinnedCommentId(null);
    } else {
      await pinComment(postId, commentId);
      setPinnedCommentId(commentId);
    }
  };

  /**
   * 대댓글 목록 펼치기/접기 토글
   * @param {string} commentId - 대상 댓글 ID
   * @returns {void}
   */
  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  /**
   * 댓글/대댓글 더보기 버튼 클릭 시 모달 표시
   * @param {{ type: 'comment'|'reply', data: Object }} item - 선택된 댓글 또는 대댓글
   * @returns {void}
   */
  const handleItemMore = (item) => {
    setSelectedItem(item);
    setShowCommentModal(true);
  };

  const isMyItem =
    selectedItem?.type === 'comment'
      ? selectedItem?.data?.author?.accountname === user?.accountname
      : selectedItem?.data?.authorAccountname === user?.accountname;

  const isPostAuthor = post?.author?.accountname === user?.accountname;
  const isPinnedSelected =
    selectedItem?.type === 'comment' && String(selectedItem?.data?.id) === String(pinnedCommentId);

  const commentModalItems = [
    ...(isPostAuthor && selectedItem?.type === 'comment'
      ? [{ label: isPinnedSelected ? '고정 해제' : '고정', onClick: handlePinToggle }]
      : []),
    ...(isMyItem
      ? [
          {
            label: '삭제',
            danger: true,
            onClick: () => {
              setShowCommentModal(false);
              setAlertType('delete');
              setShowDeleteAlert(true);
            },
          },
        ]
      : [
          {
            label: '신고하기',
            danger: true,
            onClick: () => {
              setShowCommentModal(false);
              setAlertType('report');
              setShowDeleteAlert(true);
            },
          },
        ]),
  ];

  /**
   * 댓글/대댓글 삭제 또는 신고 확인 처리
   * @returns {Promise<void>}
   * @throws {Error} 삭제/신고 API 호출 실패 시 토스트 에러 출력
   */
  const handleAlertConfirm = async () => {
    setShowDeleteAlert(false);
    if (alertType === 'delete') {
      if (selectedItem?.type === 'comment') {
        try {
          await deleteComment(postId, selectedItem.data.id);
          setComments((prev) => prev.filter((c) => c.id !== selectedItem.data.id));
          setPost((prev) => ({ ...prev, commentCount: prev.commentCount - 1 }));
        } catch (err) {
          console.error(err);
          toast.error('댓글 삭제에 실패했습니다.');
        }
      } else if (selectedItem?.type === 'reply') {
        try {
          await deleteReply(postId, selectedItem.data.id);
          setReplies((prev) => prev.filter((r) => r.id !== selectedItem.data.id));
        } catch (err) {
          console.error(err);
          toast.error('답글 삭제에 실패했습니다.');
        }
      }
    } else if (alertType === 'report') {
      try {
        await reportComment(postId, selectedItem.data.id);
      } catch (err) {
        console.error(err);
        toast.error('신고에 실패했습니다.');
      }
    }
  };

  const sortedComments = pinnedCommentId
    ? [
        ...comments.filter((c) => String(c.id) === String(pinnedCommentId)),
        ...comments.filter((c) => String(c.id) !== String(pinnedCommentId)),
      ]
    : comments;

  if (isLoading) return <Spinner />;
  if (!post) return null;

  return (
    <>
      <Wrapper $hasReplyBanner={!!replyTarget}>
        <Header />
        <PostCard post={post} onDelete={() => navigate(-1)} />

        <CommentList>
          {sortedComments.map((comment) => {
            const commentId = String(comment.id);
            const commentReplies = replies.filter((r) => r.parentCommentId === commentId);
            const replyCount = commentReplies.length;
            const isExpanded = expandedReplies.has(commentId);
            const likeCount = commentMetas[commentId]?.likes?.length || 0;
            const hasLiked = commentMetas[commentId]?.likes?.includes(user?.accountname) || false;
            const isPinned = commentId === String(pinnedCommentId);

            return (
              <CommentItem key={comment.id}>
                <CommentRow>
                  <Avatar
                    src={comment.author?.image}
                    alt={comment.author?.username}
                    size="36px"
                    onClick={() => navigate(`/profile/${comment.author?.accountname}`)}
                  />
                  <CommentContent>
                    <CommentMeta>
                      <CommentUsername>{comment.author?.username}</CommentUsername>
                      <CommentTime>{formatTimeAgo(comment.createdAt)}</CommentTime>
                      {isPinned && <PinIcon>📌</PinIcon>}
                    </CommentMeta>
                    <CommentText>{comment.content}</CommentText>
                    <CommentActions>
                      <ReplyBtn onClick={() => handleReplyClick(comment)}>답글 달기</ReplyBtn>
                    </CommentActions>
                  </CommentContent>
                  <CommentMoreBtn onClick={() => handleItemMore({ type: 'comment', data: comment })}>
                    <MoreDots />
                  </CommentMoreBtn>
                </CommentRow>

                {replyCount > 0 && (
                  <ToggleRepliesBtn onClick={() => toggleReplies(commentId)}>
                    {isExpanded ? '답글 숨기기' : `답글 ${replyCount}개 더 보기`}
                  </ToggleRepliesBtn>
                )}

                {isExpanded && (
                  <ReplyList>
                    {commentReplies.map((reply) => (
                      <ReplyItem key={reply.id}>
                        <Avatar
                          src={reply.authorImage}
                          alt={reply.authorName}
                          size="28px"
                          onClick={() => navigate(`/profile/${reply.authorAccountname}`)}
                        />
                        <CommentContent>
                          <CommentMeta>
                            <CommentUsername>{reply.authorName}</CommentUsername>
                            <CommentTime>{toTimeAgo(reply.createdAt)}</CommentTime>
                          </CommentMeta>
                          <CommentText>{reply.content}</CommentText>
                        </CommentContent>
                        <CommentMoreBtn onClick={() => handleItemMore({ type: 'reply', data: reply })}>
                          <MoreDots />
                        </CommentMoreBtn>
                      </ReplyItem>
                    ))}
                  </ReplyList>
                )}
              </CommentItem>
            );
          })}
        </CommentList>
      </Wrapper>

      {replyTarget && (
        <ReplyBanner>
          <span>@{replyTarget.authorUsername}에게 답글 달기</span>
          <button onClick={() => setReplyTarget(null)}>취소</button>
        </ReplyBanner>
      )}

      <CommentInput>
        <Avatar src={user?.image} alt={user?.username} size="36px" />
        <CommentTextInput
          ref={inputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={replyTarget ? `@${replyTarget.authorUsername}에게 답글...` : '댓글을 입력하세요...'}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
        />
        <PostCommentBtn disabled={!commentText.trim() || isSubmitting} onClick={handleSubmitComment}>
          게시
        </PostCommentBtn>
      </CommentInput>

      <BottomModal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} items={commentModalItems} />

      <AlertModal
        isOpen={showDeleteAlert}
        title={alertType === 'delete' ? '삭제할까요?' : '신고할까요?'}
        description={
          alertType === 'delete' ? '삭제된 내용은 복구할 수 없습니다.' : '신고된 내용은 관리자가 검토합니다.'
        }
        confirmText={alertType === 'delete' ? '삭제' : '신고'}
        danger
        onCancel={() => setShowDeleteAlert(false)}
        onConfirm={handleAlertConfirm}
      />
    </>
  );
};

export default PostDetail;
