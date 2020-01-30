import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
// cc 机器人的loading图标
import './styles.global.styl'


const PREFIX = 'ui'
const prefixClass = `${PREFIX}-cclogo-loading`


export default class LogoLoading extends Taro.PureComponent {
  
  // TODO 白色比蓝色的稍微大一圈，可以联系设计修改，或者使用scale或style变换
  render() {
    let { skin, style } = this.props

    return (
      <View className={`${prefixClass}`} style={style}>
        <View className={`${prefixClass}-loading-icon`}>
          <View className={`${prefixClass}-scroll-icon`}>
            {
              skin === 'white'
                ? <Image src={require('./images/logo-loading-white.png')} />
                : <Image src={require('./images/logo-loading-blue.png')} />
            }
          </View>
        </View>
      </View>
    )
  }
}


LogoLoading.defaultProps = {
  skin: 'blue',
  style: ''
}