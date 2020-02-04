import request from './request'
import Taro from '@tarojs/taro'


export const cloudCallFunction = ({ name, data = {}, config = {} }) => {

  Taro.cloud.callFunction({
    name, //'analyze-face',
    data,
    config
    //  {
    //   FileID: 'cloud://development-v9y2f.6465-development-v9y2f-1251170943/22222.png'
    // }
  }).then(res => {
    console.log('res 222222:', res);
  })

}

export default ({ type = 'get', url, data = {}, cb }) => {
  if (!Reflect.has(request, type)) {
    console.error(`fetch: type ${type} is not a request method. and please use lower case.`)
  }

  const func = Reflect.get(request, type)
  return func({
    url,
    data,
    cb,
  })
}
