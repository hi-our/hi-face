import { getSystemInfo } from 'utils/common'

const { windowWidth, pixelRatio, statusBarHeight } = getSystemInfo()
export const ORIGIN_CANVAS_SIZE = 300
export const ORIGiN_SHAPE_SIZE = 100


export const PAGE_DPR = windowWidth / 375
export const PAGE_DPR_RATIO = PAGE_DPR / 2 // 用的2倍图

export const DPR_CANVAS_SIZE = ORIGIN_CANVAS_SIZE * PAGE_DPR
export const SAVE_IMAGE_WIDTH = DPR_CANVAS_SIZE * pixelRatio
export const DEFAULT_SHAPE_SIZE = 100 * PAGE_DPR
export const STATUS_BAR_HEIGHT = statusBarHeight

export const GENDER_STATUS = ['未知', '男', '女']

export const EXPRESS_MOOD = ['黯然伤神', '半嗔半喜', '似笑非笑', '笑逐颜开', '莞尔一笑', '喜上眉梢', '眉开眼笑', '笑尽妖娆', '心花怒放', '一笑倾城']

export const HAVE_STATUS = ['无', '有']