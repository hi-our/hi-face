import { CommonEventFunction } from '@tarojs/components/types/common'
import { AtComponentProps } from './base'

export interface VideoPlayerProps extends AtComponentProps {
  /**
   * 视频地址
*/
  src: string
  /**
   * 视频封面
  */
  poster: string
  /**
   * 是否正在播放
  */
  isPlay: boolean
  /**
   * 事件：播放后
  */
  onPlay: CommonEventFunction
  /**
   * 事件：播放结束
  */
  onEnd: CommonEventFunction
}


export interface VideoPlayerState extends AtComponent {
  /**
   * 是否全屏
  */
  isFull: boolean
}

