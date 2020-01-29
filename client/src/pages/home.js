import React, { Component } from 'react';

const exampleImage = require('../img/example.jpg');

export default class Home extends Component {
  render() {
    const WIDTH = document.documentElement.clientWidth;
    return (
      <div
        style={{
          border: 'solid',
          borderRadius: 8,
          width: { WIDTH },
          margin: 10,
          padding: 5
        }}
      >
        <h2>面部识别APP</h2>
        <h4>面部识别APP，在Web浏览器上运营，基于 <a href="https://github.com/justadudewhohacks/face-api.js">
          face-api.js
          </a>
        </h4>
        <img src={exampleImage} alt="example" width="350" />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left',
            margin: 'auto',
            marginLeft: 10
          }}
        >
          <h3>如何使用</h3>
          <p>
            这个应用可以识别上传的图片，并且分析出是否是泰国 BNK48 组合成员。如果识别出，成员名称将会在面部框中显示出来。
          </p>
          <div>
            <ul>
              <h4>基本要求：</h4>
              <li>支持开启了Javascript的PC浏览器，如Chrome, IE,Safari</li>
              <li>在安卓手机上，支持照片识别和视频摄像头识别</li>
              <li>在iPhone上，只能在Safari上支持，只能识别图片</li>
              <li>不支持更老机型，如iPhone 4</li>
            </ul>
            <ul>
              <h4>图片识别</h4>
              <li>通过上传或者输入Url来设置图片</li>
              <li>图片必须是jpg、jpeg、png 格式</li>
              <li>图片Url必须允许跨域请求，否则这个APP将无法获取图片。任何Facebook上的图片在本APP上测试都是良好的。</li>
              <li>这个APP识图识别所有脸部，如果脸部过多，时间花的越久。</li>
              <li>如果物体的脸部倾斜，太大或太小和/或脸部模糊，则很难进行脸部检测。</li>
              <li>如果他们的脸看起来相似，或者对象的脸看起来不直视相机，则该应用可能会错误地识别成员。</li>
              <li>这个应用程式可能不适用于较旧的智慧型手机或某些浏览器。 （我发现我的Iphone4无法正常处理检测，而iphone7或8工作正常。</li>
            </ul>
            <ul>
              <h4>实时识别</h4>
              <li>视频输入可与PC网络摄像头或Android手机的摄像头配合使用。</li>
              <li>目前，此应用程序不支持Iphone相机进行实时检测。</li>
              <li>应用程序将尝试检测并识别任何面孔，但性能取决于设备的CPU。</li>
              <li>使用PC网络摄像头进行检测和识别可以很快，而在智能手机上工作则可以慢一些。</li>
            </ul>
            <ul>
              <h4>参考资料</h4>
              <li>如果想参看源码，也可以看<a href="https://github.com/supachaic/bnk48-face-recognition">原作者的项目</a>
              </li>
              <li>这个APP的教程，可以看《<a href="https://medium.com/@supachaic/facial-recognition-spa-for-bnk48-idol-group-using-react-and-face-api-js-ad62b43ec5b6">
                  Facial Recognition SPA for BNK48 Idol group using React and
                  face-api.js
                </a></li>
              <li>
                face-api.js API{' '}
                <a href="https://github.com/justadudewhohacks/face-api.js">
                  repo
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
