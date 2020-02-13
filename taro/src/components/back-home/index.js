import React from 'react'
import { Block, View } from '@tarojs/components'
import './styles.styl'

export default class BackHome extends React.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    styles: '',
  }

  constructor(props) {
    super(props)
    this.state = {
      showBtn: true
    }
  }

  componentDidMount() {
    const showBtn = Taro.getStorageSync('showBackToIndexBtn')
    this.setState({
      showBtn
    })
  }

  toIndexPage = () => {
    Taro.switchTab({
      url: '/pages/my-daka/my-daka'
    })
  }

  render() {
    const { styles } = this.props
    const { showBtn } = this.state

    if (showBtn) {
      return <View className='to-index-btn' onClick={this.toIndexPage} style={styles} />
    }

    return <Block />
  }
}
