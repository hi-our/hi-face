import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';


export default class FlyModal extends Taro.Component {
  render() {
    const {
      title,
      visible,
      setVisible
    } = this.props

    return (
      <View
        // style={{ display: visible ? 'block' : 'none', width: '90%'}}
        visible={visible}
        transparent
        maskClosable={false}
        // footer={[{ text: 'Ok', onPress: () => { setVisible() } }]}
        
        onClose={() => {
          setVisible()
        }}
      >
        <View>{title}</View>
        <View>
          {this.props.children}
        </View>
      </View>
    )
  }
}