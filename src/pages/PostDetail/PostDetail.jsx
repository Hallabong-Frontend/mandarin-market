import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getPost } from '../../api/post';
import { getComments, createComment, deleteComment, reportComment } from '../../api/comment';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl, formatTimeAgo } from '../../utils/format';
import PostCard from '../../components/post/PostCard';
import BottomModal from '../../components/common/BottomModal';
import AlertModal from '../../components/common/AlertModal';
import Spinner from '../../components/common/Spinner';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import MoreDotsIconSvg from '../../assets/icons/icon-more-vertical.svg?react';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding-bottom: 80px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 0 16px;
`;

const CommentList = styled.ul`
  padding: 8px 0;
`;

const CommentItem = styled.li`
  padding: 12px 16px;
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

const CommentMoreBtn = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [alertType, setAlertType] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postData, commentsData] = await Promise.all([getPost(postId), getComments(postId)]);
        setPost(postData.post);
        setComments(commentsData.comments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const data = await createComment(postId, commentText);
      setComments((prev) => [...prev, data.comment]);
      setCommentText('');
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentMore = (comment) => {
    setSelectedComment(comment);
    setShowCommentModal(true);
  };

  const isMyComment = selectedComment?.author?.accountname === user?.accountname;

  const commentModalItems = isMyComment
    ? [
        {
          label: '삭제',
          danger: true,
          onClick: () => {
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
            setAlertType('report');
            setShowDeleteAlert(true);
          },
        },
      ];

  const handleAlertConfirm = async () => {
    setShowDeleteAlert(false);
    if (alertType === 'delete') {
      try {
        await deleteComment(postId, selectedComment.id);
        setComments((prev) => prev.filter((c) => c.id !== selectedComment.id));
        setPost((prev) => ({ ...prev, commentCount: prev.commentCount - 1 }));
      } catch (err) {
        console.error(err);
      }
    } else if (alertType === 'report') {
      try {
        await reportComment(postId, selectedComment.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) return <Spinner />;
  if (!post) return null;

  return (
    <>
      <Wrapper>
        <Header />

        <PostCard post={post} onDelete={() => navigate(-1)} />

        <Divider />

        <CommentList>
          {comments.map((comment) => (
            <CommentItem key={comment.id}>
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
                </CommentMeta>
                <CommentText>{comment.content}</CommentText>
              </CommentContent>
              <CommentMoreBtn onClick={() => handleCommentMore(comment)}>
                <MoreDots />
              </CommentMoreBtn>
            </CommentItem>
          ))}
        </CommentList>
      </Wrapper>

      <CommentInput>
        <Avatar src={user?.image} alt={user?.username} size="36px" />
        <CommentTextInput
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="댓글을 입력하세요..."
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
        />
        <PostCommentBtn disabled={!commentText.trim() || isSubmitting} onClick={handleSubmitComment}>
          게시
        </PostCommentBtn>
      </CommentInput>

      <BottomModal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} items={commentModalItems} />

      <AlertModal
        isOpen={showDeleteAlert}
        title={alertType === 'delete' ? '댓글을 삭제할까요?' : '댓글을 신고할까요?'}
        description={
          alertType === 'delete' ? '삭제된 댓글은 복구할 수 없습니다.' : '신고된 댓글은 관리자가 검토합니다.'
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
