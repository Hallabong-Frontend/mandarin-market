import { getImageUrl, formatPrice } from '../../utils/format';
import { AI_DESC_SEPARATOR } from '../../constants/common';
import SwiperLeftIconSvg from '../../assets/icons/icon-swiper-1.svg?react';
import SwiperRightIconSvg from '../../assets/icons/icon-swiper-2.svg?react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 16px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  font-family: 'GangwonEducationTteontteon';
  color: ${({ theme }) => theme.colors.black};
  margin-top: 10px;
  line-height: 1;
`;

const ProductSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ProductNavButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const ProductNavButton = styled.button`
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

const ProductList = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductCard = styled.div`
  flex-shrink: 0;
  width: 130px;
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 130px;
  height: 130px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProductName = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.black};
  margin-top: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductPrice = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  margin-top: 2px;
`;

const ProfileProductList = ({ products, productListRef, handleProductClick, scrollProductList }) => {
  if (!products || products.length === 0) return null;

  return (
    <Section>
      <ProductSectionHeader>
        <SectionTitle>판매 중인 상품</SectionTitle>
        <ProductNavButtons>
          <ProductNavButton type="button" aria-label="scroll products left" onClick={() => scrollProductList(-1)}>
            <SwiperLeftIconSvg />
          </ProductNavButton>
          <ProductNavButton type="button" aria-label="scroll products right" onClick={() => scrollProductList(1)}>
            <SwiperRightIconSvg />
          </ProductNavButton>
        </ProductNavButtons>
      </ProductSectionHeader>
      <ProductList ref={productListRef}>
        {products.map((product) => (
          <ProductCard key={product.id} onClick={() => handleProductClick(product)}>
            <ProductImage
              src={getImageUrl(product.itemImage)}
              alt={product.itemName}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/130?text=No+Image';
              }}
            />
            <ProductName>{product.itemName.split(AI_DESC_SEPARATOR)[0].trim()}</ProductName>
            <ProductPrice>{formatPrice(product.price)}원</ProductPrice>
          </ProductCard>
        ))}
      </ProductList>
    </Section>
  );
};

export default ProfileProductList;
