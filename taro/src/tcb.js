import Taro from '@tarojs/taro'
import * as config from 'config'

// 内核
import cloudbase from '@cloudbase/js-sdk/app';
// 登录模块
import '@cloudbase/js-sdk/auth';
// 云函数模块
import '@cloudbase/js-sdk/functions';
// 云存储模块
import '@cloudbase/js-sdk/storage';

console.log('Taro.getEnv() :>> ', Taro.getEnv());

if (Taro.getEnv() === 'WEAPP') {
  Taro.cloud.init({
    env: config.envId
  })
} else if (Taro.getEnv() === 'WEB') {
  // 注册功能模块
  console.log('1 :>> ', 1);
  Taro.cloud  = cloudbase.init({
    env: config.envId
  })

  Taro.cloud
    .auth({
      persistence: "local"
    })
    .anonymousAuthProvider()
    .signIn()
    .then((res) => {
      // 登录成功
      console.log('res :>> ', res);
    })
    .catch((err) => {
      // 登录失败
      console.log('err :>> ', err);
    });
  // Taro.cloud = cloudbase
  // Taro.cloud.app = app
}