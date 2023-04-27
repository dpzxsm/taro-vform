import Taro from '@tarojs/taro';

let requestFunc = Taro.request;

function registerCustomRequest(func) {
  requestFunc = func;
}

function request(options) {
  return requestFunc(options);
}


export {
  registerCustomRequest
};

export default request
