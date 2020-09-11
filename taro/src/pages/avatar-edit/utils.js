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