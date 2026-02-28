import { useCallback, useMemo, useState } from 'react';

export default function useForm({
  initialValues,
  validators = {},
  formatters = {},
  getIsValid,
  getIsChanged,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, message = '') => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

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
