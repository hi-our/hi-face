import Taro from '@tarojs/taro'
import { Block, View, Image, Button } from '@tarojs/components'
import { getRealRpx, getShowRpx } from 'utils/image-utils'
import { getOneShapeList } from '../../utils';

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
    // 底图
    cutImageSrc: '',
    // 外部传入的图形位置
    shapeListOut: [],
    // 图片宽高为600，在view上用rpx，导出时用的px
    saveImageWidth: 600,
    // 默认图形大小，
    defaultShapeSize: 200,
    // 生成图片
    onGenerateImage: () => {},
    // 移动底图
    onRemoveImage: () => {},
  }

  constructor(props) {
    super(props)
    const { shapeListOut } = this.props

    this.state = {
      // 将外部的图形信息转化为内部的
      shapeList: shapeListOut,
      // 默认操作的图形为第一个
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

  // 获取默认图形
  getDefaultShape = () => {
    const { saveImageWidth, defaultShapeSize } = this.props

    return {
      // 图形默认宽度为 200 rpx
      shapeWidth: defaultShapeSize,
      // 使用时间作为key，比较简单
      timeNow: Date.now(),

      // 图形默认出现在底图中间
      shapeCenterX: saveImageWidth / 2,
      shapeCenterY: saveImageWidth / 2,
      // 旋转的基准点，在旋转推行时有用
      // TODO 还需要寻找更好的方案
      resizeCenterX: saveImageWidth / 2 + defaultShapeSize / 2 - 2,
      resizeCenterY: saveImageWidth / 2 + defaultShapeSize / 2 - 2,
      // 默认旋转角度为0
      rotate: 0,
      // 水平翻转，正向为1，反向为-1
      reserve: 1
    }
  }

  // 选择或新增图形
  chooseShape = (shapeOne) => {
    let { shapeId, imageUrl, imageReverseUrl, position = 1 } = shapeOne
    let { shapeList, currentShapeIndex } = this.state

    // 判断有图形，并且当前有一个选中的，就会将图形切换为最新选择的
    // 来源为 tab-category-list 组件中选择的图形
    if (shapeList.length > 0 && currentShapeIndex >= 0) {
      shapeList[currentShapeIndex] = {
        ...shapeList[currentShapeIndex],
        shapeId,
        imageUrl,
        imageReverseUrl
      }
    } else {
      currentShapeIndex = shapeList.length
      if ([0, 2, 3].includes(position)) {
        position = 1
      }

      let shapeNew = getOneShapeList({ ...shapeOne, position })
      // 若当前无图形或图形未被选择，则新增一个图形
      shapeList.push(shapeNew)
    }
    this.setState({
      shapeList,
      currentShapeIndex
    })
  }

  // 移除图形
  removeShape = (e) => {
    const { shapeIndex = 0 } = e.target.dataset
    const { shapeList } = this.state
    shapeList.splice(shapeIndex, 1);
    this.setState({
      shapeList,
      currentShapeIndex: -1
    })
  }

  // 图形水平翻转，正向为1，反向为-1
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

  // 确认图形效果
  checkedShape = (e) => {
    this.setState({
      currentShapeIndex: -1
    })
  }

  touchStart = (e) => {
    const { type = '', shapeIndex = 0 } = e.target.dataset

    this.touch_target = type;
    this.touch_shape_index = shapeIndex
    // 切换为当前的图形
    if (this.touch_target == 'shape' && shapeIndex !== this.state.currentShapeIndex) {
      this.setState({
        currentShapeIndex: parseInt(shapeIndex, 10)
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

    // 图形拖拽移动
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

    // 图形旋转变化
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

  // 合成图片，调用父级的 Canvas 绘制功能
  generateImage = () => {
    const { shapeList } = this.state
    const { onGenerateImage } = this.props
    onGenerateImage(shapeList)
  }

  // 移除图形
  removeImage = () => {
    const { onRemoveImage } = this.props
    onRemoveImage()
  }

  render() {
    const { cutImageSrc, posterSrc } = this.props
    const { shapeList = [], currentShapeIndex } = this.state

    return (
      <View>
        <View
          className='image-wrap'
        >
          <View
            className='image-inner'
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
                  imageReverseUrl,
                  reserve,
                  rotate
                } = shape
                console.log('shape :>> ', shape);

                let transX = getShowRpx(shapeCenterX - shapeWidth / 2 - 2) // + 'rpx'
                let transY = getShowRpx(shapeCenterY - shapeWidth / 2 - 2) // + 'rpx'

                console.log('transX :>> ', transX);

                let shapeStyle = {
                  width: getShowRpx(shapeWidth), // + 'rpx',
                  height: getShowRpx(shapeWidth), // + 'rpx',
                  transform: `translate(${transX}, ${transY}) rotate(${rotate + 'deg'})`,
                  zIndex: shapeIndex === currentShapeIndex ? 2 : 1
                }

                let shapeImageStyle = {
                  backgroundImage: `url(${imageUrl})`,
                  transform: `scale(${reserve}, 1)`,
                }

                return (
                  <View className='shape-container' key={timeNow} style={shapeStyle}>
                    <View className="shape-image" data-type='shape' data-shape-index={shapeIndex} src={imageUrl} style={shapeImageStyle}></View>
                    {
                      currentShapeIndex === shapeIndex && (
                        <Block>
                          <View className='shape-btn-remove' data-shape-index={shapeIndex} onClick={this.removeShape}></View>
                          <View className='shape-btn-resize' data-shape-index={shapeIndex} data-type='rotate-resize'></View>
                          {!!imageReverseUrl && <View className='shape-btn-reverse' data-shape-index={shapeIndex} onClick={this.reverseShape}></View>}
                          <View className='shape-btn-checked' data-shape-index={shapeIndex} onClick={this.checkedShape}></View>
                        </Block>
                      )
                    }
                  </View>
                )
              })
            }
          </View>
        </View>
        <View className='button-wrap'>
          <View className='button button-remove' onClick={this.removeImage}>
            移除图片
          </View>
          <View className='button button-save' onClick={this.generateImage}>
            保存去分享
          </View>
        </View>
      </View>
    )
    
  }
}

export default ShapeEdit