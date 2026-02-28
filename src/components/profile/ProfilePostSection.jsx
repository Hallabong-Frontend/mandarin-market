import { useNavigate } from 'react-router-dom';
import PostCard from '../post/PostCard';
import { getImageUrl } from '../../utils/format';
import {
  Section,
  PostToggle,
  ToggleBtn,
  AlbumGrid,
  AlbumItemWrap,
  AlbumItem,
  AlbumLayersBadge,
  AlbumLayersIcon,
  ListIcon,
  AlbumIcon,
} from '../../pages/Profile/Profile';

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
