import React from 'react';
import { View } from '@tarojs/components';
import { Button, Input } from '@nutui/nutui-react-taro';
import './index.css';
import VForm, { VFormItem } from 'taro-vform';

function Index() {
  return (
    <View className="page">
      <VForm onFinish={() => {
        console.log('suming', "提交成功")
      }} colon>
        <VFormItem  name="aa" label="内容" inlineLabel>
          <Input/>
        </VFormItem>
        <Button type="primary" className="btn" formType="submit">
          提交
        </Button>
      </VForm>
    </View>
  )
}

export default Index
