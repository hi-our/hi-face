import Taro from '@tarojs/taro';
import { View, Modal } from '@tarojs/components';


export default class FlyModal extends Taro.Component {
  render() {
    const { title,
      content,
      visible,
      setVisible
    } = this.props

    return (
      <View
        visible={visible}
        transparent
        maskClosable={false}
        title={title}
        style={{
          width: '90%'
        }}
        footer={[{ text: 'Ok', onPress: () => { setVisible() } }]}
        onClose={() => {
          setVisible()
        }}
      >
        <View>
          {content}
        </View>
      </View>
    )
  }
}