import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  loadModels,
  getFullFaceDescription,
  isFaceDetectionModelLoaded
} from '../../api/face';

// import DrawBox from '../../components/draw-box';
import ShowDescriptors from '../../components/show-descriptors';
import { getHatInfo } from '../../utils/utils'
import { drawing } from '../../utils/drawing'
import * as faceapi from 'face-api.js';

const MaxWidth = 600;
// const boxColor = '#BE80B5';
const testImg = require('../../img/test.jpg');
const oneFaceImage = require('../../img/one_face.jpeg');

const INIT_STATE = {
  url: null,
  imageURL: null,
  fullDesc: null,
  imageDimension: null,
  error: null,
  loading: false
};


class ChristmasHat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...INIT_STATE,
      faceMatcher: null,
      showDescriptors: false,
      WIDTH: null,
      HEIGHT: 0,
      isModelLoaded: !!isFaceDetectionModelLoaded()
    };
  }

  componentDidMount() {
    this.resetState();
    let _W = document.documentElement.clientWidth;
    if (_W > MaxWidth) _W = MaxWidth;
    this.setState({ WIDTH: _W });
    this.mounting();
  }

  mounting = async () => {
    await loadModels();
    await this.getImageDimension(oneFaceImage);
    await this.setState({ imageURL: oneFaceImage, loading: true });
    await this.handleImageChange(oneFaceImage);
  };

  resetState = () => {
    this.setState({ ...INIT_STATE });
  };

  handleFileChange = async event => {
    if (event.target.files.length > 0) {
      this.resetState();
      await this.setState({
        imageURL: URL.createObjectURL(event.target.files[0]),
        loading: true
      });
      this.handleImageChange();
    }
  };

  handleImageChange = async (image = this.state.imageURL) => {
    await this.getImageDimension(image);
    await getFullFaceDescription(image).then(fullDesc => {
      if (fullDesc.length) {
        faceapi.matchDimensions(this.canvasRef, this.imageRef);
        const resizedResults = faceapi.resizeResults(fullDesc, this.imageRef);
        console.log('fullDesc :', fullDesc, resizedResults);
        const info = getHatInfo(resizedResults);
        faceapi.draw.drawFaceLandmarks(this.canvasRef, resizedResults)  // 直接画出识别的的特征点
        const { detection = {} } = resizedResults[0]
        const { _imageDims } = detection
  
        drawing(this.canvasRef, {
          info,
          imgSrc: image,
          width: _imageDims.width,
          height: _imageDims.height,
        });
      }
      this.setState({ fullDesc, loading: false });
    }).catch(error => {
      console.log('error :', error);
    })
  };

  getImageDimension = imageURL => {
    let img = new Image();
    img.onload = () => {
      let HEIGHT = (this.state.WIDTH * img.height) / img.width;
      this.setState({
        HEIGHT,
        imageDimension: {
          width: img.width,
          height: img.height
        }
      });
    };
    img.src = imageURL;
  };

  handleURLChange = event => {
    this.setState({ url: event.target.value });
  };

  handleButtonClick = async () => {
    this.resetState();
    let blob = await fetch(this.state.url)
      .then(r => r.blob())
      .catch(error => this.setState({ error }));
    if (!!blob && blob.type.includes('image')) {
      this.setState({
        imageURL: URL.createObjectURL(blob),
        loading: true
      });
      this.handleImageChange();
    }
  };

  render() {
    const {
      WIDTH,
      HEIGHT,
      imageURL,
      fullDesc,
      showDescriptors,
      isModelLoaded,
      error,
      loading
    } = this.state;

    // Display working status
    let status = <p>状态：面部识别库加载中 {isModelLoaded.toString()}</p>;
    if (!!error && error.toString() === 'TypeError: Failed to fetch') {
      status = (
        <p style={{ color: 'red' }}>Status: Error Failed to fetch Image URL</p>
      );
    } else if (loading) {
      status = <p style={{ color: 'blue' }}>状态：加载中</p>;
    } else if (!!fullDesc && !!imageURL && !loading) {
      if (fullDesc.length > 0) {
        status = <p>状态: 识别到{fullDesc.length}个人脸</p>;
      } else {
        status = <p>状态: 未识别到人脸</p>;
      }

    }

    // Loading Spinner
    let spinner = (
      <div
        style={{
          margin: 0,
          color: '#BE80B5',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          textShadow: '2px 2px 3px #fff'
        }}
      >
        <div className="loading" />
        <h3>识别中</h3>
      </div>
    );

    let showResult = !loading && fullDesc && fullDesc.length > 0

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {status}
        <div
          style={{
            position: 'relative',
            width: WIDTH,
            height: HEIGHT
          }}
        >
          {!!imageURL ? (
            <div
              style={{
                position: 'relative'
              }}
            >
              <div style={{ position: 'absolute' }}>
                <img ref={img => this.imageRef = img} style={{ width: WIDTH, display: !showResult ? '' : 'none' }} src={imageURL} alt="imageURL" />
                <canvas ref={canvas => this.canvasRef = canvas} style={{ width: WIDTH, display: showResult ? '' : 'none' }}></canvas>
              </div>
              {/* {!!fullDesc ? (
                <DrawBox
                  fullDesc={fullDesc}
                  faceMatcher={faceMatcher}
                  imageWidth={WIDTH}
                  boxColor={boxColor}
                />
              ) : null} */}
            </div>
          ) : null}
          {loading ? spinner : null}
        </div>
        <div
          style={{
            width: WIDTH,
            padding: 10,
            border: 'solid',
            marginTop: 10
          }}
        >
          <p>请上传图片或输入图片URL</p>
          <input
            id="myFileUpload"
            type="file"
            onChange={this.handleFileChange}
            accept=".jpg, .jpeg, .png"
          />
          <br />
          <div className="URLInput">
            <input
              type="url"
              name="url"
              id="url"
              placeholder="Place your photo URL here (only .jpg, .jpeg, .png)"
              pattern="https://.*"
              size="30"
              onChange={this.handleURLChange}
            />
            <button onClick={this.handleButtonClick}>上传</button>
          </div>
          {/* <div>
            <input
              name="descriptors"
              type="checkbox"
              checked={this.state.showDescriptors}
              onChange={this.handleDescriptorsCheck}
            />
            <label>Show Descriptors</label>
          </div> */}
          
          {!!showDescriptors ? <ShowDescriptors fullDesc={fullDesc} /> : null}
        </div>
      </div>
    );
  }
}

export default withRouter(ChristmasHat);