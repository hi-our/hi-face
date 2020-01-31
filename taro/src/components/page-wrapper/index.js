import Taro from '@tarojs/taro'
import { Block } from '@tarojs/components'
import { isIphoneSafeArea } from 'utils/common'
import PageStatus from '../page-status'
import ToTop from '../to-top'
import BackHome from '../back-home'

const isIpx = isIphoneSafeArea()

class PageWrapper extends Taro.Component {
  config = {
    component: true
  }

  static defaultProps = {
    status: '',
    type: '',
    errorText: '',
    showRefreshBtn: false
  }


  render() {
    const { status, errorText, errorCode, showRefreshBtn, scrollTop, loadingType } = this.props

    return (
      <Block>
        <PageStatus status={status} errorText={errorText} errorCode={errorCode} showRefreshBtn={showRefreshBtn} loadingType={loadingType}>
          {this.props.children}
          <ToTop scrollTop={scrollTop} styles={isIpx ? 'bottom: 260rpx' : 'bottom: 220rpx'} />
        </PageStatus>
        <BackHome styles={isIpx ? 'bottom: 160rpx' : 'bottom: 120rpx'} />
      </Block>
    )
  }
}

export default PageWrapper