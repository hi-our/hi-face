import Taro from '@tarojs/taro'
import VideoPlayer from 'components/video-player'
import PropTypes, { InferProps } from 'prop-types'
import { View, Image, Text } from '@tarojs/components'
import { pickGifFirst } from 'utils/common'
import './styles.styl'

import { CommonEventFunction } from '@tarojs/components/types/common'
import { AtComponentProps } from 'types/base'
import AtComponent from 'components/component'

export interface BannerProps extends AtComponentProps {
  /**
   * 视频地址
  */
  src: string
  /**
   * 视频封面
   */
  poster: string
  /**
   * 视频播放状态
   */
  status: number
  /**
   * 视频开始播放
  */
  onPlayStart?: () => void
  /**
   * 视频开始播放
  */
  onPlayEnd?: () => void

}

// const NEXT_ICON = 'https://n1image.hjfile.cn/res7/2019/06/11/222f761501f7790a38f52a75fe0c918b.png'
// const REPLAY_ICON = 'https://n1image.hjfile.cn/res7/2019/07/31/13b896576320ad176199b8af2616e4f3.png'
const REPLAY_ICON = 'https://n1other.hjfile.cn/res7/2019/07/31/a88cf895d34ed11883ddb1ded116f5ce.svg'
const EMPTY_FUNC = () => { }

const VIDEO_STATUS = {
  NOT_PLAY: 1,
  PLAYING: 2,
  PAUSED: 3,
  ENDED: 4
}


export default class Banner extends AtComponent<BannerProps> {

  public static defaultProps: BannerProps
  public static propTypes: InferProps<BannerProps>


  startVideo = () => {
    const { onPlayStart } = this.props

    onPlayStart()
  }

  rePlay = () => {
    const { onPlayStart } = this.props

    onPlayStart()
  }

  onEnd = () => {
    const { onPlayEnd } = this.props
    onPlayEnd()
  }

  render() {
    const { src, poster, status, showName } = this.props
    let style = { opacity: !src ? '1.0' : '0.6' }


    return (
      <View className='video'>
        <VideoPlayer
          src={src}
          isPlay={status === VIDEO_STATUS.PLAYING}
          poster={poster}
          onEnd={this.onEnd}
          onPlay={this.startVideo}
          customStyle={style}
        >
          {status === VIDEO_STATUS.NOT_PLAY && (
            <View className='play-container' onClick={this.startVideo}>
              <View className='pause-icon' ></View>
              {showName && <View className='last-title'>{showName}</View>}
            </View>
          )}
          {status === VIDEO_STATUS.ENDED && (
            <View className='replay' onClick={this.rePlay}>
              <Image src={REPLAY_ICON} className='replay-icon'></Image>
              <Text className='text'>重播</Text>
            </View>
          )}

        </VideoPlayer>
      </View>
    )
  }

}

Banner.defaultProps = {
  src: '',
  poster: '',
  status: VIDEO_STATUS.NOT_PLAY,
  onPlayStart: EMPTY_FUNC,
  onPlayEnd: EMPTY_FUNC,
}
