import Taro from '@tarojs/taro'
import { View, Image, ScrollView } from '@tarojs/components'

import './styles.styl'

export default class ImageChoose extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    categoryList: [],
    chooseShape: () => {}
  }
  

  constructor(props) {
    super(props)
    this.state = {
      currentTabIndex: 0
    }
  }


  chooseTab = (tabIndex) => {
    this.setState({
      currentTabIndex: tabIndex
    })
  }

  render() {
    const { categoryList, chooseShape } = this.props
    const { currentTabIndex } = this.state

    return (
      <View className='tab-wrap'>
        <ScrollView className="tab-hd" scrollX enableFlex>
          {
            categoryList.map((item, itemIndex) => {
              const { _id, categoryName } = item
              return (
                <View
                  key={_id}
                  className={`tab-hd-item ${currentTabIndex === itemIndex ? 'tab-hd-active' : ''}`}
                  onClick={this.chooseTab.bind(this, itemIndex)}
                >
                  {
                    categoryName
                  }
                </View>
              )
            })
          }
        </ScrollView>
        <View className='tab-bd'>
          {
            categoryList.map((item, itemIndex) => {
              return (
                <View key={item.name} style={{ display: currentTabIndex === itemIndex ? ' block' : 'none' }}>
                  <ScrollView className="shape-select-wrap" scrollX>
                    {
                      item.shapeList.map((shapeItem) => {
                        const { imageUrl, _id: shapeId } = shapeItem 
                        return (
                          <View className='tab-bd-image-wrap' key={shapeId}>
                            {
                              currentTabIndex === itemIndex && (
                                <Image
                                  className='tab-bd-image'
                                  src={imageUrl}
                                  onClick={() => chooseShape({ ...shapeItem, shapeId })}
                                />
                              )
                            }
                          </View>
                        )
                      })
                    }
                  </ScrollView>
                </View>
              )
            })
          }
        </View>

      </View>
    )
  }
}