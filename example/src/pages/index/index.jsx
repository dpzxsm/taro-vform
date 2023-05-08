import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { Button, Input, Calendar, Radio } from '@nutui/nutui-react-taro';
import './index.css';
import VForm from 'taro-vform';

const VFormItem = VForm.Item;

function Date({ value, onChange}) {
  const [isVisible, setIsVisible] = useState(false);

  const openSwitch = () => {
    setIsVisible(true);
  };

  const closeSwitch = () => {
    setIsVisible(false);
  };

  const setChooseValue = (param) => {
    onChange(param[3]);
  };

  return <View>
    <View onClick={() => openSwitch()}>{value ? `${value}` : '请选择'}</View>
    <Calendar
      type='one'
      visible={isVisible}
      defaultValue={value}
      startDate={null}
      endDate={null}
      onClose={closeSwitch}
      onChoose={setChooseValue}
    />
  </View>;
}

function Index() {
  return (
    <View className='page'>
      <VForm colon onFinish={console.log} onFinishFailed={console.error}>
        <VFormItem name='name' label='姓名' inlineLabel
                   required>
          <Input/>
        </VFormItem>
        <VFormItem
          name='phone'
          label='手机号'
          inlineLabel
          required
          rules={[
            { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input type='number'/>
        </VFormItem>

        <VFormItem
          name='date'
          label='日期'
          inlineLabel
          required
        >
          <Date/>
        </VFormItem>


        <VFormItem
          name='radio'
          label='单选'
          inlineLabel
          required
        >
          <Radio.RadioGroup>
            <Radio value="1">选项1</Radio>
            <Radio value="2">选项2</Radio>
            <Radio value="3">选项3</Radio>
          </Radio.RadioGroup>
        </VFormItem>

        <Button type='primary' className='btn' formType='submit'>
          提交
        </Button>
      </VForm>
    </View>
  );
}

export default Index;
