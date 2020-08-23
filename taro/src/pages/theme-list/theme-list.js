import Taro, { Component } from '@tarojs/taro'
import { View, Image, Canvas } from '@tarojs/components'
import CustomTabBar from 'components/custom-tab-bar'
import { cloudCallFunction } from 'utils/fetch'

export default class ThemeList extends Component {
  config = {
    navigationBarTitleText: '主题列表',
  }
  constructor(props) {
    super(props)
    this.state = {
      themeList: [],
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
        name: 'api',
        data: {
          $url: 'theme/list',
          pageSize: 50,
        }
      })

      console.log('data.length :', items.length);

      if (pageNo === 1 &&  items.length === 0) {
        this.setState({
          pageStatus: 'empty',
          errorText: '数据为空'
        })
        return
      }

      console.log('items :>> ', items);
      this.setState({
        themeList: items,
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
  render() {
    return (
      <View>
        <CustomTabBar selected={0} />
      </View>
    )
  }
}