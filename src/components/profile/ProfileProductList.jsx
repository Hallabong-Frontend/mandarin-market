import { getImageUrl, formatPrice } from '../../utils/format';
import { AI_DESC_SEPARATOR } from '../../constants/common';
import SwiperLeftIconSvg from '../../assets/icons/icon-swiper-1.svg?react';
import SwiperRightIconSvg from '../../assets/icons/icon-swiper-2.svg?react';
import {
  Section,
  SectionTitle,
  ProductSectionHeader,
  ProductNavButtons,
  ProductNavButton,
  ProductList,
  ProductCard,
  ProductImage,
  ProductName,
  ProductPrice,
} from '../../pages/Profile/Profile';

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
