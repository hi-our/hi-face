import Taro from '@tarojs/taro'
import { View, ScrollView, Image } from '@tarojs/components'
import { cloudCallFunction } from 'utils/fetch'
import { imageThumb } from 'utils/common';

import './styles.styl'

export default class ThemeDetail extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    themeId: 0,
    themeData: {},
    onSwitch: () => {}
  }

  constructor(props) {
    super(props)
    this.state = {
      shapeCategoryList: []
    }
  }

  componentDidMount() {
    const { themeId } = this.props
    if (themeId) {
      cloudCallFunction({
        name: 'hiface-api',
        data: {
          $url: 'theme/get',
          themeId,
          needShapes: true
        }
      }).then(res => {
        const { shapeCategoryList = [] } = res
        if (shapeCategoryList.length > 0) {
          this.setState({
            shapeCategoryList
          })

        }
      }).catch(error => console.log('error >> ', error))
    }
  }

  onSwitch = () => {
    const { onSwitch, themeId } = this.props
    onSwitch(themeId)
  }

  render() {
    const { themeData } = this.props
    const { shapeCategoryList } = this.state
    const { shareImageUrl, shareTitle, shareDesc, themeName } = themeData

    return (
      <ScrollView className="theme-scroll" scrollY>
        <View className="theme-item" onClick={this.onSwitch}>
          <View className="theme-header">
            <View className="theme-main">
              <View className="share-title">{shareTitle}</View>
              <View className="share-desc">{shareDesc}</View>
            </View>
            <Image className="theme-cover" src={imageThumb(shareImageUrl, 280, 280)} lazyLoad />
          </View>
          <View className="theme-title">
            {themeName}贴纸
          </View>
          <View className="theme-wrap">
            {
              shapeCategoryList.map((category) => {
                const { _id: categoryId, categoryName, shapeList = [] } = category
                let showList = shapeList.filter((item, index) => index < 4)
                return (
                  <View key={categoryId} className='category-item'>
                    <View className='shape-list'>
                      {
                        showList.map((shape) => {
                          const { _id: shapeId, imageUrl } = shape
                          return (
                            <Image className='shape-item' key={shapeId} src={imageThumb(imageUrl, 100, 100)} lazyLoad />
                          )
                        })
                      }
                    </View>
                    <View className='category-hd'>{categoryName}</View>
                  </View>
                )
              })
            }
          </View>

        </View>
      </ScrollView>
    )
  }
}