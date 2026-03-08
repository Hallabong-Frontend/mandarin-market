import { useCallback, useMemo, useState } from 'react';

/**
 * 폼 상태를 관리하는 커스텀 훅.
 * 값 변경, 유효성 검사, 포맷터, 제출 가능 여부를 통합 관리한다.
 *
 * @param {Object} options
 * @param {Object} options.initialValues - 초기 필드 값
 * @param {Object} [options.validators={}] - 필드별 유효성 검사 함수 (value, values) => 에러 메시지 or ''
 * @param {Object} [options.formatters={}] - 필드별 포맷터 함수 (value) => 변환된 값
 * @param {Function} [options.getIsValid] - 전체 유효성 커스텀 판단 함수 ({values, errors}) => boolean
 * @param {Function} [options.getIsChanged] - 변경 여부 커스텀 판단 함수 (values) => boolean
 * @returns {{ values, setValues, errors, setErrors, setFieldValue, setFieldError, handleChange, handleBlur, validateField, isValid, isChanged }}
 */
export default function useForm({
  initialValues,
  validators = {},
  formatters = {},
  getIsValid,
  getIsChanged,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  /**
   * 특정 필드의 값을 직접 설정한다.
   *
   * @param {string} name - 필드명
   * @param {*} value - 설정할 값
   */
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * 특정 필드의 에러 메시지를 설정한다.
   *
   * @param {string} name - 필드명
   * @param {string} [message=''] - 에러 메시지
   */
  const setFieldError = useCallback((name, message = '') => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  /**
   * input onChange 핸들러. 이벤트 객체 또는 (name, value) 형태 모두 지원.
   *
   * @param {React.ChangeEvent|string} eOrName - 이벤트 또는 필드명
   * @param {*} [valueArg] - 필드명 전달 시 값
   */
  const handleChange = useCallback(
    (eOrName, valueArg) => {
      const name = typeof eOrName === 'string' ? eOrName : eOrName.target.name;
      const rawValue = typeof eOrName === 'string' ? valueArg : eOrName.target.value;
      const formatter = formatters[name];
      const nextValue = formatter ? formatter(rawValue) : rawValue;
      setFieldValue(name, nextValue);
    },
    [formatters, setFieldValue],
  );

  /**
   * 특정 필드의 유효성을 검사하고 에러를 설정한다.
   *
   * @param {string} name - 필드명
   * @param {*} [valueArg] - 검사할 값 (없으면 현재 values[name] 사용)
   * @returns {boolean} 유효하면 true
   */
  const validateField = useCallback(
    (name, valueArg) => {
      const validator = validators[name];
      if (!validator) return true;

      const fieldValue = valueArg ?? values[name];
      const message = validator(fieldValue, values) || '';
      setFieldError(name, message);
      return !message;
    },
    [validators, values, setFieldError],
  );

  /**
   * input onBlur 핸들러. 포커스 해제 시 해당 필드 유효성을 검사한다.
   *
   * @param {React.FocusEvent|string} eOrName - 이벤트 또는 필드명
   * @returns {boolean} 유효하면 true
   */
  const handleBlur = useCallback(
    (eOrName) => {
      const name = typeof eOrName === 'string' ? eOrName : eOrName.target.name;
      return validateField(name);
    },
    [validateField],
  );

  const isValid = useMemo(() => {
    if (typeof getIsValid === 'function') {
      return getIsValid({ values, errors });
    }
    return Object.values(errors).every((message) => !message);
  }, [getIsValid, values, errors]);

  const isChanged = useMemo(() => {
    if (typeof getIsChanged === 'function') {
      return getIsChanged(values);
    }
    return false;
  }, [getIsChanged, values]);

  return {
    values,
    setValues,
    errors,
    setErrors,
    setFieldValue,
    setFieldError,
    handleChange,
    handleBlur,
    validateField,
    isValid,
    isChanged,
  };
}
