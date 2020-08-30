import { View, Image, Button, Block } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { networkInfo } from 'utils/common'
import { NETWORK_ERROR_CODE } from 'constants/status'
import './styles.styl'

export default class PageStatus extends Taro.Component {
  config = {
    component: true
  }

  static defaultProps = {
    status: '', // loading、del、empty、error 、no-people
    loadingType: '',
    errorText: '出错了鸭',
    errorCode: 0,
    showRefreshBtn: false,
    loadingTxt: '初始化中，请稍后',
    onRefresh: () => {},
  }

  goHome = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  onRefresh = () => {
    this.props.onRefresh && this.props.onRefresh()
  }

  render() {
    const { status, errorText, errorCode, loadingType, showRefreshBtn, loadingTxt } = this.props
    console.log('status :', status, errorText);

    if (status === 'loading') {
      return (
        <Block>
          {!loadingType && (
            <View className='page-loading'>
              <View className='page-loading-square'>
                <View className='loading-icon'>
                  
                </View>
              </View>
            </View>
          )}
          {loadingType === 'fullscreen' && (
            <View className='page-loading-fullscreen'>
              <View className='page-loading-square'>
                <View className='loading-icon'>
                  
                </View>
                <View className='loading-txt'>{loadingTxt}</View>
              </View>
            </View>
          )}
        </Block>
      )
    }

    return <Block>{this.props.children}</Block>
  }
}
