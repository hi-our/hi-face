import Taro, {CanvasContext, getImageInfo, getSystemInfoSync} from '@tarojs/taro';
import {Canvas, CoverView, View} from '@tarojs/components';
import './index.styl';
// @ts-ignore
import {CanvasTouch, CanvasTouchEvent} from "@tarojs/components/types/common";
import {CSSProperties} from "react";
import { easySetFillStyle, easySetLineWidth, easySetStrokeStyle } from "./canvas-util";


interface TaroCropperComponentProps {
  cropperCanvasId: string,          // 画布id
  cropperCutCanvasId: string,       // 用于裁剪的canvas id
  width: number,                    // 组件宽度
  height: number,                   // 组件高度   (要求背景高度大于宽度)
  cropperWidth: number,             // 裁剪框宽度
  cropperHeight: number,            // 裁剪框高度
  themeColor: string,               // 主题色（裁剪框的四个角的绘制颜色）
  maxScale: number,                 // 最大放大倍数，maxScale >= 1
  fullScreen: boolean,              // 组件充满全屏，此时width和height设置无效
  fullScreenCss: boolean,           // 使用CSS全屏高度
  src: string,                      // 要裁剪的图片路径,
  onCut: (src: string) => void,     // 点击底部的完成按钮，执行裁剪，成功则触发该回调
  onCancel: () => void,             // 点击取消按钮回调
  onFail: (err) => void,            // 裁剪失败触发该回调
  hideFinishText: boolean,          // 隐藏完成按钮（可以自己实现，然后调用本实例的cut方法进行裁剪）
  hideCancelText: boolean,          // 隐藏取消按钮（默认为true）
  finishText: string,               // 完成按钮文字，默认为 '完成'
  cancelText: string,               // 取消按钮文字，默认为 '取消'
  fileType: 'jpg' | 'png' | string, // 裁剪后导出的图片的格式，只支持 'jpg' 或 'png'。默认为 'jpg'
  quality: number,                  // 导出图片的质量，取值为 0 ~ 1，默认为1
}

interface TaroCropperComponentState {
  scale: number,
}

class TaroCropperComponent extends Taro.PureComponent<TaroCropperComponentProps, TaroCropperComponentState> {

  static defaultProps = {
    width: 750,
    height: 1200,
    cropperWidth: 400,
    cropperHeight: 400,
    cropperCanvasId: 'cropperCanvasId',
    cropperCutCanvasId: 'cropperCutCanvasId',
    src: '',
    themeColor: '#00ff00',
    maxScale: 3,
    fullScreen: false,
    fullScreenCss: false,
    hideFinishText: false,
    hideCancelText: true,
    finishText: '完成',
    cancelText: '取消',
    fileType: 'jpg',
    quality: 1,
    onCancel: () => {
    },
    onCut: () => {
    },
    onFail: () => {
    },
  };

  systemInfo: getSystemInfoSync.Return;

  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.handleOnTouchMove = this.handleOnTouchMove.bind(this);
    this.handleOnTouchStart = this.handleOnTouchStart.bind(this);
    this.handleOnTouchEnd = this.handleOnTouchEnd.bind(this);
    this._drawCropperCorner = this._drawCropperCorner.bind(this);
    this._drawCropperContent = this._drawCropperContent.bind(this);
    this.systemInfo = Taro.getSystemInfoSync();
    this.state = {
      scale: 1,
    }
  }

  cropperCanvasContext: CanvasContext;
  cropperCutCanvasContext: CanvasContext;
  imageLeft: number = 0;
  imageTop: number = 0;
  imageLeftOrigin: number = 0;
  imageTopOrigin: number = 0;
  width: number = 0;
  height: number = 0;
  cropperWidth: number = 0;
  cropperHeight: number = 0;
  imageInfo: getImageInfo.Promised;
  realImageWidth: number = 0;
  realImageHeight: number = 0;
  scaleImageWidth: number = 0;
  scaleImageHeight: number = 0;
  image: HTMLImageElement;

  /**
   * 根据props更新长等信息
   */
  updateInfo(props: TaroCropperComponentProps) {
    const {
      width,
      height,
      cropperWidth,
      cropperHeight,
      src,
      fullScreen
    } = props;
    this.width = fullScreen ? this.systemInfo.windowWidth : this._getRealPx(width);
    this.height = fullScreen ? this.systemInfo.windowHeight : this._getRealPx(height);
    this.cropperWidth = this._getRealPx(cropperWidth);
    this.cropperHeight = this._getRealPx(cropperHeight);
    if (!src)
      return Promise.reject();
    return Taro.getImageInfo({
      src: src
    })
      .then((res: getImageInfo.Promised) => {
        this.imageInfo = res;
        const imageWidth = res.width;
        const imageHeight = res.height;

        if (imageWidth / imageHeight < this.cropperWidth / this.cropperHeight) {      // 宽度充满
          this.scaleImageWidth = this.realImageWidth = this.cropperWidth;
          this.scaleImageHeight = this.realImageHeight = this.realImageWidth * imageHeight / imageWidth;
          this.imageLeftOrigin = this.imageLeft = (this.width - this.cropperWidth) / 2;
          this.imageTopOrigin = this.imageTop = (this.height - this.realImageHeight) / 2;
        } else {
          this.scaleImageHeight = this.realImageHeight = this.cropperHeight;
          this.scaleImageWidth = this.realImageWidth = this.realImageHeight * imageWidth / imageHeight;
          this.imageLeftOrigin = this.imageLeft = (this.width - this.realImageWidth) / 2;
          this.imageTopOrigin = this.imageTop = (this.height - this.cropperHeight) / 2;
        }
        // h5端返回的如果是blob对象，需要转成image对象才可以用Canvas绘制
        if (process.env.TARO_ENV === 'h5' && src.startsWith('blob:')) {
          return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.src = src;
            this.image.id = `taro_cropper_${src}`;
            this.image.style.display = 'none';
            document.body.append(this.image);
            this.image.onload = resolve;
            this.image.onerror = reject;
          });
        } else {
          return Promise.resolve()
        }
      });

  }

  componentDidMount(): void {
    const {
      cropperCanvasId,
      cropperCutCanvasId
    } = this.props;
    this.cropperCanvasContext = Taro.createCanvasContext(cropperCanvasId, this);
    this.cropperCutCanvasContext = Taro.createCanvasContext(cropperCutCanvasId, this);
    this.updateInfo(this.props)
      .then(() => {
        this.update();
      })
      .catch(() => {
        this.update();
      });
  }

  /**
   * 单位转换
   * @param value
   * @private
   */
  _getRealPx(value: number) {
    return value / 750 * this.systemInfo.screenWidth;
  }

  /**
   * 绘制裁剪框的四个角
   * @private
   */
  _drawCropperCorner() {
    const {
      themeColor
    } = this.props;

    const lineWidth = 2;
    const lineLength = 10;
    const cropperStartX = (this.width - this.cropperWidth) / 2;
    const cropperStartY = (this.height - this.cropperHeight) / 2;
    this.cropperCanvasContext.beginPath();
    easySetStrokeStyle(this.systemInfo, this.cropperCanvasContext, themeColor);
    easySetLineWidth(this.systemInfo, this.cropperCanvasContext, lineWidth);
    // 左上角
    this.cropperCanvasContext.moveTo(cropperStartX, cropperStartY);
    this.cropperCanvasContext.lineTo(cropperStartX + lineLength, cropperStartY);
    this.cropperCanvasContext.moveTo(cropperStartX, cropperStartY - lineWidth / 2);
    this.cropperCanvasContext.lineTo(cropperStartX, cropperStartY + lineLength);
    // 右上角
    this.cropperCanvasContext.moveTo(cropperStartX + this.cropperWidth, cropperStartY);
    this.cropperCanvasContext.lineTo(cropperStartX + this.cropperWidth - lineLength, cropperStartY);
    this.cropperCanvasContext.moveTo(cropperStartX + this.cropperWidth, cropperStartY - lineWidth / 2);
    this.cropperCanvasContext.lineTo(cropperStartX + this.cropperWidth, cropperStartY + lineLength);
    // 左下角
    this.cropperCanvasContext.moveTo(cropperStartX, cropperStartY + this.cropperHeight);
    this.cropperCanvasContext.lineTo(cropperStartX + lineLength, cropperStartY + this.cropperHeight);
    this.cropperCanvasContext.moveTo(cropperStartX, cropperStartY + this.cropperHeight + lineWidth / 2);
    this.cropperCanvasContext.lineTo(cropperStartX, cropperStartY + this.cropperHeight - lineLength);
    // 右下角
    this.cropperCanvasContext.moveTo(cropperStartX + this.cropperWidth, cropperStartY + this.cropperHeight);
    this.cropperCanvasContext.lineTo(cropperStartX + this.cropperWidth - lineLength, cropperStartY + this.cropperHeight);
    this.cropperCanvasContext.moveTo(cropperStartX + this.cropperWidth, cropperStartY + this.cropperHeight + lineWidth / 2);
    this.cropperCanvasContext.lineTo(cropperStartX + this.cropperWidth, cropperStartY + this.cropperHeight - lineLength);
    this.cropperCanvasContext.closePath();
    this.cropperCanvasContext.stroke();
  }

  /**
   * 绘制裁剪框区域的图片
   * @param props
   * @param src               待绘制的图片路径
   * @param deviationX        图片绘制x向偏移
   * @param deviationY        图片绘制y向偏移
   * @param imageWidth        图片的原始宽度
   * @param imageHeight       图片的原始高度
   * @param drawWidth         图片的绘制宽度
   * @param drawHeight        图片的绘制高度
   * @param reverse
   * @private
   */
  _drawCropperContent(
    // props: TaroCropperComponentProps,
    src: string | HTMLImageElement,
    deviationX: number,
    deviationY: number,
    imageWidth: number,
    imageHeight: number,
    drawWidth: number,
    drawHeight: number) {
    this._drawCropperCorner();
    const cropperStartX = (this.width - this.cropperWidth) / 2;
    const cropperStartY = (this.height - this.cropperHeight) / 2;

    const cropperImageX = (cropperStartX - deviationX) / drawWidth * imageWidth;
    const cropperImageY = (cropperStartY - deviationY) / drawHeight * imageHeight;
    const cropperImageWidth = this.cropperWidth / drawWidth * imageWidth;
    const cropperImageHeight = this.cropperHeight / drawHeight * imageHeight;
    // 绘制裁剪框内裁剪的图片
    // @ts-ignore
    this.cropperCanvasContext.drawImage(src, cropperImageX, cropperImageY, cropperImageWidth, cropperImageHeight,
      cropperStartX, cropperStartY, this.cropperWidth, this.cropperHeight);
    // @ts-ignore
    this.cropperCutCanvasContext.drawImage(src, cropperImageX, cropperImageY, cropperImageWidth, cropperImageHeight,
      0, 0, this.cropperWidth, this.cropperHeight);
  }

  update() {
    if (!this.imageInfo) {            // 图片资源无效则不执行更新操作
      this._drawCropperCorner();
      this.cropperCanvasContext.draw();
      return;
    }

    const src = process.env.TARO_ENV === 'h5' ? this.image : this.imageInfo.path;


    // @ts-ignore
    this.cropperCanvasContext.drawImage(src, 0, 0, this.imageInfo.width, this.imageInfo.height,
      this.imageLeft, this.imageTop, this.scaleImageWidth, this.scaleImageHeight);
    // 绘制半透明层
    this.cropperCanvasContext.beginPath();
    easySetFillStyle(this.systemInfo, this.cropperCanvasContext, 'rgba(0, 0, 0, 0.3)');
    this.cropperCanvasContext.fillRect(0, 0, this.width, this.height);
    this.cropperCanvasContext.fill();

    // 绘制裁剪框内部的区域
    this._drawCropperContent(src, this.imageLeft, this.imageTop,
      this.imageInfo.width, this.imageInfo.height, this.scaleImageWidth, this.scaleImageHeight);
    this.cropperCanvasContext.draw(false);
    this.cropperCutCanvasContext.draw(false);
  }

  /**
   * 图片资源有更新则重新绘制
   * @param nextProps
   * @param nextContext
   */
  componentWillReceiveProps(nextProps: Readonly<TaroCropperComponentProps>, nextContext: any): void {
    if (JSON.stringify(nextProps) != JSON.stringify(this.props)) {
      this.updateInfo(nextProps)
        .then(() => {
          this.update();
        });
    }
    return super.componentWillReceiveProps && super.componentWillReceiveProps(nextProps, nextContext);
  }

  /**
   * 图片移动边界检测
   * @param imageLeft
   * @param imageTop
   * @private
   */
  _outsideBound(imageLeft: number, imageTop: number) {
    this.imageLeft =
      imageLeft > (this.width - this.cropperWidth) / 2
        ?
        (this.width - this.cropperWidth) / 2
        :
        (
          (imageLeft + this.scaleImageWidth) >= (this.width + this.cropperWidth) / 2
            ?
            imageLeft
            :
            (this.width + this.cropperWidth) / 2 - this.scaleImageWidth
        );
    this.imageTop =
      imageTop > (this.height - this.cropperHeight) / 2
        ?
        (this.height - this.cropperHeight) / 2
        :
        (
          (imageTop + this.scaleImageHeight) >= (this.height + this.cropperHeight) / 2
            ?
            imageTop
            :
            (this.height + this.cropperHeight) / 2 - this.scaleImageHeight
        )
  }

  touch0X = 0;
  touch0Y = 0;
  oldDistance = 0;
  oldScale = 1;
  newScale = 1;
  lastScaleImageWidth = 0;
  lastScaleImageHeight = 0;

  _oneTouchStart(touch: CanvasTouch) {
    this.touch0X = touch.x;
    this.touch0Y = touch.y;
  }

  _twoTouchStart(touch0: CanvasTouch, touch1: CanvasTouch) {
    const xMove = touch1.x - touch0.x;
    const yMove = touch1.y - touch0.y;
    this.lastScaleImageWidth = this.scaleImageWidth;
    this.lastScaleImageHeight = this.scaleImageHeight;

    // 计算得到初始时两指的距离
    this.oldDistance = Math.sqrt(xMove * xMove + yMove * yMove);
  }

  _oneTouchMove(touch: CanvasTouch) {
    const xMove = touch.x - this.touch0X;
    const yMove = touch.y - this.touch0Y;
    this._outsideBound(this.imageLeftOrigin + xMove, this.imageTopOrigin + yMove);
    this.update();
  }

  _getNewScale(oldScale: number, oldDistance: number, touch0: CanvasTouch, touch1: CanvasTouch) {
    const xMove = touch1.x - touch0.x;
    const yMove = touch1.y - touch0.y;
    const newDistance = Math.sqrt(xMove * xMove + yMove * yMove);
    return oldScale + 0.02 * (newDistance - oldDistance);
  }

  _twoTouchMove(touch0: CanvasTouch, touch1: CanvasTouch) {
    const {
      maxScale
    } = this.props;
    const realMaxScale = maxScale >= 1 ? maxScale : 1;
    const oldScale = this.oldScale;
    const oldDistance = this.oldDistance;
    this.newScale = this._getNewScale(oldScale, oldDistance, touch0, touch1);

    // 限制缩放
    this.newScale <= 1 && (this.newScale = 1);
    this.newScale > realMaxScale && (this.newScale = realMaxScale);

    this.scaleImageWidth = this.realImageWidth * this.newScale;
    this.scaleImageHeight = this.realImageHeight * this.newScale;
    const imageLeft = this.imageLeftOrigin - (this.scaleImageWidth - this.lastScaleImageWidth) / 2;
    const imageTop = this.imageTopOrigin - (this.scaleImageHeight - this.lastScaleImageHeight) / 2;

    this._outsideBound(imageLeft, imageTop);

    this.update();
  }


  handleOnTouchEnd() {
    this.oldScale = this.newScale;
    this.imageLeftOrigin = this.imageLeft;
    this.imageTopOrigin = this.imageTop
  }


  handleOnTouchStart(e: CanvasTouchEvent) {
    const {
      src
    } = this.props;
    if (!src)
      return;
    const touch0 = e.touches[0];
    const touch1 = e.touches[1];

    // 计算第一个触摸点的位置，并参照改点进行缩放
    this._oneTouchStart(touch0);

    // 两指手势触发
    if (e.touches.length >= 2) {
      this._twoTouchStart(touch0, touch1);
    }
  }

  handleOnTouchMove(e: CanvasTouchEvent) {
    const {
      src
    } = this.props;
    if (!src)
      return;

    // 单指手势触发
    if (e.touches.length === 1) {
      this._oneTouchMove(e.touches[0]);
    } else if (e.touches.length >= 2) {// 双指手势触发
      this._twoTouchMove(e.touches[0], e.touches[1]);
    }
  }


  /**
   * 将当前裁剪框区域的图片导出
   */
  cut(): Promise<{
    errMsg: string,
    filePath: string,
  }> {
    const {
      cropperCutCanvasId,
      fileType,
      quality
    } = this.props;
    return new Promise((resolve, reject) => {
      const scope = process.env.TARO_ENV === 'h5' ? this : this.$scope;
      Taro.canvasToTempFilePath({
        canvasId: cropperCutCanvasId,
        x: 0,
        y: 0,
        width: this.cropperWidth - 2,
        height: this.cropperHeight - 2,
        destWidth: this.cropperWidth * this.systemInfo.pixelRatio,
        destHeight: this.cropperHeight * this.systemInfo.pixelRatio,
        fileType: fileType,
        quality: quality,
        success: res => {
          switch (process.env.TARO_ENV) {
            case 'alipay':
              resolve({
                errMsg: res.errMsg,
                filePath: res.apFilePath
              });
              break;
            case 'weapp':
            case 'qq':
            case 'h5':
            default:
              resolve({
                errMsg: res.errMsg,
                filePath: res.tempFilePath
              });
              break;

          }
          resolve(res);
        },
        fail: err => {
          reject(err);
        },
        complete: () => {
        }
      }, scope);
    });
  }


  render(): any {
    const {
      width,
      height,
      cropperCanvasId,
      fullScreen,
      fullScreenCss,
      themeColor,
      hideFinishText,
      cropperWidth,
      cropperHeight,
      cropperCutCanvasId,
      hideCancelText,
      onCancel,
      finishText,
      cancelText
    } = this.props;

    const _width = fullScreen ? this.systemInfo.windowWidth : this._getRealPx(width);
    const _height = fullScreen ? this.systemInfo.windowHeight : this._getRealPx(height);
    const _cropperWidth = this._getRealPx(cropperWidth);
    const _cropperHeight = this._getRealPx(cropperHeight);
    const isFullScreenCss = fullScreen && fullScreenCss

    const croperStyle = isFullScreenCss ? {} : {
      position: 'relative'
    }

    const canvasStyle: CSSProperties = isFullScreenCss ? {} : {
      background: 'rgba(0, 0, 0, 0.8)',
      position: 'relative',
      width: `${_width}px`,
      height: `${_height}px`
    };
    const cutCanvasStyle: CSSProperties = {
      position: 'absolute',
      left: `${(_width - _cropperWidth) / 2}px`,
      top: `${(_height - _cropperHeight) / 2}px`,
      width: `${_cropperWidth}px`,
      height: `${_cropperHeight}px`,
    };

    let finish: any = null;
    let cancel: any = null;
    const isH5 = process.env.TARO_ENV === 'h5';

    if (!hideFinishText) {
      const finishStyle: CSSProperties = {
        position: 'absolute',
        display: 'inline-block',
        color: themeColor,
        textAlign: "right",
        fontSize: Taro.pxTransform(32),
        bottom: Taro.pxTransform(30),
        right: Taro.pxTransform(30),
      };
      const onFinishClick = () => {
        this.cut()
          .then(res => {
            this.props.onCut && this.props.onCut(res.filePath);
          })
          .catch(err => {
            this.props.onFail && this.props.onFail(err);
          })
      };
      if (!isH5) {
        finish = <CoverView
          style={finishStyle}
          onClick={onFinishClick}
        >
          {finishText}
        </CoverView>
      } else {
        finish = <View
          style={finishStyle}
          onClick={onFinishClick}
        >
          完成
        </View>
      }
    }

    if(!hideCancelText) {
      const cancelStyle: CSSProperties = {
        position: 'absolute',
        display: 'inline-block',
        color: themeColor,
        textAlign: "left",
        fontSize: Taro.pxTransform(32),
        bottom: Taro.pxTransform(30),
        left: Taro.pxTransform(30),
      };
      cancel = <CoverView
        style={cancelStyle}
        onClick={onCancel}
      >
        {cancelText}
      </CoverView>
    }
    return (
      <View className={`taro-cropper ${isFullScreenCss ? 'taro-cropper-fullscreen' : ''}`} style={croperStyle}>
        <Canvas
          canvasId={cropperCutCanvasId}
          style={cutCanvasStyle}
          className={`cut-canvas-item ${isFullScreenCss ? 'cut-canvas-fullscreen' : ''}`}

        />
        <Canvas
          onTouchStart={this.handleOnTouchStart}
          onTouchMove={this.handleOnTouchMove}
          onTouchEnd={this.handleOnTouchEnd}
          canvasId={cropperCanvasId}
          style={canvasStyle}
          className={`canvas-item ${isFullScreenCss ? 'canvas-fullscreen' : ''}`}
          disableScroll
        >
        </Canvas>
        {
          !hideFinishText &&
          finish
        }
        {
          !hideCancelText &&
            cancel
        }
      </View>

    );
  }
}

export default TaroCropperComponent;
