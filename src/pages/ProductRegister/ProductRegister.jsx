import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createProduct, updateProduct, getProduct } from '../../api/product';
import { uploadImage } from '../../api/auth';
import { generateProductInfo, parseProductInfo } from '../../api/ai';
import { getImageUrl, formatPrice, parsePrice } from '../../utils/format';
import useForm from '../../hooks/useForm';
import UploadIconSvg from '../../assets/icons/icon-upload.svg?react';
import Header from '../../components/common/Header';
import AlertModal from '../../components/common/AlertModal';
import AuthInput from '../../components/common/AuthInput';
import { SpinnerRing } from '../../components/common/Spinner';
import { AI_DESC_SEPARATOR } from '../../constants/common';

const Wrapper = styled.div`
  min-height: 100vh;
`;

const Content = styled.div`
  padding: 24px 16px;
`;

const ImageSectionLabel = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  margin-bottom: 8px;
`;

const ImageUploadArea = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  background-color: ${({ theme }) => theme.colors.gray100};
  margin-bottom: 8px;

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const UploadedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.gray300};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
`;

const ItemNameField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AiButton = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  background-color: ${({ $generated, theme }) =>
    $generated ? theme.colors.white : theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.semiBold};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.2s;
  margin-bottom: 16px;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.gray300};
    background-color: ${({ theme }) => theme.colors.gray100};
    cursor: not-allowed;
  }
`;

const AiDescBox = styled.div`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
  line-height: 1.6;
  white-space: pre-wrap;
`;

const AiDescLabel = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.semiBold};
  margin-bottom: 4px;
`;

const UploadIcon = () => <UploadIconSvg width="32" height="32" />;

const ProductRegister = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const fileRef = useRef(null);

  const [previewImage, setPreviewImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

  const {
    values: form,
    setValues,
    errors,
    setFieldError,
    handleChange,
    handleBlur,
    isValid,
  } = useForm({
    initialValues: {
      itemName: '',
      price: '',
      link: '',
    },
    formatters: {
      price: parsePrice,
    },
    validators: {
      itemName: (value) => {
        if (!value) return '';
        if (value.length < 2 || value.length > 15) {
          return '상품명은 2~15자 이내여야 합니다.';
        }
        return '';
      },
    },
    getIsValid: ({ values, errors }) =>
      !!previewImage &&
      values.itemName.length >= 2 &&
      values.itemName.length <= 15 &&
      !!values.price &&
      !!values.link &&
      !errors.itemName,
  });

  useEffect(() => {
    if (isEdit && productId) {
      const loadProduct = async () => {
        try {
          const data = await getProduct(productId);
          const product = data.product;
          const separatorIndex = product.itemName.indexOf(AI_DESC_SEPARATOR);
          const parsedName =
            separatorIndex !== -1
              ? product.itemName.slice(0, separatorIndex)
              : product.itemName;
          const parsedDesc =
            separatorIndex !== -1
              ? product.itemName.slice(separatorIndex + AI_DESC_SEPARATOR.length)
              : '';
          setValues({
            itemName: parsedName,
            price: String(product.price),
            link: product.link,
          });
          if (parsedDesc) {
            setAiDescription(parsedDesc);
            setAiGenerated(true);
          }
          setPreviewImage(getImageUrl(product.itemImage));
          setExistingImageUrl(product.itemImage);
        } catch (err) {
          console.error(err);
        }
      };
      loadProduct();
    }
  }, [isEdit, productId, setValues]);

  const doAiGenerate = async () => {
    setIsAiLoading(true);
    try {
      const raw = await generateProductInfo(previewImage || null);
      const { itemName, description } = parseProductInfo(raw);
      setValues((prev) => ({ ...prev, itemName }));
      setAiDescription(description);
      setAiGenerated(true);
      setFieldError('itemName', '');
    } catch (err) {
      console.error(err);
      alert('AI 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiGenerate = () => {
    if (!previewImage) {
      alert('이미지를 먼저 업로드해 주세요.');
      return;
    }
    if (form.itemName) {
      setShowOverwriteModal(true);
      return;
    }
    doAiGenerate();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        const imgData = await uploadImage(imageFile);
        imageUrl = imgData.filename;
      }

      const combinedItemName = aiDescription
        ? `${form.itemName}${AI_DESC_SEPARATOR}${aiDescription}`
        : form.itemName;

      const productData = {
        itemName: combinedItemName,
        price: Number(form.price),
        link: form.link,
        itemImage: imageUrl,
      };

      if (isEdit) {
        await updateProduct(productId, productData);
      } else {
        await createProduct(productData);
      }

      navigate(-1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header
        type="back-title-save"
        saveDisabled={!isValid || isLoading}
        onSave={handleSave}
      />

      <Content>
        <ImageSectionLabel>이미지 등록</ImageSectionLabel>
        <ImageUploadArea onClick={() => fileRef.current?.click()}>
          {previewImage ? (
            <UploadedImage src={previewImage} alt="상품 이미지" />
          ) : (
            <UploadPlaceholder>
              <UploadIcon />
              <span>상품 이미지를 업로드하세요</span>
            </UploadPlaceholder>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </ImageUploadArea>

        <AiButton
          type="button"
          $generated={aiGenerated}
          disabled={isAiLoading}
          onClick={handleAiGenerate}
        >
          {isAiLoading ? (
            <>
              <SpinnerRing $size="14px" />
              AI 생성 중...
            </>
          ) : aiGenerated ? (
            '✦ 다시 생성'
          ) : (
            '✦ AI 상품 설명 생성'
          )}
        </AiButton>

        <Form onSubmit={handleSave}>
          <ItemNameField>
            <AuthInput
              label="상품명"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              onBlur={() => handleBlur('itemName')}
              placeholder="상품명을 입력해주세요"
              errorText={errors.itemName}
            />
            {aiDescription && (
              <>
                <AiDescLabel>AI 생성 설명</AiDescLabel>
                <AiDescBox>{aiDescription}</AiDescBox>
              </>
            )}
          </ItemNameField>

          <AuthInput
            label="가격"
            name="price"
            value={form.price ? formatPrice(form.price) : ''}
            onChange={handleChange}
            placeholder="가격을 입력해주세요"
            inputMode="numeric"
          />

          <AuthInput
            label="판매링크"
            type="url"
            name="link"
            value={form.link}
            onChange={handleChange}
            placeholder="URL을 입력해주세요"
          />
        </Form>
      </Content>

      <AlertModal
        isOpen={showOverwriteModal}
        title="기존 입력 내용이 있습니다."
        description="덮어쓰시겠습니까?"
        cancelText="취소"
        confirmText="덮어쓰기"
        onCancel={() => setShowOverwriteModal(false)}
        onConfirm={() => {
          setShowOverwriteModal(false);
          doAiGenerate();
        }}
      />
    </Wrapper>
  );
};

export default ProductRegister;
