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
    const { status, errorText, errorCode, loadingType, showRefreshBtn } = this.props
    console.log('status :', status, errorText);

    if (status === 'loading') {
      return (
        <Block>
          {!loadingType && (
            <View className='page-loading'>
              <View className='page-loading-square'>
                <View className='loading-icon-wrap'>
                  <View className='loading-icon'>
                    <Image src={require('./images/page-loading.png')}></Image>
                  </View>
                </View>
              </View>
            </View>
          )}
        </Block>
      )
    }

    if (status === 'empty') {
      return (
        <View className='page-empty'>
          <Image
            className='pic'
            src='https://n1image.hjfile.cn/res7/2018/12/19/9f8252a1a7d4b90d317ff619629bba3b.png'
          />
          <View className='txt'>{errorText}</View>
        </View>
      )
    }

    if (status === 'del') {
      return (
        <View className='page-del'>
          <View className='body'>
            <Image src='https://n1image.hjfile.cn/res7/2018/12/29/c8d96df2f6037d601a2d46a9c22d8a5f.png' />
            <View className='tip'>{errorText}</View>
            <Button className='action-btn' onTap={this.goHome}>
              返回首页
            </Button>
          </View>
        </View>
      )
    }

    if (status === 'error') {
      return (
        <View className='page-error'>
          <View className='body'>
            {networkInfo.isConnected && <Image src='https://n1image.hjfile.cn/res7/2018/12/20/a92f391b9657f472508f69f8a191e74c.png' />}
            <View className='tip'>{errorText}</View>
            {
              showRefreshBtn || errorCode === NETWORK_ERROR_CODE && (
                <Button className='action-btn' onTap={this.onRefresh}>
                  刷新
                </Button>
              )
            }
          </View>
        </View>
      )
    }

    if (status === 'no-people') {
      return (
        <View className='page-no-people'>
          <View className='body'>
            <Image src='https://n1image.hjfile.cn/res7/2019/04/12/4554bd70b6cf255382d2da98d0539a59.png' />
            <View className='tip'>{errorText}</View>
          </View>
        </View>
      )
    }

    return <Block>{this.props.children}</Block>
  }
}
