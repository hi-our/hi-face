import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { History } from 'utils/navigate'
import './styles.styl'

/**
 * 解决微信页面栈层级过深问题，实现无限跳转
 * 默认此页面肯定在第九层。
 **/
export default class ProxyPage extends Taro.Component {
  config = {
    navigationBarBackgroundColor: '#fff',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: ' ',
    backgroundColor: '#fff'
  }

  componentDidShow() {
    const size = History.size()
    if (size > 0) {
      Taro.navigateTo({
        url: History.pop()
      })
    } else {
      Taro.navigateBack()
    }
  }

  render() {
    return (
      <View className='bg'>
        <Image
          className='duck-side'
          src={require('../../images/proxy_bg.png')}
        />
      </View>
    )
  }
}
