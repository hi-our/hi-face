import Taro from '@tarojs/taro';
import { View, Block } from '@tarojs/components';

import './styles.styl'


export default class PopDialog extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    visible: false,
    title: '',
    setVisible: () => { },
    position: 'center',
    footerText: 'OK'
  }

  onClose = () => {
    const { setVisible } = this.props
    setVisible()
  }
  render() {
    const {
      title,
      visible,
      footerText,
      position
    } = this.props

    if (!visible) return <Block></Block>

    return (
      <View 
        className={`pop-dialog ${position === 'bottom' ? 'pop-dialog-bottom' : ''}`}
      >
        <View className="pop-mask" onClick={this.onClose}></View>
        <View className="pop-main">
          <View className="pop-title">{title}</View>
          <View className="pop-body">
            {this.props.children}
          </View>
          <View className="pop-footer" onClick={this.onClose}>
            {footerText}
          </View>
        </View>

      </View>
    )
  }
}