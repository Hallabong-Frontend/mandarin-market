import { useNavigate } from 'react-router-dom';
import PostCard from '../post/PostCard';
import { getImageUrl } from '../../utils/format';
import styled from 'styled-components';
import ImageLayersIconSvg from '../../assets/icons/iccon-img-layers.svg?react';
import ListIconSvg from '../../assets/icons/icon-post-list-on.svg?react';
import AlbumIconSvg from '../../assets/icons/icon-post-album-on.svg?react';

const Section = styled.section`
  padding: 16px;
`;

const PostToggle = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 8px;
`;

const ToggleBtn = styled.button`
  flex: 1;
  padding: 10px;
  display: flex;
  justify-content: center;
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: ${({ theme }) => theme.transitions.base};
`;

const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const AlbumItemWrap = styled.button`
  position: relative;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const AlbumItem = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
`;

const AlbumLayersBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  line-height: 0;
`;

const AlbumLayersIcon = styled(ImageLayersIconSvg)`
  width: 16px;
  height: 16px;
`;

const ListIcon = styled(ListIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ $viewMode }) => ($viewMode === 'list' ? '#F26E22' : '#FFC7A7')};
    fill: ${({ $viewMode }) => ($viewMode === 'list' ? '#F26E22' : '#FFC7A7')};
  }
`;

const AlbumIcon = styled(AlbumIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ $viewMode }) => ($viewMode === 'album' ? '#F26E22' : '#FFC7A7')};
    fill: ${({ $viewMode }) => ($viewMode === 'album' ? '#F26E22' : '#FFC7A7')};
  }
`;

const ProfilePostSection = ({ posts, viewMode, setViewMode, setPosts }) => {
  const navigate = useNavigate();
  const postsWithImages = posts.filter((p) => p.image);

  return (
    <Section>
      <PostToggle>
        <ToggleBtn $active={viewMode === 'list'} onClick={() => setViewMode('list')}>
          <ListIcon $viewMode={viewMode} />
        </ToggleBtn>
        <ToggleBtn $active={viewMode === 'album'} onClick={() => setViewMode('album')}>
          <AlbumIcon $viewMode={viewMode} />
        </ToggleBtn>
      </PostToggle>

      {viewMode === 'list' ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={(id) => setPosts((p) => p.filter((item) => item.id !== id))} />
        ))
      ) : (
        <AlbumGrid>
          {postsWithImages.map((post) => {
            const postImages = post.image
              .split(',')
              .map((img) => img.trim())
              .filter(Boolean);
            const firstImage = postImages[0];
            const hasMultipleImages = postImages.length > 1;
            return (
              <AlbumItemWrap key={post.id} onClick={() => navigate(`/post/${post.id}`)}>
                <AlbumItem
                  src={getImageUrl(firstImage)}
                  alt="게시물 이미지"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {hasMultipleImages && (
                  <AlbumLayersBadge aria-label="multiple-images">
                    <AlbumLayersIcon />
                  </AlbumLayersBadge>
                )}
              </AlbumItemWrap>
            );
          })}
        </AlbumGrid>
      )}
    </Section>
  );
};

export default ProfilePostSection;
