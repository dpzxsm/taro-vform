import React from 'react'
import { View } from '@tarojs/components'
import {
  Button,
  Input
} from "@nutui/nutui-react-taro";
import './index.css'
import VForm, { VFormItem } from 'taro-vform';

function Index() {
  return (
    <View className="page">
      <VForm >
        <VFormItem  name="aa" label="nihao">
          <Input label={null}/>
        </VFormItem>
      </VForm>
      <View className="index">
        <Button type="primary" className="btn">
          NutUI React Button
        </Button>
      </View>
    </View>
  )
}

export default Index
