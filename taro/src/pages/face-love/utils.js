import { getSystemInfo } from 'utils/common'

const { windowWidth, pixelRatio } = getSystemInfo()
export const ORIGIN_CANVAS_SIZE = 300
export const ORIGiN_SHAPE_SIZE = 100


export const PAGE_DPR = windowWidth / 375
export const PAGE_DPR_RATIO = PAGE_DPR / pixelRatio

export const DPR_CANVAS_SIZE = ORIGIN_CANVAS_SIZE * PAGE_DPR
export const SAVE_IMAGE_WIDTH = DPR_CANVAS_SIZE * pixelRatio
export const DEFAULT_SHAPE_SIZE = 100 * PAGE_DPR
