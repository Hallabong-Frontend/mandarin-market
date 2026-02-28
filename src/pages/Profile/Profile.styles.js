import styled from 'styled-components';
import ImageLayersIconSvg from '../../assets/icons/iccon-img-layers.svg?react';
import ListIconSvg from '../../assets/icons/icon-post-list-on.svg?react';
import AlbumIconSvg from '../../assets/icons/icon-post-album-on.svg?react';

export const Wrapper = styled.div`
  padding-bottom: 70px;
`;

export const ProfileSection = styled.div`
  padding: 24px 16px 16px;
`;

export const UserInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 16px;
`;

export const StatItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
`;

export const StatNumber = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
`;

export const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
`;

export const UserDetails = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

export const Username = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 4px;
`;

export const AccountId = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  margin-bottom: 8px;
`;

export const Intro = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
  line-height: 1.5;
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
`;

export const IconActionBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

export const FollowButton = styled.button`
  padding: 8px 28px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  transition: ${({ theme }) => theme.transitions.base};

  ${({ $following, theme }) =>
    $following
      ? `
      background-color: ${theme.colors.white};
      color: ${theme.colors.gray400};
      border: 1px solid ${theme.colors.gray200};
    `
      : `
      background-color: ${theme.colors.primary};
      color: ${theme.colors.white};
      border: 1px solid ${theme.colors.primary};
    `}
`;

export const EditButton = styled.button`
  padding: 8px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.gray500};
  background: ${({ theme }) => theme.colors.white};
  transition: ${({ theme }) => theme.transitions.base};
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

export const Section = styled.section`
  padding: 16px;
`;

export const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  font-family: 'GangwonEducationTteontteon';
  color: ${({ theme }) => theme.colors.black};
  margin: 10px 0 0;
  line-height: 1;
`;

export const ProductSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const ProductNavButtons = styled.div`
  display: flex;
  gap: 6px;
`;

export const ProductNavButton = styled.button`
  position: relative;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray500};
  display: block;
  & > svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 5px;
    height: 8px;
  }
`;

export const ProductList = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ProductCard = styled.div`
  flex-shrink: 0;
  width: 130px;
  cursor: pointer;
`;

export const ProductImage = styled.img`
  width: 130px;
  height: 130px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ProductName = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.black};
  margin-top: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ProductPrice = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  margin-top: 2px;
`;

export const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SettingLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.text};
`;

export const ThemeToggle = styled.button`
  position: relative;
  width: 52px;
  height: 30px;
  border-radius: 999px;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.gray300)};
  transition: ${({ theme }) => theme.transitions.base};
`;

export const ThemeToggleKnob = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $active }) => ($active ? '25px' : '3px')};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #fff;
  transition: ${({ theme }) => theme.transitions.base};
`;

export const PrivacyToggleRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.size.base};
`;

export const PrivacyChevron = styled.span`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

export const PrivacyDetails = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 0 4px;
`;

export const PrivacyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`;

export const PrivacyKey = styled.span`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

export const PrivacyValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  word-break: break-all;
  text-align: right;
`;

export const PostToggle = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 8px;
`;

export const ToggleBtn = styled.button`
  flex: 1;
  padding: 10px;
  display: flex;
  justify-content: center;
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: ${({ theme }) => theme.transitions.base};
`;

export const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

export const AlbumItemWrap = styled.button`
  position: relative;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
`;

export const AlbumItem = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
`;

export const AlbumLayersBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  line-height: 0;
`;

export const AlbumLayersIcon = styled(ImageLayersIconSvg)`
  width: 16px;
  height: 16px;
`;

export const ListIcon = styled(ListIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ $viewMode }) => ($viewMode === 'list' ? '#F26E22' : '#FFC7A7')};
    fill: ${({ $viewMode }) => ($viewMode === 'list' ? '#F26E22' : '#FFC7A7')};
  }
`;

export const AlbumIcon = styled(AlbumIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ $viewMode }) => ($viewMode === 'album' ? '#F26E22' : '#FFC7A7')};
    fill: ${({ $viewMode }) => ($viewMode === 'album' ? '#F26E22' : '#FFC7A7')};
  }
`;
