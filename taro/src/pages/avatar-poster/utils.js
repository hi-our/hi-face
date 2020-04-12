import { getSystemInfo } from 'utils/common'

const { windowWidth, pixelRatio } = getSystemInfo()

export const ORIGIN_CANVAS_SIZE = 300
export const ORIGIN_CODE_SIZE = 80


export const PAGE_DPR = windowWidth / 375
export const SAVE_PAGE_DPR = PAGE_DPR * pixelRatio

export const DPR_CANVAS_SIZE = ORIGIN_CANVAS_SIZE * PAGE_DPR
export const DPR_CANVAS_HEIGHT = ORIGIN_CANVAS_SIZE * PAGE_DPR * 1.4
export const SAVE_IMAGE_WIDTH = DPR_CANVAS_SIZE * pixelRatio
export const SAVE_IMAGE_HEIGHT = DPR_CANVAS_SIZE * pixelRatio * 1.4
export const SAVE_CODE_SIZE = ORIGIN_CODE_SIZE * PAGE_DPR * pixelRatio



