import Taro from '@tarojs/taro'
import { View, ScrollView, Image } from '@tarojs/components'
import { cloudCallFunction } from 'utils/fetch'

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
        name: 'api',
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
    const { coverImageUrl, shareTitle, shareDesc } = themeData

    return (
      <ScrollView className="theme-scroll" scrollY>
        <View className="theme-item" onClick={this.onSwitch}>
          <View className="theme-header">
            <Image className="theme-cover" src={coverImageUrl} />
            <View className="theme-main">
              <View className="share-title">{shareTitle}</View>
              <View className="share-desc">{shareDesc}</View>
            </View>
          </View>
          <View className="theme-wrap">
            {
              shapeCategoryList.map((category) => {
                const { _id: categoryId, categoryName,  categoryImageUrl, shapeList } = category
                return (
                  <View key={categoryId} className='category-item'>
                    <View className='category-hd'>
                      <Image className='category-image' src={categoryImageUrl}></Image>
                      <View>{categoryName}</View>

                    </View>
                    <View className='shape-list'>
                      {
                        shapeList.map((shape) => {
                          const { _id: shapeId, imageUrl } = shape
                          return (
                            <Image className='shape-item' key={shapeId} src={imageUrl} />
                          )
                        })
                      }
                    </View>
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