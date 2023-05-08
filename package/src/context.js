import React from "react";

const VFormContext = React.createContext({
  form: {
    errors: {},
    errorsArr: [],
    values: {},
    resetFields: () => null,
    validateFields: () => null,
    getFieldDecorator: () => null,
    setFieldValue: () => null,
    setFieldsValue: () => null,
    setFieldSource: () => null,
    setFieldVisible: () => null,
    getFieldsValue: () => null,
    getFieldValue: () => null,
    getFieldSource: () => null,
    getFieldVisible: () => null,
    getFieldsError: () => null,
    getFieldError: () => null,
    setFields: () => null,
    isFieldTouched: () => null,
    isFieldsTouched: () => null,
    submit: () => null,
  },
  initialValues: {},
  colon: false,
});

export default VFormContext
