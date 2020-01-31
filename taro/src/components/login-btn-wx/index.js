import Taro from '@tarojs/taro'
import { Block, View, Form, Button, Text, Input, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { getPassSdk, Toast, $bi, getCurPage } from 'utils/common'
import userActions, { modelName as userModel } from '@/store/user'
import EventEmitter from 'utils/event-emitter'
import { navigateTo } from 'utils/navigate'
import { LOGIN_STATUS } from 'constants/status'
import errorHandler from './utils/errorHandler'
import MD5 from './utils/md5'

import './styles.styl'

let smsInter = null // 登录时间倒计时
const showPasswordPic =
  'https://n1image.hjfile.cn/res7/2019/05/27/f04b77db9985bbe76bef21e28cf112b6.png'
const hidePasswordPic =
  'https://n1image.hjfile.cn/res7/2019/05/27/b12496679d73f83a3eba58ff5af9daf2.png'


@connect(state => ({
  loginStatus: state[userModel].loginStatus,
  isLogin: state[userModel].loginStatus === LOGIN_STATUS.SUCCESS,
  userInfo: state[userModel].userInfo,
}))
class ComLoginBtn extends Taro.Component {
  config = {
    component: true
  }

  static defaultProps = {
    onStopLogin: () => { },
    onSuccess: () => { },
    dialogName: ''
  }

  constructor(props) {
    super(props)

    this.externalClasses = ['btn-default']

    this.state = {
      showLoginBox: false,
      isChina: true,
      country: {
        focus: false,
        value: '86',
        error: false
      },
      mobile: {
        focus: false,
        value: '',
        error: false
      },
      vcode: {
        focus: false,
        value: '',
        error: false
      },
      account: {
        focus: false,
        value: '',
        error: false
      },
      password: {
        focus: false,
        value: '',
        error: false
      },
      captcha: {
        focus: false,
        value: '',
        error: false
      },
      smsSending: false,
      smsRestTime: 60,
      loginStatus: 'phone',
      isLoading: false,
      isPassword: true,
      showPasswordPic,
      hidePasswordPic,
      showCaptcha: false,
      errorMsg: {},
      captchaUrl: '',
      captchaToken: ''
    }
  }

  componentDidMount() {
    const { userInfo } = this.props
    Taro.getSetting().then(res => {
      this.setState({
        authorized: res.authSetting['scope.userInfo'] || false
      })
    })
    if (userInfo) {
      const { isChina } = userInfo
  
      this.setState({
        isChina
      })
    }
    this.updateCaptcha()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLogin && !this.props.isLogin) {
      const { userInfo } = this.props
      this.setState({
        isChina: userInfo.isChina,
      })
    }
  }

  getPhone = e => {
    const { errMsg } = e.detail
    const { userInfo } = this.props
    const { bind, isBindMobile } = userInfo
    // 点击按钮场景
    this.setState({
      loginScene: 'phone'
    })
    // 用户拒绝
    if (/(fail|cancel|deny)/gi.test(errMsg)) {
      $bi({
        name: 'phoneAuthority',
        data: {
          option: 'no'
        }
      })
      this.setState({
        showDialog: true,
        showChoice: false
      })
      return
    }
    if (bind && !isBindMobile) {
      // 绑定账号 但是未绑定手机号
      getPassSdk().useWxBindMobile(
        e.detail,
        ({ status, data }) => {
          if (status === 0) {
            const { bindMobileResult, clubAuth, wxClubAuth } = data
            $bi({ name: 'SignIn_WX' })
            this.handleSuccess(bindMobileResult ? wxClubAuth : clubAuth)
          }
        },
        () => {
          Toast('微信绑定账号失败！')
        }
      )
      return
    }
    // 注册成功 cc账号成功并登录
    getPassSdk().useWxQuickLogin(
      e.detail,
      ({ status, data }) => {
        if (status === 0) {
          this.handleSuccess(data.clubAuth)
        }
      },
      () => {
        Toast('登录失败了')
      }
    )
  }

  userInfoLogin = e => {
    const { errMsg } = e.detail
    if (/(fail|deny)/gi.test(errMsg)) return
    // 授权用户信息
    this.setState({
      authorized: true,
      loginScene: 'userInfo'
    })

    getPassSdk().userInfoLogin(
      e.detail,
      ({ status, data }) => {
        if (status === 0) {
          const { openid: openId, isChina, bind, isBindMobile, clubAuth } = data
          userActions.setLoginInfo({
            userInfo: {
              openId,
              isChina,
              bind,
              isBindMobile
            } 
          })
          // 如果拿到是海外的
          if (!data.isChina) {
            $bi({ name: 'SignIn_WX_foreign' })
          }

          // 已经绑定手机号 可以直接登录(绑定手机号 一定有沪江账号)
          if (data.isBindMobile) {
            userActions.setLoginInfo({
              userInfo: {
                clubAuth
              }
            })
            // 处理登录成功的回调
            $bi({ name: 'SignIn_WX' })
            this.handleSuccess(clubAuth)
            return false
          }
          this.setState({
            showChoice: true,
            showDialog: false
          })
        }
      },
      () => {
        Toast('用户微信授权信息登录失败！')
      }
    )
  }

  handleSuccess = clubAuth => {
    const curPage = getCurPage() || {}
    // TODO loginScene 在 store中修改的时间
    setTimeout(() => {
      userActions.loginSuccessEmitter(LOGIN_STATUS.SUCCESS)
    }, 100);
    userActions.setLoginInfo({
      loginStatus: LOGIN_STATUS.SUCCESS,
      userInfo: {
        clubAuth,
        loginScene: this.state.loginScene,
        loginPageName: curPage.route,
      }
    })
    Taro.setStorageSync('ClubAuth', clubAuth)
    this.setState({
      showLoginBox: false,
      showDialog: false,
      showChoice: false
    })
    this.triggerSuccess()
  }

  /**
   * 调用外界登录成功
   */
  triggerSuccess = () => {
    const { loginScene } = this.state
    // 默认处理
    this.props.onSuccess({ loginScene })
    wx.bisdk && wx.bisdk.resetClubAuth && wx.bisdk.resetClubAuth()
    this.hiddenLoginBox()
    return Promise.resolve()
  }

  /**
   * 收集formId
   */
  formSubmit = e => {
    const { formId } = e.detail
    EventEmitter.put('formIds', formId)
  }

  login = ({ type = 'login' } = {}) => {
    if (this.props.isLogin && type !== 'switch') {
      const { userInfo } = this.props
      this.handleSuccess(userInfo.clubAuth)
      return true
    }
    this.showLoginBox(type)
  }

  showLoginBox = type => {
    this.setState({
      showLoginBox: true,
      type
    })
  }

  hiddenLoginBox = () => {
    this.props.onStopLogin()
    this.setState({
      showLoginBox: false
    })
  }

  // 手机号登录cc的弹窗

  input = e => {
    const { value } = e.detail
    const { name } = e.target.dataset

    const stateValue = { ...this.state[name] }
    stateValue.value = value.trim()

    if (this.state[name].error) {
      stateValue.error = false
    }

    this.setState({ [name]: stateValue })
  }

  focus = e => {
    const { name } = e.target.dataset

    const stateValue = { ...this.state[name] }
    stateValue.focus = true

    this.setState({ [name]: stateValue })
  }

  blur = e => {
    const { name } = e.target.dataset

    const stateValue = { ...this.state[name] }
    stateValue.focus = false

    this.setState({ [name]: stateValue })

    if (name === 'mobile') {
      stateValue.error = !/^\d{5,15}$/.test(this.state[name].value)
      this.setState({ [name]: stateValue })
    }
    if (name === 'country') {
      stateValue.error = this.state[name].value.length > 3
      this.setState({ [name]: stateValue })
    }
  }

  goRules = () => {
    navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(
        'https://pass.cctalk.com/m/agreement?noTitle=true'
      )}`
    })
  }

  /**
   * 显示默默人登录框
   * @createTime          2018-06-26T09:39:45+0800
   */
  toggleDialog = () => {
    if (this.state.showDialog) {
      this.props.onStopLogin()
    }
    this.setState(
      {
        showDialog: !this.state.showDialog,
        showChoice: false,
        smsSending: false,
        smsRestTime: 60
      },
      () => {
        smsInter && clearTimeout(smsInter)
      }
    )
  }

  /**
   * 获取微信头像后的信息提示
   */
  toggleChoice = () => {
    if (!this.state.showChoice) {
      $bi({ name: 'SignIn_CC' })
    }
    this.setState({
      showChoice: !this.state.showChoice,
      showDialog: false
    })
  }
  /**
   * 按钮点击登录
   * @createTime          2018-04-16T18:30:06+0800
   */
  loginClick = () => {
    const { mobile, country, vcode } = this.state
    const { userInfo } = this.props
    const { bind, isBindMobile } = userInfo

    const mobileNumber =
      country.value === '86' ? mobile.value : `+${country.value}${mobile.value}`

    // 都为空
    if (!mobile.value || !vcode.value || !country.value) {
      const stateVcode = { ...this.state.vcode }
      const stateMobile = { ...this.state.mobile }
      const stateCountry = { ...this.state.country }
      stateVcode.error = !vcode.value
      stateMobile.error = !mobile.value
      stateCountry.error = !country.value

      this.setState({
        vcode: stateVcode,
        mobile: stateMobile,
        country: stateCountry
      })
      return
    }
    // 手机号码或者验证码出错
    if (mobile.error || country.error) return

    // 记录登录场景值
    this.setState({
      loginScene: 'dialog'
    })
    // 有绑定CC账号
    if (bind && !isBindMobile) {
      getPassSdk().smsBindMobile(
        {
          mobile: mobileNumber,
          smsCode: vcode.value
        },
        ({ status, data: { bindMobileResult, clubAuth, wxClubAuth } }) => {
          if (status === 0) {
            $bi({ name: 'SignIn_CC_Completely' })
            this.handleSuccess(bindMobileResult ? wxClubAuth : clubAuth)
          }
        },
        () => {
          const stateVcode = { ...this.state[vcode] }
          stateVcode.error = true
          // 动态码出错
          this.setState({
            vcode: stateVcode
          })
        }
      )
      return
    }
    // 短信快速登录注册
    getPassSdk().smsQuickLogin(
      {
        mobile: mobileNumber,
        smsCode: vcode.value
      },
      ({ status, data: { clubAuth } }) => {
        if (status === 0) {
          $bi({ name: 'SignIn_CC_Completely' })
          this.handleSuccess(clubAuth)
        }
      },
      () => {
        const stateVcode = { ...this.state[vcode] }
        stateVcode.error = true
        // 动态码出错
        this.setState({
          vcode: stateVcode
        })
      }
    )
  }

  updateCaptcha = () => {
    getPassSdk().getImageCatpcha(
      this,
      ({ data: { img, token } }) => {
        this.setState({
          captchaUrl: img,
          captchaToken: token
        })
      },
      () => {}
    )
  }

  accountLogin = () => {
    $bi({ name: 'login_account_ok' })

    const { account, password, captcha, captchaToken } = this.state
    this.setState({
      isLoading: true
    })

    // 都为空
    if (!account.value || !password.value) {
      this.setState({
        account: {
          ...account,
          error: !account.value
        },
        password: {
          ...password,
          error: !password.value
        },
        isLoading: false
      })
      return
    }
    // 账户或者密码出错
    if (account.error || password.error) {
      this.setState({
        isLoading: false
      })
      return
    }
    const loginData = {}
    loginData.username = account.value
    loginData.password = MD5(password.value)
    loginData.isapp = true
    loginData.imgcode = captcha.value || '111111'
    loginData.token = captchaToken
    getPassSdk().accountLogin(
      loginData,
      res => {
        this.setState({
          isLoading: false
        })
        if (res.data) {
          const clubAuth = res.data.Cookie
          this.handleSuccess(clubAuth)

          getPassSdk().bind(
            { clubAuth },
            bindData => {
              console.log('sucBind', bindData)
            },
            bindData => {
              console.log('failBind', bindData)
            }
          )
        }
      },
      err => {
        this.setState({
          isLoading: false
        })
        errorHandler.init(err.data, this, 'errorMsg', () => {}, () => {})
        console.log('err', err)
      }
    )
  }

  /**
   * 发送短信验证码
   */
  sendSMS = () => {
    const { mobile, country, smsSending } = this.state

    if (mobile.error || mobile.error || smsSending) return

    const mobileNumber =
      country.value === '86' ? mobile.value : `+${country.value}${mobile.value}`
    getPassSdk().sendSMS(
      {
        mobile: mobileNumber
      },
      () => {
        this.setState(
          {
            smsSending: true
          },
          () => {
            smsInter = setInterval(() => {
              let { smsRestTime } = this.state
              this.setState(
                {
                  smsRestTime: --smsRestTime
                },
                () => {
                  if (this.state.smsRestTime === 0) {
                    this.setState({
                      smsSending: false,
                      smsRestTime: 60
                    })
                    clearInterval(smsInter)
                  }
                }
              )
            }, 1000)
          }
        )
      },
      ({ data }) => {
        const {
          data: { Message }
        } = data
        Taro.showToast({
          title: Message || '出错了请稍后再试！',
          icon: 'none',
          duration: 1500
        })
        smsInter && clearInterval(smsInter)
      }
    )
  }

  switchLogin = (e) => {
    $bi({ name: 'login_account' })
    const { type } = e.target.dataset
    type === 'phone'
      ? this.setState({ loginStatus: 'account' })
      : this.setState({ loginStatus: 'phone' })
  }

  switchPassword = () => {
    const { isPassword } = this.state
    this.setState({ isPassword: !isPassword })
  }

  renderLoginDialog() {
    const {
      showDialog,
      country,
      mobile,
      vcode,
      smsSending,
      smsRestTime,
      loginStatus,
      account,
      isPassword,
      password,
      captcha,
      captchaUrl,
      showCaptcha,
      isLoading,
    } = this.state

    return (
      <View className={'login-container ' + (showDialog ? 'fadeIn' : '')}>
        <View className='login-inner'>
          <View className='bg' />
          {loginStatus === 'phone' ? (
            <Block>
              <View className='login-form'>
                <View className='form-tit'>手机快速登录</View>
                <View className='form-group'>
                  <Input
                    className={
                      'border country ' +
                      (country.focus ? 'focus' : '') +
                      ' ' +
                      (country.error ? 'error' : ' ')
                    }
                    type='number'
                    value='86'
                    data-name='country'
                    placeholder=''
                    placeholderClass='placeholder'
                    onFocus={this.focus}
                    onBlur={this.blur}
                    onInput={this.input}
                    adjustPosition='true'
                  />
                  <Input
                    className={
                      'border mobile ' +
                      (mobile.focus ? 'focus' : '') +
                      ' ' +
                      (mobile.error ? 'error' : ' ')
                    }
                    type='number'
                    data-name='mobile'
                    placeholder='请输入手机号码'
                    placeholderClass='placeholder'
                    onFocus={this.focus}
                    onBlur={this.blur}
                    onInput={this.input}
                    adjustPosition='true'
                  />
                  {mobile.error && (
                    <View className='error-tip'>手机号码格式错误</View>
                  )}
                </View>
                <View className='form-group'>
                  <Input
                    type='number'
                    className={
                      'border code ' +
                      (vcode.focus ? 'focus' : '') +
                      ' ' +
                      (vcode.error ? 'error' : '')
                    }
                    data-name='vcode'
                    placeholder='请输入验证码'
                    placeholderClass='placeholder'
                    onFocus={this.focus}
                    onBlur={this.blur}
                    onInput={this.input}
                    adjustPosition='true'
                  />
                  {!smsSending ? (
                    <View className='border sms-btn' onClick={this.sendSMS}>
                      获取动态码
                    </View>
                  ) : (
                    <View
                      className='border sms-btn disabeld'
                      onClick={this.sendSMS}
                    >
                      {'重新发送 (' + smsRestTime + 's)'}
                    </View>
                  )}
                  {vcode.error && <View className='error-tip'>动态码错误</View>}
                </View>
                <Button
                  className='login-btn'
                  type='default'
                  onClick={this.loginClick}
                >
                  马上登录
                </Button>
                <View
                  className='other-login'
                  onTap={this.switchLogin}
                  data-type='phone'
                >
                  其他方式登录 &gt;
                </View>
                <View className='tips'>
                  登录即同意
                  <View className='rule' onClick={this.goRules}>
                    CCtalk《用户协议》
                  </View>
                </View>
              </View>
            </Block>
          ) : (
            loginStatus === 'account' && (
              <Block>
                <View className='login-form'>
                  <Image
                    className='back-icon'
                    src='https://n1image.hjfile.cn/res7/2019/05/27/45701e39023edffeac8011372b5be961.png'
                    data-type='account'
                    onTap={this.switchLogin}
                  />
                  <View className='form-tit'>账号登录</View>
                  <View className='form-group'>
                    <Input
                      className={
                        'border account ' +
                        (account.focus ? 'focus' : '') +
                        ' ' +
                        (account.error ? 'error' : ' ')
                      }
                      data-name='account'
                      placeholder='手机号/邮箱/用户名'
                      placeholderClass='placeholder'
                      onFocus={this.focus}
                      onBlur={this.blur}
                      onInput={this.input}
                      adjustPosition='true'
                    />
                    {account.error && (
                      <View className='error-tip'>请输入正确的帐号</View>
                    )}
                  </View>
                  <View className='form-group'>
                    <Image
                      className='password-icon'
                      src={!isPassword ? showPasswordPic : hidePasswordPic}
                      onTap={this.switchPassword}
                    />
                    <Input
                      password={isPassword}
                      className={
                        'border account-password ' +
                        (password.focus ? 'focus' : '') +
                        ' ' +
                        (password.error ? 'error' : '')
                      }
                      maxlength='20'
                      data-name='password'
                      placeholder='请输入密码'
                      placeholderClass='placeholder'
                      onFocus={this.focus}
                      onBlur={this.blur}
                      onInput={this.input}
                      adjustPosition='true'
                    />
                    {password.error && (
                      <View className='error-tip'>请输入正确的密码</View>
                    )}
                  </View>
                  {showCaptcha && (
                    <View className='form-group captcha-group'>
                      <Input
                        className={
                          'border account-captcha ' +
                          (captcha.focus ? 'focus' : '') +
                          ' ' +
                          (captcha.error ? 'error' : '')
                        }
                        maxlength='20'
                        data-name='captcha'
                        placeholder='请输入验证码'
                        placeholderClass='placeholder'
                        onFocus={this.focus}
                        onBlur={this.blur}
                        onInput={this.input}
                        adjustPosition='true'
                      />
                      <Image
                        className='captcha-icon'
                        src={'https:' + captchaUrl}
                        onClick={this.updateCaptcha}
                      />
                      {captcha.error && (
                        <View className='error-tip'>请输入图片验证码</View>
                      )}
                    </View>
                  )}
                  <Button
                    className='login-btn'
                    type='default'
                    onClick={this.accountLogin}
                  >
                    {isLoading ? '加载中' : '登录'}
                  </Button>
                  <View className='tips'>
                    登录即同意
                    <View className='rule' onClick={this.goRules}>
                      CCtalk《用户协议》
                    </View>
                  </View>
                </View>
              </Block>
            )
          )}
          <View className='close-btn' onClick={this.toggleDialog} />
        </View>
      </View>
    )
  }

  renderChoice() {
    const { showChoice } = this.state

    return (
      <View className={'login-tips ' + (showChoice ? 'fadeIn' : '')}>
        <View className='shadow' onClick={this.toggleChoice} />
        <View className='box'>
          <View className='bg' />
          <View className='close' onClick={this.toggleChoice} />
          <View className='container'>
            <View className='text'>
              还差最后一步鸭，应国家政策要求需强化实名制认证，请授权手机号进行登录
            </View>
            <Button
              className='btn'
              openType='getPhoneNumber'
              onGetphonenumber={this.getPhone}
            >
              <Text className='txt'>去授权</Text>
            </Button>
          </View>
        </View>
      </View>
    )
  }

  render() {
    const {
      showLoginBox,
      type,
      authorized,
      showDialog,
      showChoice
    } = this.state
    const { isLogin } = this.props

    return (
      <Block>
        {showLoginBox && (
          <View className={'login-box  ' + (showLoginBox ? 'fadeIn' : '')}>
            <View className='shadow' onTap={this.hiddenLoginBox} />
            <View className='box-wrap'>
              <View className='title'>
                {type === 'switch' ? '切换账号' : '请登录'}
              </View>
              <View className='tip-txt'>
                {type === 'switch'
                  ? '更换后，打卡以及奖励记录等'
                  : '嘎嘎~为了保持并同步您的打卡记录'}
              </View>
              <View className='tip-txt margin-bottom'>
                {type === 'switch'
                  ? '将更新为切换后的账号'
                  : '请通过以下方式登录'}
              </View>
              <View
                className='useCCLoginBtn  login-btn'
                onTap={this.toggleDialog}
              >
                CCtalk账号登录
              </View>
              <Form onSubmit={this.formSubmit} reportSubmit>
                {isLogin ? (
                  <Button
                    formType='submit'
                    className='btn-default new-user'
                    openType='getPhoneNumber'
                    onGetphonenumber={this.getPhone}
                  >
                    <View className='login-btn'>我是新用户</View>
                  </Button>
                ) : (
                  <Button
                    formType='submit'
                    className='btn-default new-user'
                    openType={authorized ? 'getPhoneNumber' : 'getUserInfo'}
                    onGetuserinfo={this.userInfoLogin}
                    onGetphonenumber={this.getPhone}
                  >
                    <View className='login-btn'>我是新用户</View>
                  </Button>
                )}
              </Form>
              <View className='tip-txt'>
                登录即同意
                <Text className='rule' onClick={this.goRules}>
                  《CCtalk用户协议》
                </Text>
              </View>
              <View className='tip-txt'>本产品由CCtalk平台运营</View>
            </View>
            {showDialog && this.renderLoginDialog()}
            {showChoice && this.renderChoice()}
          </View>
        )}
      </Block>
    )
  }
}
export default ComLoginBtn