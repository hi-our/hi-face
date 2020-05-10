import Taro from '@tarojs/taro'
import { Block, View, Image } from '@tarojs/components'


import './styles.styl'

export const setTmpThis = (el, elState) => {
  const {
    shapeWidth,
    shapeCenterX,
    shapeCenterY,
    resizeCenterX,
    resizeCenterY,
    rotate
  } = elState

  el.shape_width = shapeWidth
  el.shape_center_x = shapeCenterX;
  el.shape_center_y = shapeCenterY;
  el.resize_center_x = resizeCenterX;
  el.resize_center_y = resizeCenterY;

  el.rotate = rotate;

  el.touch_target = '';
  el.touch_shape_index = -1;

}

export default class ShapeEdit extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    cutImageSrc: '',
    shapeListOut: [],
  }

  constructor(props) {
    super(props)
    const { shapeListOut } = this.props
    this.state = {
      shapeList: shapeListOut,
      currentShapeIndex: -1
    }

  }
  
  componentDidMount() {
    const { shapeList } = this.state
    if (shapeList.length) {
      // TODO 这个方法要优化
      setTmpThis(this, shapeList[0])
    }
  }

  render() {
    const { cutImageSrc } = this.props
    const { shapeList, currentShapeIndex } = this.state

    return (
      <Block>
        <View
          className='image-wrap'
          onTouchStart={this.touchStart}
          onTouchMove={this.touchMove}
          onTouchEnd={this.touchEnd}
        >
          <Image
            src={cutImageSrc}
            mode='widthFix'
            className='image-selected'
          />
          {
            shapeList.map((shape, shapeIndex) => {

              const {
                categoryName,
                shapeWidth,
                currentShapeId,
                timeNow,
                shapeCenterX,
                shapeCenterY,
                resizeCenterX,
                resizeCenterY,
                reserve,
                rotate
              } = shape

              let transX = shapeCenterX - shapeWidth / 2 - 2 + 'rpx'
              let transY = shapeCenterY - shapeWidth / 2 - 2 + 'rpx'

              let shapeStyle = {
                width: shapeWidth + 'rpx',
                height: shapeWidth + 'rpx',
                transform: `translate(${transX}, ${transY}) rotate(${rotate + 'deg'})`,
                zIndex: shapeIndex === currentShapeIndex ? 2 : 1
              }

              let shapeImageStyle = {
                transform: `scale(${reserve}, 1)`,
              }

              return (
                <View className='shape-container' key={timeNow} style={shapeStyle}>
                  {/* <Image className="shape" data-type='shape' data-shape-index={shapeIndex} src={require(`../../../images/${categoryName}-${currentShapeId}.png`)} style={shapeImageStyle} /> */}
                  {
                    currentShapeIndex === shapeIndex && (
                      <Block>

                        <View className='image-btn-remove' data-shape-index={shapeIndex} onClick={this.removeShape}></View>
                        <View className='image-btn-resize' data-shape-index={shapeIndex} data-type='rotate-resize'></View>
                        <View className='image-btn-reverse' data-shape-index={shapeIndex} onClick={this.reverseShape}></View>
                        <View className='image-btn-checked' data-shape-index={shapeIndex} onClick={this.checkedShape}></View>
                      </Block>
                    )
                  }
                </View>
              )
            })
          }
        </View>
      </Block>
    )
    
  }
}