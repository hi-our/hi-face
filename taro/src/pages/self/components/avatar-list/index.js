import Taro from '@tarojs/taro'
import { View, Block, Image } from '@tarojs/components'
import { cloudCallFunction } from 'utils/fetch';


import './styles.styl'

export default class AvatarList extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      pageStatus: 'loading',
      errorText: ''
    }
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async (pageNo = 1) => {
    try {
      const { items } = await cloudCallFunction({
        name: 'hiface-api',
        data: {
          $url: 'avatar/list',
          pageSize: 50,
        }
      })

      console.log('data.length :', items.length);

      if (pageNo === 1 && items.length === 0) {
        this.setState({
          pageStatus: 'empty',
          errorText: '数据为空'
        })
        return
      }

      this.setState({
        list: items,
        pageStatus: 'done'
      })

    } catch (error) {
      this.setState({
        pageStatus: 'error',
        errorText: '加载出错'
      })
      console.log('error :', error);

    }
  }

  goOneAvatar = (uuid) => {
    console.log('uuid :', uuid);
    Taro.navigateTo({
      url: `/pages/avatar-poster/avatar-poster?uuid=${uuid}`
    })
  }

  render() {
    const { list, pageStatus, errorText } = this.state
    return (
      <Block>
        <View className="list" scrollY>
          {
            list.filter(item => item.avatarFileID).map((item) => {
              const { uuid, avatarFileID } = item
              return (
                <View key={uuid} className="avatar-item" data-uuid={uuid} onClick={this.goOneAvatar.bind(this, uuid)}>
                  <Image className="avatar-image" src={avatarFileID}></Image>
                </View>
              )
            })
          }
        </View>
      </Block>
    )
  }

}