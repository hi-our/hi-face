import Taro from '@tarojs/taro'
import { Block, View, Image } from '@tarojs/components'
import { getRealRpx } from 'utils/canvas-drawing'

import './styles.styl'

const setTmpThis = (el, elState) => {
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

class ShapeEdit extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    cutImageSrc: '',
    shapeListOut: [],
    saveImageWidth: 600,
    defaultShapeSize: 200,
    onGenerateImage: () => {},
    onRemoveImage: () => {},
  }

  constructor(props) {
    super(props)
    const { shapeListOut } = this.props

    this.state = {
      shapeList: shapeListOut,
      currentShapeIndex: 0
    }

  }
  
  componentDidMount() {
    const { shapeList } = this.state
    if (shapeList.length) {
      // TODO 这个方法要优化
      setTmpThis(this, shapeList[0])
    }
  }

  getDefaultShape = () => {
    const { saveImageWidth, defaultShapeSize } = this.props

    return {
      shapeWidth: defaultShapeSize,
      timeNow: Date.now(),

      shapeCenterX: saveImageWidth / 2,
      shapeCenterY: saveImageWidth / 2,
      resizeCenterX: saveImageWidth / 2 + defaultShapeSize / 2 - 2,
      resizeCenterY: saveImageWidth / 2 + defaultShapeSize / 2 - 2,
      rotate: 0,
      reserve: 1
    }
  }

  chooseShape = ({ shapeId, imageUrl, imageReverseUrl }) => {
    let { shapeList, currentShapeIndex } = this.state
    console.log('shapeId, imageUrl :>> ', shapeId, imageUrl, currentShapeIndex);

    console.log('shapeId, imageUrl, imageReverseUrl :>> ', shapeId, imageUrl, imageReverseUrl);

    if (shapeList.length > 0 && currentShapeIndex >= 0) {
      shapeList[currentShapeIndex] = {
        ...shapeList[currentShapeIndex],
        shapeId,
        imageUrl,
        imageReverseUrl
      }
    } else {
      currentShapeIndex = shapeList.length
      shapeList.push({
        ...this.getDefaultShape(),
        shapeId: shapeId,
        imageUrl,
        imageReverseUrl
      })
    }
    this.setState({
      shapeList,
      currentShapeIndex
    })
  }

  removeShape = (e) => {
    const { shapeIndex = 0 } = e.target.dataset
    const { shapeList } = this.state
    shapeList.splice(shapeIndex, 1);
    this.setState({
      shapeList,
      currentShapeIndex: -1
    })
  }

  reverseShape = (e) => {
    const { shapeIndex = 0 } = e.target.dataset
    const { shapeList } = this.state
    shapeList[shapeIndex] = {
      ...shapeList[shapeIndex],
      reserve: 0 - shapeList[shapeIndex].reserve
    }

    this.setState({
      shapeList
    })
  }


  checkedShape = (e) => {
    this.setState({
      currentShapeIndex: -1
    })
  }

  touchStart = (e) => {
    const { type = '', shapeIndex = 0 } = e.target.dataset

    this.touch_target = type;
    this.touch_shape_index = shapeIndex;
    if (this.touch_target == 'shape' && shapeIndex !== this.state.currentShapeIndex) {
      this.setState({
        currentShapeIndex: shapeIndex
      })
    }

    if (this.touch_target != '') {
      this.start_x = e.touches[0].clientX;
      this.start_y = e.touches[0].clientY;
    }
  }

  touchEnd = (e) => {
    if (this.touch_target !== '' || this.touch_target !== 'cancel') {
      if (this.state.shapeList[this.touch_shape_index]) {
        setTmpThis(this, this.state.shapeList[this.touch_shape_index])
      }
    }
  }

  touchMove = (e) => {
    let { shapeList } = this.state
    const {
      shapeCenterX,
      shapeCenterY,
      resizeCenterX,
      resizeCenterY,
    } = shapeList[this.touch_shape_index]

    var current_x = e.touches[0].clientX;
    var current_y = e.touches[0].clientY;
    var moved_x = (current_x - this.start_x) * getRealRpx(1)
    var moved_y = (current_y - this.start_y) * getRealRpx(1)
    if (this.touch_target == 'shape') {
      shapeList[this.touch_shape_index] = {
        ...shapeList[this.touch_shape_index],
        shapeCenterX: shapeCenterX + moved_x,
        shapeCenterY: shapeCenterY + moved_y,
        resizeCenterX: resizeCenterX + moved_x,
        resizeCenterY: resizeCenterY + moved_y
      }
      this.setState({
        shapeList
      })
    }
    if (this.touch_target == 'rotate-resize') {
      let oneState = {
        resizeCenterX: resizeCenterX + moved_x,
        resizeCenterY: resizeCenterY + moved_y,
      }

      let diff_x_before = this.resize_center_x - this.shape_center_x;
      let diff_y_before = this.resize_center_y - this.shape_center_y;
      let diff_x_after = resizeCenterX - this.shape_center_x;
      let diff_y_after = resizeCenterY - this.shape_center_y;
      let distance_before = Math.sqrt(
        diff_x_before * diff_x_before + diff_y_before * diff_y_before
      );

      let distance_after = Math.sqrt(
        diff_x_after * diff_x_after + diff_y_after * diff_y_after
      );

      let angle_before = (Math.atan2(diff_y_before, diff_x_before) / Math.PI) * 180;
      let angle_after = (Math.atan2(diff_y_after, diff_x_after) / Math.PI) * 180;

      let twoState = {
        shapeWidth: (distance_after / distance_before) * this.shape_width,
        rotate: angle_after - angle_before + this.rotate
      }

      shapeList[this.touch_shape_index] = {
        ...shapeList[this.touch_shape_index],
        ...oneState,
        ...twoState
      }

      this.setState({
        shapeList
      })

    }
    this.start_x = current_x;
    this.start_y = current_y;
  }

  generateImage = () => {
    const { shapeList } = this.state
    const { onGenerateImage } = this.props
    onGenerateImage(shapeList)
  }
  removeImage = () => {
    const { onRemoveImage } = this.props
    onRemoveImage()
  }

  render() {
    const { cutImageSrc } = this.props
    const { shapeList = [], currentShapeIndex } = this.state
    console.log('cutImageSrc :>> ', cutImageSrc);

    return (
      <View>
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
                timeNow,
                imageUrl,
                shapeWidth,
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
                  <Image className="shape-image" data-type='shape' data-shape-index={shapeIndex} src={imageUrl} style={shapeImageStyle} />
                  {
                    currentShapeIndex === shapeIndex && (
                      <Block>
                        <View className='shape-btn-remove' data-shape-index={shapeIndex} onClick={this.removeShape}></View>
                        <View className='shape-btn-resize' data-shape-index={shapeIndex} data-type='rotate-resize'></View>
                        <View className='shape-btn-reverse' data-shape-index={shapeIndex} onClick={this.reverseShape}></View>
                        <View className='shape-btn-checked' data-shape-index={shapeIndex} onClick={this.checkedShape}></View>
                      </Block>
                    )
                  }
                </View>
              )
            })
          }
        </View>
        <View className='button-wrap'>
          <View className='button-remove' onClick={this.removeImage}>
            移除图片
          </View>
          <View className='button-download' onClick={this.generateImage}>
            保存图片
          </View>
        </View>
      </View>
    )
    
  }
}

export default ShapeEdit