import Taro from '@tarojs/taro'
import { Block, View, Image } from '@tarojs/components'
import LogoLoading from '../logo-loading'
import './styles.styl'

class ListLoading extends Taro.Component {
  config = {
    component: true
  }

  static defaultProps = {
    listStatus: 'doing',
    showLoadingAlways: false
  }

  onRefresh = () => {
    this.props.onRefresh && this.props.onRefresh()
  }

  render() {
    const { listStatus, showLoadingAlways } = this.props

    let isDoing = !showLoadingAlways && listStatus === 'doing'
    let isAlwaysLoading = showLoadingAlways && listStatus !== 'end'
    let isFail = listStatus === 'fail'

    return (
      <Block>
        <View className='list-loading' style={!isFail && isAlwaysLoading ? 'display: block' : 'display: none'}>
          <View className='list-loading-icon'>
            <LogoLoading></LogoLoading>
          </View>
        </View>
        <View className='list-loading' style={!isFail && isDoing ? 'display: block' : 'display: none'}>
          <View className='list-loading-icon'>
            <LogoLoading></LogoLoading>
          </View>
        </View>
        <View className='list-loading-fail' style={!isFail ? 'display: none' : ''}>
          <Image src={require('./images/load@3x.png')} />加载失败，
          <View className='refresh-btn' onClick={this.onRefresh}>点击重试</View>
        </View>
      </Block>
    )
  }
}

export default ListLoading