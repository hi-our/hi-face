import Taro, { Component, Config } from '@tarojs/taro'
import PropTypes, { InferProps } from 'prop-types'
import { View, Block, Video, Image } from '@tarojs/components'


import './styles.styl'


import { VideoPlayerProps, VideoPlayerState } from 'types/video-player'

import AtComponent from '../component'
// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

export default class VideoPlayer extends AtComponent<VideoPlayerProps, VideoPlayerState> {

  public static defaultProps: VideoPlayerProps
  public static propTypes: InferProps<VideoPlayerProps>

  constructor(props: VideoPlayerProps) {
    super(props)
    this.state = {
      isFull: false
    }
  }

  playVideo = () => { }

  playEnded = (e) => {
    const { onEnd } = this.props
    const { isFull } = this.state
    if (isFull) {
      this.videoCtx = Taro.createVideoContext('myVideo')
      this.videoCtx.exitFullScreen()
    }
    onEnd(e)
  }

  onFullScreenChange = (e) => {
    const { fullScreen } = e.currentTarget || {}
    this.setState({
      isFull: fullScreen
    })
  }

  render() {
    const { src, isPlay, poster, customStyle } = this.props

    return (
      <Block>
        {
          isPlay
            ? (
              <Video
                className='video'
                src={src}
                id='myVideo'
                controls
                autoplay
                onEnded={this.playEnded}
                onPlay={this.playVideo}
                onFullscreenChange={this.onFullScreenChange}
              />
            )
            : (
              <View className='video-container'>
                <Image className='poster' mode='aspectFill' src={poster} style={customStyle}></Image>
                {this.props.children}
              </View>
            )
        }
      </Block>
    )
  }
}

VideoPlayer.defaultProps = {
  src: '',
  poster: '',
  isPlay: false,
  onPlay: () => { },
  onEnd: () => { }
}

VideoPlayer.propTypes = {
  /**
   * 视频地址
  */
  src: PropTypes.string,
  /**
   * 视频封面
  */
  poster: PropTypes.string,
  /**
   * 是否正在播放
  */
  isPlay: PropTypes.bool,
  /**
   * 事件：播放后
  */
  onPlay: PropTypes.func,
  /**
   * 事件：播放结束
  */
  onEnd: PropTypes.func
}