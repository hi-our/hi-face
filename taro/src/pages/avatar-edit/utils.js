import { getSystemInfo } from 'utils/common'

const { windowWidth, statusBarHeight } = getSystemInfo()
export const ORIGIN_CANVAS_SIZE = 300
export const ORIGiN_SHAPE_SIZE = 100


export const PAGE_DPR = windowWidth / 375

export const DPR_CANVAS_SIZE = ORIGIN_CANVAS_SIZE * PAGE_DPR
export const SAVE_IMAGE_WIDTH = ORIGIN_CANVAS_SIZE * 2
export const DEFAULT_SHAPE_SIZE = 100 * PAGE_DPR
export const STATUS_BAR_HEIGHT = statusBarHeight


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

export const dataStyleList = [
  {
    type: 'origin',
    text: '原始',
    age: 0
  },
  {
    type: 'childhood',
    text: '童年',
    age: 10
  },
  {
    type: 'middle-aged',
    text: '中年',
    age: 50
  },
  {
    type: 'elderly',
    text: '老年',
    age: 80
  },
]
