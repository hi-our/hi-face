import Taro from '@tarojs/taro';
import { View, Block } from '@tarojs/components';

import './styles.styl'


export default class FlyModal extends Taro.Component {
  static defaultProps = {
    visible: false,
    title: '',
    setVisible: () => { },
    position: 'center',
    footerText: 'OK'
  }

  render() {
    const {
      title,
      visible,
      setVisible,
      footerText,
      position
    } = this.props

    if (!visible) return <Block></Block>

    return (
      <View 
        className={`pop-dialog ${position === 'bottom' ? 'pop-dialog-bottom' : ''}`}
      >
        <View className="pop-mask" onClick={() => {
          setVisible()
        }}
        ></View>
        <View className="pop-main">
          <View className="pop-title">{title}</View>
          <View className="pop-body">
            {this.props.children}
          </View>
          <View className="pop-footer" onClick={() => {
            setVisible()
          }}
          >
            {footerText}
          </View>
        </View>

      </View>
    )
  }
}