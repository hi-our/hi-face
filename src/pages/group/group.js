import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import CorePage from 'page'
import fetch from 'utils/fetch'
import { $log } from 'utils/common'
import { apiGroupInfo } from 'constants/apis'
import { LOGIN_STATUS } from 'constants/status'
import PageWrapper from 'components/page-wrapper'
import LoginBtn from 'components/login-btn-wx'


import './styles.styl'

const USER_IDENTITY = {
  ORDINARY_MEMBER: 0, // 普通成员
  ADMINISTRATORS: 1, // 管理员
  GROUP_OWNERS: 2, // 群主
  OFFICIAL_ADMINISTRATORS: 3, // 官方管理员
  TEMPORARY_ADMINISTRATORS: 4, // 临时管理员
  GUEST_VISITS: 5, // 来宾访问
  ANONYMOUS: 6 // 匿名
}

@CorePage
class Group extends Component {
  config = {
    navigationBarTitleText: '我的打卡'
  }

  constructor(props) {
    super(props)
    const { groupId = '' } = this.$router.params
    // 分享到微信，里面多了u_code=xxxxx
    this.pageGroupId = groupId.split('u_code')[0]

    this.state = {
      pageDataStatus: 'initial',
      groupInfo: {},
      isMember: false,
      errorText: '',
      errorCode: 0
    }
  }

  componentWillMount() {
    this.fetchGroupInfo()
  }

  loginBtnRef = el => this.loginBtn = el

  onInitLoginCallback({ loginStatus }) {
    if (this.state.pageDataStatus === 'initial' || this.state.pageDataStatus === 'error') {
      if (loginStatus === LOGIN_STATUS.SUCCESS) {
        this.fetchGroupInfo()
      }
    }
  }

  fetchGroupInfo = () => { // NOTE: 使用 pending 的原因是不想 setState 导致页面闪烁
    if (!this.pageGroupId) {
      this.setState({
        pageDataStatus: 'error',
        errorText: '请输入群号'
      })
      return
    }
    if (this.state.pageDataStatus === 'loading') return

    this.setState({
      pageDataStatus: 'loading'
    })

    fetch({
      url: apiGroupInfo,
      data: {
        groupId: this.pageGroupId
      }
    }).then((res) => {
      console.log('res', res)
      this.setState({
        groupInfo: res,
        isMember: res.visitorIdentity >= USER_IDENTITY.ORDINARY_MEMBER && res.visitorIdentity <= USER_IDENTITY.TEMPORARY_ADMINISTRATORS,
        pageDataStatus: 'done',
      })

    }).catch((e) => {
      if (e.status !== -40100) {
        $log(e)
      }

      this.setState({
        pageDataStatus: 'error',
        errorText: e.message,
        errorCode: e.status
      })
    })
  }

  loginBtnClick = () => {
    this.loginBtn.login()
  }

  render() {
    const { isLogin } = this.props
    const { pageDataStatus, isMember, errorText, errorCode } = this.state
    
    return (
      <PageWrapper status={pageDataStatus} errorText={errorText} errorCode={errorCode}>
        {
          isMember
            ? <View>群成员</View>
            : (
              isLogin
                ? <View>已登录</View>
                : <View onClick={this.loginBtnClick}>未登录</View>
            )
        }
        <LoginBtn
          ref={this.loginBtnRef}
        />
      </PageWrapper>
    )
  }
}