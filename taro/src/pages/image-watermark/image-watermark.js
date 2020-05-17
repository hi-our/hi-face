import Taro, { Component } from '@tarojs/taro'
import { View, Image, RadioGroup, Radio, Label, Input, Block } from '@tarojs/components'
import { cloudCallFunction } from 'utils/fetch'
import promisify from 'utils/promisify'
import { STATUS_BAR_HEIGHT } from './utils'
import PosterDialog from './components/poster-dialog'
import { downloadImgByBase64 } from 'utils/canvas-drawing';

import './styles.styl';

function blobToDataURL(blob) {
  var a = new FileReader();
  a.readAsDataURL(blob);//读取文件保存在result中
  a.onload = function (e) {
    var getRes = e.target.result;//读取的结果在result中
    console.log('getRes :>> ', getRes);
  }

}


const isH5Page = process.env.TARO_ENV === 'h5'

const getImageUrl = async (fileID) => {
  const { fileList } = await Taro.cloud.getTempFileURL({
    fileList: [fileID]
  })
  return fileList[0].tempFileURL
}

// @CorePage
class DetectFace extends Component {
  config = {
    navigationBarTitleText: '盲水印添加工具',
    navigationStyle: 'custom',
    disableScroll: true,
    navigationBarTextStyle: 'black'
  }

  constructor(props) {
    super(props)
    this.state = {
      waterType: 3,
      originFileID: '', //'cloud://development-v9y2f.6465-development-v9y2f-1251170943/1584020379882-9111105.jpg',
      originUrl: '', //'cloud://development-v9y2f.6465-development-v9y2f-1251170943/1584020379882-9111105.jpg',
      waterFileID: '', //'cloud://development-v9y2f.6465-development-v9y2f-1251170943/uploads/1589100529524.png',
      waterUrl: '', //'cloud://development-v9y2f.6465-development-v9y2f-1251170943/uploads/1589100529524.png',
      savedFileID: '', //'cloud://development-v9y2f.6465-development-v9y2f-1251170943/watermark/1584020379882-9111105.jpg',
      savedUrl: '', //'cloud://development-v9y2f.6465-development-v9y2f-1251170943/watermark/1584020379882-9111105.jpg',
      waterSeeFileID: '',
      waterSeeUrl: '',
      waterText: 'Hi-Our',
      isShowSaved: true,
      isWaterChanged: false
    }
  }

  onShareAppMessage() {
    const DEFAULT_SHARE_COVER = 'https://n1image.hjfile.cn/res7/2020/04/26/2041af2867f22e62f8fce32b29cd1fb0.png'

    return {
      title: '盲水印添加工具',
      imageUrl: DEFAULT_SHARE_COVER,
      path: '/pages/detect-face/detect-face'
    }
  }

  chooseImage = async (event) => {
    console.log('event :>> ', event);
    const { type } = event.currentTarget.dataset
    
    const { cancel } = await Taro.showModal({
      title: '提示',
      content: '图片会上传到云端，请确定？',
      
    })
    if (cancel) {
      console.log('用户点击取消')
      return
    }
    const { tempFilePaths, tempFiles } = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],
    })
    let useFiles = isH5Page ? tempFiles[0].originalFileObj : tempFilePaths[0]
    console.log('tempFiles[0] :>> ', tempFiles[0]);

    
    console.log(' tempFiles : tempFilePaths :>> ', useFiles);
    let { width, height } = await Taro.getImageInfo({
      src: tempFilePaths[0]
    })
    
    if (width > 4500 || height > 4500) {
      Taro.showToast({
        icon: 'none',
        title: '请不要上传大图'
      })
      return
    }
    
    try {
      Taro.showLoading({
        title: '图片上传中'
      })
      const fileID = await this.onUploadFile(useFiles)
  
      if (!fileID) return

      if (!isH5Page) {
        Taro.showLoading({
          title: '图片校验中'
        })
        await cloudCallFunction({
          name: 'image-safe-check',
          data: {
            fileID
          }
        })
      }

      const fileUrl = await getImageUrl(fileID)

      console.log('fileUrl :>> ', fileUrl);


      Taro.hideLoading()

      this.setState(type === 'water' ? {
        waterFileID: fileID,
        waterUrl: fileUrl,
        isWaterChanged: true
      } : {
        originFileID: fileID,
        originUrl: fileUrl,
        isWaterChanged: true
      })
      
    } catch (error) {
      Taro.hideLoading()
      console.log('error :>> ', error);
      const { message } = error || {}
      this.onShowToast(message || JSON.stringify(error))
    }

  
  }

  onUploadFile = async (tempFilePath, prefix = 'temp') => {
    console.log('tempFilePath :>> ', tempFilePath);

    try {

      let uploadParams = {
        cloudPath: `${prefix}/${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.jpg`, // 随机图片名
        filePath: tempFilePath
      }
      if (isH5Page) {
        const { fileID } = await Taro.cloud.uploadFile(uploadParams)
        return fileID
      }
      const uploadFile = promisify(Taro.cloud.uploadFile)
      const { fileID } = await uploadFile(uploadParams)
      return fileID

    } catch (error) {
      Taro.showLoading()
      console.log('error :', error)
      return ''
    }

  }

  onTypeChange = (event) => {
    console.log('event :>> ', event);
    const { value } = event.detail

    this.setState({
      isWaterChanged: true,
      waterType: parseInt(value)
    })
  }

  onWaterInput = (event) => {
    console.log('event :>> ', event);
    const { value } = event.detail
    this.setState({
      isWaterChanged: true,
      waterText: value
    })
  }

  onRemoveImage = () => {
    this.setState({
      originFileID: '',
      originUrl: ''
    })
  }

  onRemoveWaterImage = () => {
    this.setState({
      isWaterChanged: true,
      waterFileID: '',
      waterUrl: '',
    })
  }

  onShowToast = (message = '') => {
    Taro.showToast({
      icon: 'icon',
      title: message
    })
  }

  toggleImageShow = () => {
    this.setState({
      isShowSaved: !this.state.isShowSaved
    })
  }

  onGenerateImage = async () => {
    const { originFileID, waterType, waterText, waterFileID } = this.state
    if (waterType === 3 && !waterText) {
      this.onShowToast('请输入水印文字')
      return
    } else if (waterType !== 3 && !waterFileID) {
      this.onShowToast('请选择水印图片')
      return
    }

    try {
      Taro.showLoading({
        title: '图片生成中'
      })

      let tempState = {
        fileID: originFileID,
        waterType,
      }

      if (waterType === 3) {
        tempState.waterText = waterText
      } else {
        tempState.waterFileID = waterFileID
      }

      const { fileID, fileUrl } = await cloudCallFunction({
        name: 'image-watermark',
        data: tempState
      })

      Taro.hideLoading()

      console.log('fileID :>> ', fileID);
      this.setState({
        isWaterChanged: false,
        savedFileID: fileID,
        savedUrl: fileUrl
      })

    } catch (error) {
      Taro.hideLoading()
      console.log('error :>> ', error);
      const { message } = error || {}
      this.onShowToast(message || JSON.stringify(error))
    }
    
  }
  onLookCheck = async () => {
    const { savedFileID, waterType, waterText, waterFileID, isWaterChanged } = this.state

    if (isWaterChanged) {
      this.onShowToast('请重新生成水印图片')
      return 
    }

    try {
      Taro.showLoading({
        title: '图片生成中'
      })

      let tempState = {
        fileID: savedFileID,
        waterType,
      }

      if (waterType === 3) {
        tempState.waterText = waterText
      } else {
        tempState.waterFileID = waterFileID
      }
      const { fileID, fileUrl } = await cloudCallFunction({
        name: 'image-watermark',
        data: {
          type: 'parse',
          ...tempState
        }
      })

      Taro.hideLoading()

      console.log('onLookCheck fileID :>> ', fileID);
      this.setState({
        isWaterChanged: false,
        waterSeeFileID: fileID,
        waterSeeUrl: fileUrl
      }, () => {
        this.posterRef.onShowPoster()
      })

    } catch (error) {
      Taro.hideLoading()
      console.log('error :>> ', error);
      const { message } = error || {}
      this.onShowToast(message || JSON.stringify(error))
    }
    
  }

  onSaveImage = () => {
    const { savedUrl } = this.state
    Taro.showToast({
      title: '尝试保存图片'
    })
    this.saveImageToPhotosAlbum(savedUrl)
  }

  saveImageToPhotosAlbum = (tempFilePath) => {
    if (isH5Page) {
      downloadImgByBase64(tempFilePath)
    } else {
      Taro.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: res2 => {
          Taro.showToast({
            title: '图片保存成功'
          })
          console.log('保存成功 :', res2);
        },
        fail(e) {
          Taro.showToast({
            title: '图片未保存成功'
          })
          console.log('图片未保存成功:' + e);
        }
      })
    }
  }

  render() {
    const { originUrl, waterUrl, waterType, waterText, savedUrl, isShowSaved, waterSeeUrl, isWaterChanged } = this.state
    let tips = '上传照片，宽高不大于4500像素'

    if (waterUrl) {
      tips = '点击“查看水印位置”，可以看水印位置'
    }

    console.log('isWaterChanged :>> ', isWaterChanged);

    return (
      <View className='image-watermark-page' style={{ paddingTop: !isH5Page ? STATUS_BAR_HEIGHT + 'px' :'0' }}>
        <View className='page-title'>盲水印添加工具</View>
        <View className='image-wrap'>
          {
            !!originUrl
              ? (
                <View className='shape-wrap'>
                  <Image
                    src={originUrl}
                    mode='aspectFit'
                    className='image-selected'
                  />

                  {savedUrl && (
                    <Block>
                      {isShowSaved && (
                        <View className='image-saved-wrap'>
                          <Image
                            src={savedUrl}
                            mode='aspectFit'
                            className='image-saved-selected'
                          />
                        </View>
                      )}
                      <View className='toggle-button' onClick={this.toggleImageShow}>切换效果</View>
                      <View className='toggle-tips'>{isShowSaved ? '效果图' : '原图'}</View>
                      {!isWaterChanged && <View className='toggle-check' onClick={this.onLookCheck}>查看水印位置</View>}
                    </Block>
                  )}
                </View>
              )
              : <View className='to-choose' data-type='origin' onClick={this.chooseImage}></View>
          }
          <View className='image-tips'>{tips}</View>
        </View>
        <RadioGroup className='type-group' onChange={this.onTypeChange}>
          <Label className='type-radio'>
            <Radio value='3' checked={waterType === 3}>文字型</Radio>
          </Label>
          <Label className='type-radio'>
            <Radio value='1' checked={waterType === 1}>半盲型</Radio>
          </Label>
          <Label className='type-radio'>
            <Radio value='2' checked={waterType === 2}>全盲型</Radio>
          </Label>
        </RadioGroup> 
        <View>
          {
            waterType === 3
              ? <Input className="water-text-input" value={waterText} maxLength={20} onInput={this.onWaterInput} />
              : (
                <View>
                  {
                    waterUrl
                      ? (
                        <View className='image-water-selected'>
                          <Image className='image-water' src={waterUrl} mode="aspectFit" />
                          <View className='image-btn-remove' onClick={this.onRemoveWaterImage}></View>
                        </View>
                      )
                      : <View className='to-choose-water' data-type='water' onClick={this.chooseImage}></View>
                  }
                </View>
              )
          }
        </View>
        {originUrl && (
          <View className='button-wrap'>
            <View className='button-remove' onClick={this.onRemoveImage}>
              移除图片
            </View>
            <View className='button-download' onClick={this.onGenerateImage}>
              生成水印图
            </View>
          </View>
        )}
        {!!savedUrl && <View className='main-button' onClick={this.onSaveImage}>保存水印图</View>}
        <PosterDialog
          ref={poster => this.posterRef = poster}
          posterSrc={waterSeeUrl}
        />
      </View>
    )
  }
}

export default DetectFace