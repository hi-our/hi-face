import { getSystemInfo } from 'utils/common'

const { windowWidth, statusBarHeight } = getSystemInfo()
export const ORIGIN_CANVAS_SIZE = 300
export const ORIGiN_SHAPE_SIZE = 100


export const PAGE_DPR = windowWidth / 375

export const DPR_CANVAS_SIZE = ORIGIN_CANVAS_SIZE * PAGE_DPR
export const SAVE_IMAGE_WIDTH = ORIGIN_CANVAS_SIZE * 2
export const DEFAULT_SHAPE_SIZE = 100 * PAGE_DPR
export const STATUS_BAR_HEIGHT = statusBarHeight

export const getDefaultState = () => {
  return {
    pageStatus: 'loading',
    themeData: {},
    isShowMenuMain: false,
    isShowShape: false,
    shapeCategoryList: [],
    currentAgeType: 'origin', // 原图
    cutImageSrc: '',
    isShowShape: false,
    posterSrc: '',
  }
}

export const SHAPE_POSITION_MAP = [
  // 不自动添加 // TODO 等待升级到 CMS 2.0
  {
    alt: 'empty',
  },
  // 居中显示
  {
    alt: 'center',
    shapeCenterX: 300,
    shapeCenterY: 300,
  },
  // 戴帽子、皇冠类型
  {
    alt: 'hat',
  },
  // 口罩
  {
    alt: 'mask',
  },
  // 左上
  {
    alt: 'left-top',
    shapeCenterX: 75,
    shapeCenterY: 75,
  },
  // 右上
  {
    alt: 'right-top',
    shapeCenterX: 525,
    shapeCenterY: 75,
  },
  // 左下
  {
    alt: 'left-bottom',
    shapeCenterX: 75,
    shapeCenterY: 525,
  },
  // 右下
  {
    alt: 'right-bottom',
    shapeCenterX: 525,
    shapeCenterY: 525,
  },
]

/**
 * 获取帽子贴纸列表
 * @param {array} shapeItem 贴纸信息
 */
export function getOneShapeList(shapeItem) {
  const {
    imageUrl = '',
    imageReverseUrl,
    _id: shapeId,
    shapeCenterX,
    shapeCenterY,
    shapeWidth = 150
  } = Object.assign(SHAPE_POSITION_MAP[shapeItem.position], shapeItem)

  console.log('shapeCenterX :>> ', shapeItem.position, shapeCenterX);

  const resizeCenterX = shapeCenterX + shapeWidth / 2 - 2
  const resizeCenterY = shapeCenterY + shapeWidth / 2 - 2

  return {
    shapeId,
    timeNow: Date.now(),
    imageUrl,
    imageReverseUrl,
    shapeWidth,
    currentShapeId: 1,
    timeNow: Date.now() * Math.random(),
    shapeCenterX,
    shapeCenterY,
    reserve: 1,
    rotate: 0,
    resizeCenterX,
    resizeCenterY,
  }
}