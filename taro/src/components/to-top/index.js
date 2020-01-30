import Taro from '@tarojs/taro'
import { Block, View } from '@tarojs/components'
import { getSystemInfo } from 'utils/common'
import './styles.styl'

export default class ToTop extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    scrollTop: 0,
    styles: '',
  }

  constructor(props) {
    super(props)
    const sysInfo = getSystemInfo()
    this.state = {
      showBtn: true,
      windowHeight: (sysInfo && sysInfo.windowHeight) || 642,
    }
  }

  toPageTop = () => {
    this.setState({ showBtn: false }, () => {
      Taro.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
      setTimeout(() => {
        this.show()
      }, 500)
    })
  }

  show = () => {
    this.setState({
      showBtn: true
    })
  }

  render() {
    const { styles, scrollTop } = this.props
    const { showBtn, windowHeight } = this.state

    if (scrollTop >= windowHeight && showBtn) {
      return <View className='to-top-btn' onClick={this.toPageTop} style={styles} />
    }

    return <Block />
  }
}
