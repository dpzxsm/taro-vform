# taro-vform [![npm version](https://badge.fury.io/js/taro-vform.svg)](https://badge.fury.io/js/taro-vform)

这是一个基于 React 的表单库，专为 Taro 3.0 小程序开发而设计。它提供了一组易于使用的表单管理组件和hooks，以帮助您快速创建并管理表单。

## 特性

- 提供了一个通用的表单管理组件
- 支持表单校验和错误提示
- 支持自定义表单组件和校验规则
- 支持表单数据双向绑定和动态表单
- 支持表单数据源管理
- 支持表单值、是否可见、数据源的联动
- 支持各种第三方组件库，例如@nutui/nutui-react-taro taro-ui@3.0

## 安装

通过 npm 安装：

```
npm install --save taro-vform
```

通过 yarn 安装：

```
yarn add taro-vform
```

## 注意
如果taro配置中开启了webpack5 并且开启了prebundle，请关闭prebundle或者排除掉taro-vform
```javascript
compiler: {
  type: 'webpack5',
    prebundle: {
    enable: true,
      exclude: ["taro-vform"]
  }
}
```

## 简单使用

导入组件

```javascript
import VForm from 'taro-vform';

const VFormItem = VForm.Item;
```

在 render 方法中渲染表单：

```javascript
<VForm onFinish={handleSubmit}>
  <VFormItem name='name' label='姓名' required>
    <Input/>
  </VFormItem>
  <VFormItem name='phone' label='手机号' required>
    <Input/>
  </VFormItem>
  <Button type='primary' formType='submit'>
    提交
  </Button>
</VForm>
```

在 handleSubmit 方法中处理表单提交：

```javascript
function handleSubmit(values) {
  console.log(data); // { name: '', phone: '' }
  // 处理表单提交逻辑
}
```

## 表单校验

```javascript
// 正则校验
<VFormItem name='phone' label='手机号' rules={[{ pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' },]}>
  <Input/>
</VFormItem>

// 长度校验
<VFormItem name='name' label='姓名' rules={[{ type: "string", max: 5, message: '最多只能填写5个字符' },]}>
  <Input/>
</VFormItem>
```

更多使用方法请求参考 [async-validator](https://github.com/yiminghe/async-validator)

## 远程数据源

```javascript
<VFormItem name='job' label='职业' remoteSource={{ url: "/api/job/options", formatResult: res => res }}>
  <Select/>
</VFormItem>
```

## 表单联动

```javascript
<VFormItem name='account' label='账号'>
  <Input/>
</VFormItem>
<VFormItem name='password' label='密码'>
  <Input/>
</VFormItem>
// 当账号和密码都不为空时，才显示验证码的表单项
<VFormItem name='code' label='验证码'
           dependency={{
             visible: {
               related: ["account", "password"],
               get: (values) => !!(values.account && values.password)
             }
           }}>
  <Input/>
</VFormItem>
```

## 单个表单项维护多个字段
```javascript
<VFormItem name={["startTime", "endTime"]} label='时间范围'>
  <DateRangePicker/>
</VFormItem>
```

## 支持hooks
```javascript
const form = Form.useForm();
// 获取当前表单的值
const values = form.getFieldsValue();
// 获取表单错误信息
const errors = form.getFieldsError();
// 校验表单
form.validateFields().then(values => {}).catch(errors => {});
// 直接提交表单，如果没有使用button来提交表单，可以直接用这个函数来提交
form.submit();

```

## VForm

| Prop 名称          | 类型          | 描述                                                                   | 默认值   |
|------------------|-------------|----------------------------------------------------------------------|-------|
| `children`       | `ReactNode` | 包含表单项的任意react元素                                                      | 无     |
| `colon`          | `bool`      | 是否在表单项标签后面显示冒号。                                                      | false |
| `form`           | `any`       | 您可以通过该属性传递表单实例，并使用它的方法来控制表单，通过Form.useFrom可以创建form实例，不传递则使用默认的form实例 | -     |
| `initialValues`  | `any`       | 表单的初始值。可以是一个普通对象或一个返回普通对象的函数。                                        | -     |
| `onFinish`       | `func`      | 当表单提交成功后触发的回调函数。                                                     | -     |
| `onFinishFailed` | `func`      | 当表单提交失败后触发的回调函数。                                                     | -     |
| `onReset`        | `any`       | 当表单重置时触发的回调函数。可以是一个函数或一个返回函数的函数。                                     | -     |
| `onValuesChange` | `any`       | 当表单项的值发生变化时触发的回调函数。可以是一个函数或一个返回函数的函数。                                | -     |

## VForm.Item

| 属性名                | 类型                                        | 描述                                                                         | 默认值      |
|--------------------|-------------------------------------------|----------------------------------------------------------------------------|----------|
| `children`         | `ReactNode\|func`                         | 表单组件或者一个函数返回一个表单组件，函数可以返回null                                              | 无        |
| `colon`            | `bool`                                    | 是否在表单项标签后面显示冒号。                                                            | `false`  |
| `dependency`       | Record<String, [Dependency](#Dependency)> | 表单项的依赖关系。可以包含 `source`、`value` 和 `visible` 三个属性                            | 无        |
| `hideLabel`        | `bool`                                    | 是否隐藏表单项的标签。                                                                | `false`  |
| `initialSource`    | `array`                                   | 表单项的初始源数据。                                                                 | `[]`     |
| `initialValue`     | `any`                                     | 表单项的初始值。                                                                   | 无        |
| `initialVisible`   | `bool`                                    | 表单项的初始可见状态。                                                                | `true`   |
| `inlineLabel`      | `bool`                                    | 是否将表单项的标签和控件放在同一行。                                                         | `false`  |
| `label`            | `any`                                     | 表单项的标签。                                                                    | 无        |
| `name`             | `strring\|array`                          | 表单项的名称，可以为数组，如果是数组，则表示该表单项有多个字段                                            | 无        |
| `remoteSource`     | [RemoteSource](#RemoteSource)             | 表单项的远程数据源。                                                                 | 无        |
| `remoteSourceDeps` | `array\|function`                         | 表示远程数据源的依赖项。可以是一个函数或一个数组, 依赖项变化时会触发数据源更新                                   | 无        |
| `required`         | `func`                                    | 表单项是否必填，相当于 rules=[{ required: true }] 的简洁写法                               | 无        |
| `rules`            | `array`                                   | 表单项的验证规则，参考 [async-validator](https://github.com/yiminghe/async-validator) | `[]`     |
| `valuePropName`    | `string`                                  | 表单项的值属性名称。                                                                 | `value`  |
| `sourcePropName`   | `string`                                  | 表单项的源数据属性名称。                                                               | `source` |

## Dependency

| 属性名     | 类型         | 描述                       |
|---------|------------|--------------------------|
| related | `arrary`   | 表单依赖的值，如果表单值变化，则会触发get函数 |
| get     | `function` | 返回相应依赖属性的值，参数是表单的当前值     |

## RemoteSource

请求接口默认使用Taro.request，支持Taro.request的所有参数，如果需要适配自己封装的请求方法或者是其他第三方请求库，参考[此处](#VFormregisterCustomRequest)

| 属性名          | 类型       | 描述        |
|--------------|----------|-----------|
| url          | `string` | 服务器接口地址   |
| data         | `object` | 请求的参数     |
| method       | `string` | HTTP 请求方法 |
| formatResult | `method` | 数据源格式化函数  |

## VForm.useForm

| 属性名               | 类型         | 描述                |
|-------------------|------------|-------------------|
| errors            | `object`   | 一个包含表单每个字段错误信息的对象 |
| errorsArr         | `array`    | 所有错误信息的数组         |
| values            | `object`   | 一个包含表单每个字段值的对象    |
| resetFields       | `function` | 重置表单所有字段的值和状态     |
| validateFields    | `function` | 验证表单所有字段          |
| getFieldDecorator | `function` | 生成一个表单项的装饰器函数     |
| setFieldValue     | `function` | 设置某个表单项的值         |
| setFieldsValue    | `function` | 批量设置表单项的值         |
| setFieldSource    | `function` | 设置某个表单项的数据源       |
| setFieldVisible   | `function` | 设置某个表单项的可见性       |
| getFieldsValue    | `function` | 获取所有表单项的值         |
| getFieldValue     | `function` | 获取某个表单项的值         |
| getFieldSource    | `function` | 获取某个表单项的数据源       |
| getFieldVisible   | `function` | 获取某个表单项的可见性       |
| getFieldsError    | `function` | 获取所有表单项的错误信息      |
| getFieldError     | `function` | 获取某个表单项的错误信息      |
| setFields         | `function` | 批量设置表单项的值和状态      |
| isFieldTouched    | `function` | 判断某个表单项是否被触碰过     |
| isFieldsTouched   | `function` | 判断所有表单项是否被触碰过     |
| submit            | `function` | 直接提交表单            |

## VForm.registerCustomRequest

```javascript
import VForm from 'taro-vform';

function customRequest(options) {
    // 必须返回一个promise对象
    return new Promise((resolve, reject) => {
    })
}

VForm.registerCustomRequest(customRequest)
```javascript
