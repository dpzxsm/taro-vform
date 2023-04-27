import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Text, View } from '@tarojs/components';
import { showModal } from '@tarojs/taro';
import PropTypes from 'prop-types';
import useForm from './useForm';
import Request from './request';
import './form.css';

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

function VForm(props) {
  const { children, form, initialValues, colon, onValuesChange, onFinish, onFinishFailed, onReset } = props;
  const innerForm = useForm();
  // 保存ref, 可以减少闭包的问题
  const handleRef = useRef({});
  handleRef.current.onValuesChange = onValuesChange;
  handleRef.current.form = form || innerForm;

  const contextValue = {
    form: form || innerForm,
    initialValues,
    colon,
  };

  const values = handleRef.current.form.values;

  useEffect(() => {
    handleRef.current.onValuesChange && handleRef.current.onValuesChange(values);
  }, [values]);

  handleRef.current.form.submit = () => {
    handleRef.current.form
      .validateFields()
      .then(values => {
        onFinish && onFinish(values);
      })
      .catch(err => {
        showModal({
          content: err.message,
          showCancel: false,
        });
        onFinishFailed &&
        onFinishFailed({
          ...err,
          values: handleRef.current.form.getFieldsValue(),
          errorFields: handleRef.current.form.getFieldsError(),
        });
      });
  }

  handleRef.current.form.reset = () => {
    handleRef.current.form.resetFields()
    onReset && onReset();
  }

  return (
    <Form
      className='v-form'
      onSubmit={handleRef.current.form.submit}
      onReset={handleRef.current.form.reset}
    >
      <VFormContext.Provider value={contextValue}>{children}</VFormContext.Provider>
    </Form>
  );
}

VForm.propTypes = {
  children: PropTypes.any,
  colon: PropTypes.bool,
  form: PropTypes.any,
  initialValues: PropTypes.any,
  loading: PropTypes.any,
  onFinish: PropTypes.func,
  onFinishFailed: PropTypes.func,
  onReset: PropTypes.any,
  onValuesChange: PropTypes.any,
};

function VFormFiled(props) {
  const { children, ...reset } = props;
  if (children) {
    return React.cloneElement(children, reset);
  } else {
    return null;
  }
}

function VFormItem(props) {
  const {
    children,
    label,
    name,
    rules = [],
    colon = false,
    hideLabel = false,
    inlineLabel = false,
    initialSource,
    initialVisible = true,
    dependency = {},
    remoteSource,
    remoteSourceDeps,
    required,
    initialValue,
    valuePropName,
  } = props;
  const { form, initialValues, colon: contextColon } = useContext(VFormContext) || {};
  const fixColon = colon || contextColon;
  // 保存ref, 可以减少闭包的问题
  const handleRef = useRef({});
  handleRef.current.remoteSource = remoteSource;
  handleRef.current.dependency = dependency;
  handleRef.current.form = form;

  // 表单联动
  const visibleDeps = (dependency.visible?.related || []).map(name => form.values[name]);
  const valuesDeps = (dependency.value?.related || []).map(name => form.values[name]);
  const sourceDeps = (dependency.source?.related || []).map(name => form.values[name]);
  useEffect(() => {
    if (visibleDeps.length > 0) {
      ;(async () => {
        const { form, dependency } = handleRef.current;
        const values = form.getFieldsValue();
        const newVisible = await dependency?.visible?.get(values, form);
        const oldVisible = form.getFieldVisible(name);
        if (newVisible !== oldVisible) {
          form.setFieldVisible(name, newVisible);
        }
      })();
    }
    // eslint-disable-next-line
  }, [...visibleDeps]);
  useEffect(() => {
    if (valuesDeps.length > 0) {
      ;(async () => {
        const { form, dependency } = handleRef.current;
        const values = form.getFieldsValue();
        const newValue = await dependency?.value?.get(values, form);
        const oldValue = form.getFieldValue(name);
        if (newValue !== oldValue) {
          form.setFieldValue(name, newValue);
        }
      })();
    }
    // eslint-disable-next-line
  }, [...valuesDeps]);
  useEffect(() => {
    if (sourceDeps.length > 0) {
      ;(async () => {
        const { form, dependency } = handleRef.current;
        const values = form.getFieldsValue();
        const newSource = await dependency?.source?.get(values, form);
        const oldSource = form.getFieldSource(name);
        if (newSource !== oldSource) {
          form.setFieldSource(name, newSource);
        }
      })();
    }
    // eslint-disable-next-line
  }, [...sourceDeps]);
  const fixRules = rules.slice();
  const showRequireMarker = required || fixRules.some(item => item.required);
  if (required && fixRules.every(rule => !rule.required)) {
    fixRules.push({
      required: true,
      message: '必须填写' + label,
    });
  }

  const fixChildren = typeof children === 'function' ? children(form.getFieldsValue(), form) : children;

  const [loading, setLoading] = useState(false);
  // 表单特殊属性，需要组件自己去处理
  const fieldProps = {
    name,
    label,
    loading,
    showRequireMarker,
  }

  const filed = name
    ? handleRef.current.form.getFieldDecorator(name, {
      valuePropName,
      initialValue: initialValues?.[name] || initialValue,
      initialSource,
      initialVisible,
      rules: fixRules,
    })(<VFormFiled fieldProps={fieldProps}>{fixChildren}</VFormFiled>)
    : fixChildren;

  const filedVisible = form.getFieldVisible(name);
  const formValues = form.getFieldsValue();

  const remoteSourceValues = (
    (typeof remoteSourceDeps === 'function' ? remoteSourceDeps(formValues, form) : remoteSourceDeps) || []
  ).map(name => formValues[name]);

  useEffect(() => {
    if (filedVisible) {
      if (handleRef.current.remoteSource) {
        const { formatResult, ...options } = handleRef.current.remoteSource;
        setLoading(true);
        Request({
          ...options
        }).then(res => {
          const source = formatResult ? formatResult(res.data) : res.data;
          handleRef.current.form.setFieldSource(name, source);
          setLoading(false);
        })
          .catch(() => {
            setLoading(false);
          });
      }
    }
    // eslint-disable-next-line
  }, [filedVisible, name, ...remoteSourceValues]);

  useEffect(() => {
    if (!filedVisible) {
      const form = handleRef.current.form;
      if (form.getFieldValue(name) !== undefined) {
        form.setFieldValue(name, undefined);
      }
    }
  }, [filedVisible, name]);

  if (!filedVisible || !fixChildren) {
    return null;
  }

  if (hideLabel) {
    return filed;
  }

  if (inlineLabel) {
    return (
      <View className={'v-form-item v-form-item-line'}>
        <View className={'v-form-item-label'}>
          {showRequireMarker && <Text className={'v-form-item-required'}/>}
          {label}
          {fixColon && '：'}
        </View>
        <View className={'v-form-item-content'}>{filed}</View>
      </View>
    );
  } else {
    return (
      <View className={'v-form-item'}>
        <View className={'v-form-item-label'}>
          {showRequireMarker && <Text className={'v-form-item-required'}/>}
          {label}
          {fixColon && '：'}
        </View>
        {filed}
      </View>
    );
  }
}

VFormItem.propTypes = {
  children: PropTypes.func,
  colon: PropTypes.bool,
  dependency: PropTypes.shape({
    source: PropTypes.shape({
      related: PropTypes.array,
      get: PropTypes.func,
    }),
    value: PropTypes.shape({
      related: PropTypes.array,
      get: PropTypes.func,
    }),
    visible: PropTypes.shape({
      related: PropTypes.array,
      get: PropTypes.func,
    }),
  }),
  hideLabel: PropTypes.bool,
  initialSource: PropTypes.array,
  initialValue: PropTypes.any,
  initialVisible: PropTypes.bool,
  inlineLabel: PropTypes.bool,
  label: PropTypes.any,
  name: PropTypes.any,
  remoteSource: PropTypes.shape({
    formatResult: PropTypes.func,
    url: PropTypes.string,
    method: PropTypes.string,
    data: PropTypes.object
  }),
  remoteSourceDeps: PropTypes.oneOf([PropTypes.func, PropTypes.array]),
  required: PropTypes.func,
  rules: PropTypes.array,
  valuePropName: PropTypes.any,
};

VForm.Item = VFormItem;
VForm.useForm = useForm;

export {
  VFormItem
}

export default VForm;
