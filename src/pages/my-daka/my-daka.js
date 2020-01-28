import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import CorePage from 'page'
import fetch from 'utils/fetch'
import { $log } from 'utils/common'
import { apiMyDakaList } from 'constants/apis'
import { LOGIN_STATUS } from 'constants/status'
import PageWrapper from 'components/page-wrapper'
import ListLoading from 'components/list-loading'
import LoginBtn from 'components/login-btn-wx'
import userActions from '@/store/user'
import { navigateTo, redirectTo } from 'utils/navigate'

import './styles.styl'

const LIMIT = 20
const UN_LOGIN_HBG = 'https://n1image.hjfile.cn/res7/2019/11/22/cdaeb242a862231ca221e7da300334b4.png'

@CorePage
class MyDaka extends Component {
  config = {
    navigationBarTitleText: '我的打卡',
  }

  constructor(props) {
    super(props)

    
    this.state = {
      dakaList: [],
      start: 0,
      pageDataStatus: 'initial',
      morePage: true,
      pageLoading: true,
      pageHasError: false,
    }
  }
  
  componentWillMount() {
    userActions.isClubAuthValid().then(isValid => {
      if (isValid) {
        this.fetMyDakaList()
      }
    })
  }

  loginBtnRef = el => this.loginBtn = el

  // loginScene为注册、登录、账号切换等手动登录场景
  onInitLoginCallback({ loginStatus }) {
    const { userInfo: { loginScene } } = this.props
    if (this.state.pageDataStatus === 'initial' || this.state.pageDataStatus === 'fail' || !!loginScene) {
      if (loginStatus === LOGIN_STATUS.SUCCESS) {
        this.fetMyDakaList()
      } else {
        // 未登录，并且数据未加载过或者加载失败
        this.setState({
          pageLoading: false,
        })
      }
    }
  }

  fetMyDakaList = (pendingData) => { // NOTE: 使用 pending 的原因是不想 setState 导致页面闪烁
    let { start, dakaList } = pendingData || this.state
    if (this.state.pageDataStatus === 'doing') return

    this.setState({
      pageDataStatus: 'doing'
    })

    return fetch({
      url: apiMyDakaList,
      data: {
        limit: LIMIT,
        start
      }
    }).then((res) => {
      dakaList = start > 0 ? dakaList.concat(res.items) : res.items

      this.setState({
        start: start + LIMIT,
        dakaList,
        pageDataStatus: !res.morePage ? 'end' : 'done',
        morePage: res.morePage,
        pageLoading: false,
        pageHasError: false
      })

    }).catch((e) => {
      if (e.status !== -40100) {
        $log(e)
      }

      const { loginStatus } = this.props
      this.setState({
        ...(loginStatus !== LOGIN_STATUS.LOADING ? { pageLoading: false } : {}),
        pageDataStatus: 'fail',
        pageHasError: true
      })
    })
  }

  onReachBottom() {
    const { morePage } = this.state

    if (morePage && this.state.pageDataStatus !== 'doing') {
      this.fetMyDakaList()
    }
  }

  getInitialData = () => {
    return {
      ...this.state,
      dakaList: [],
      discoverList: [],
      start: 0,
      pageDataStatus: 'again',
      morePage: true,
    }
  }

  loginBtnClick = () => {
    this.loginBtn.login()
  }

  goIndex = () => {
    redirectTo({
      url: 'pages/index/index'
    })
  }

  renderUnlogin = () => {
    const addTop = { marginTop: '40px' }

    return (
      <View className='discover'>
        <Image className='unlogin-img' src={UN_LOGIN_HBG} />
        <View className='discovery-text' style={addTop}>
          Hi，亲爱的朋友
        </View>
        <View className='discovery-text'>登录后可查看“我的打卡”</View>
        <View onClick={this.loginBtnClick} className='discovery-btn'>登录</View>
      </View>
    )
  }

  renderList = () => {
    const { pageDataStatus, dakaList } = this.state
    return (
      <View className="container">
        {dakaList.length
          ? (
            <View className='my-list-container'>
              {dakaList.map((item) => (
                <View
                  key={item.dakaId}
                  className='daka-card'
                  data={item}
                  onClick={this.goIndex}
                >
                  {item.dakaName}
                </View>
              ))}
              <ListLoading
                listStatus={pageDataStatus}
                onRefresh={this.fetMyDakaList}
                isAlwaysLoading
              />
              {pageDataStatus === 'end-to-discover' && (
                <View className='to-discover-btn' onClick={this.toDiscover}>{'报名更多打卡培养好习惯 >'}</View>
              )}
              <View className='bottom-logo-ctn'>
                <Image className='bottom-logo' src='https://n1image.hjfile.cn/res7/2019/02/12/6ba54efb31f4e1dd30d500e6865a10a3.png' />
              </View>
            </View>
          ) : (
            <View className='discover'>
              <View className='discovery-text'>你暂时没有已报名的打卡哦～</View>
              <View onClick={this.toDiscover} className='discovery-btn'>去发现</View>
            </View>
          )
        }
      </View>
    )
  }


  render() {
    const { isLogin } = this.props
    const { pageLoading, pageDataStatus } = this.state
  
    return (
      <PageWrapper status={pageLoading ? 'loading' : 'done'}>
        {
          pageDataStatus === 'doing'
            ? this.renderList()
            : (
              pageDataStatus !== 'done' && !isLogin
                ? this.renderUnlogin()
                : this.renderList()
            )
        }
        <LoginBtn
          ref={this.loginBtnRef}
        />
      </PageWrapper>
    )
  }

}

export default MyDaka