import { connect } from '@tarojs/redux'
import { modelName as userModel } from '@/store/user'
import { LOGIN_STATUS } from 'constants/status'
import EventEmitter from 'utils/event-emitter'

/**
 * 为 page 级别组件添加公共方法，向被装饰组件塞入 props
 * @param {ReactComponentLike} TaroComponent
 */
export default function WithPage(TaroComponent) {
  @connect(state => ({
    loginStatus: state[userModel].loginStatus,
    isLogin: state[userModel].loginStatus === LOGIN_STATUS.SUCCESS,
    userInfo: state[userModel].userInfo
  }))
  class CorePage extends TaroComponent {
    static options = {
      addGlobalClass: true
    }

    componentWillMount() {

      // 全局通知登录状态
      if (typeof this.onInitLoginCallback === 'function') {
        EventEmitter.on('login-callback-status', this.__loginCallback)
      }
      
      if (super.componentWillMount) {
        super.componentWillMount()
      }
    }

    componentDidShow() {
      // taro中的Page是基于Component来写的，所以在Bisdk中没法在Page上注入监听
      if (process.env.TARO_ENV === 'weapp') {
        wx.bisdk && wx.bisdk.onPageShow && wx.bisdk.onPageShow()
      }
      if (super.componentDidShow) {
        super.componentDidShow()
      }
    }

    componentWillUnmount() {

      // 全局通知登录状态
      if (typeof this.onInitLoginCallback === 'function') {
        EventEmitter.off('login-callback-status', this.__loginCallback)
      }

      if (super.componentWillUnmount) {
        super.componentWillUnmount()
      }
    }

    __loginCallback = (loginStatus) => {  // 防止登录过程超过1s时回调
      this.onInitLoginCallback({
        ...this.props.userInfo,
        sourceType: 'async',
        loginStatus
      })
    }

  }

  CorePage.displayName = TaroComponent.displayName
    || TaroComponent.name
    || 'CorePage'

  return CorePage
}
