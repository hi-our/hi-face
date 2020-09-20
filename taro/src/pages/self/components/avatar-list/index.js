import Taro from '@tarojs/taro'
import { View, Block, Image } from '@tarojs/components'
import { cloudCallFunction } from 'utils/fetch'
import PageStatus from 'components/page-status'


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
      listStatus: 'loading',
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

      if (pageNo === 1 && items.length === 0) {
        this.setState({
          listStatus: 'empty',
          errorText: '数据为空'
        })
        return
      }

      this.setState({
        list: items,
        listStatus: 'done'
      })

    } catch (error) {
      this.setState({
        listStatus: 'error',
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
    const { list, listStatus, errorText } = this.state
    console.log('listStatus :>> ', listStatus);
    return (
      <Block>

        {
          listStatus === 'loading' && (
            <PageStatus status='loading' />
          )
        }
        {
          listStatus === 'empty' && (
            <View>
              <Image className="logo-image" src="https://image-hosting.xiaoxili.com/img/img/20200830/41eb7adb16c09f5b25137fe708269e12-11e1fa.png"></Image>
              <View className="empty-text">长官，快去做你的第一个头像吧</View>
            </View>
          )
        }
        {
          listStatus === 'done' && (
            <View className="list" scrollY>
              {
                list.filter(item => item.avatarFileID).map((item) => {
                  const { uuid, avatarFileID } = item
                  return (
                    <View key={uuid} className="avatar-item" data-uuid={uuid} onClick={this.goOneAvatar.bind(this, uuid)}>
                      <Image className="avatar-image" src={avatarFileID} lazyLoad></Image>
                    </View>
                  )
                })
              }
            </View>
          )
        }
      </Block>
    )
  }

}