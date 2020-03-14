import { getSystemInfo } from 'utils/common'

const { windowWidth, pixelRatio } = getSystemInfo()
export const ORIGIN_CANVAS_SIZE = 300
export const ORIGiN_SHAPE_SIZE = 100


export const PAGE_DPR = windowWidth / 375

export const DPR_CANVAS_SIZE = ORIGIN_CANVAS_SIZE * PAGE_DPR
export const SAVE_IMAGE_WIDTH = DPR_CANVAS_SIZE * pixelRatio
export const DEFAULT_SHAPE_SIZE = 100 * PAGE_DPR


export const getDefaultShape = (categoryName = 'crown') => {
  return {
    categoryName,
    shapeWidth: DEFAULT_SHAPE_SIZE,
    currentShapeId: 1,
    timeNow: Date.now(),

    shapeCenterX: DPR_CANVAS_SIZE / 2,
    shapeCenterY: DPR_CANVAS_SIZE / 2,
    resizeCenterX: DPR_CANVAS_SIZE / 2 + DEFAULT_SHAPE_SIZE / 2 - 2,
    resizeCenterY: DPR_CANVAS_SIZE / 2 + DEFAULT_SHAPE_SIZE / 2 - 2,
    rotate: 0,
    reserve: 1
  }
}

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

export const materialList = [
  {
    name: 'crown',
    cn: '皇冠',
    imgList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: 'multi'
  },
  {
    name: 'text',
    cn: '文字',
    imgList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: 'multi'
  },
]


export const getDefaultStyleMap = () => ({
  origin: '',
  childhood: '',
})
export const getDefaultAgeMap = () => ({
  origin: '',
  childhood: '',
})


export const dataStyleList = [
  {
    type: 'origin',
    image: 'https://n1image.hjfile.cn/res7/2020/03/01/ca84b69c25bee8196d72986e5df45761.jpg',
    text: '原始',
  },
  {
    type: 'childhood',
    image: 'https://n1image.hjfile.cn/res7/2020/03/01/cd9490adedde3707de44623a23c350f6.jpeg',
    text: '童年',
  },
]
