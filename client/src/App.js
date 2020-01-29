import React, { Component } from 'react';

import logo from './logo.svg';

import './App.css';

import { getCurrentFaceDetectionNet, isFaceDetectionModelLoaded } from './uitls/faceDetectionControls';
import * as faceapi from 'face-api.js';

class App extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));

    // 初始化
    this.run()
  }

  run = async () => {
    // 初始化face-api 这里使用ssd moblile
    await getCurrentFaceDetectionNet().load('/models/');
    // 加载Landmark模型
    await faceapi.loadFaceLandmarkModel('/models/');

    this.updateResults()
  }

  updateResults = async () => {
    // return 
    if (!isFaceDetectionModelLoaded()) {
      return;
    }
    // loading.style.display = 'none';
    const results = await faceapi.detectAllFaces(this.imgRef).withFaceLandmarks();
    console.log('results :', results);
    // faceapi.matchDimensions(canvas, inputImg);
    // const resizedResults = faceapi.resizeResults(results, inputImg);
    // console.log('resizedResults :', resizedResults);
    // const info = getHatInfo(resizedResults);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedResults)  // 直接画出识别的的特征点
    // // console.log('inputImg.src :', inputImg.src);
    // drawing(canvas, {
    //   info,
    //   imgSrc: inputImg.src,
    //   width: canvas.width,
    //   height: canvas.height,
    // });
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/world', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
  };

  

  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <img ref={img => this.imgRef = img} src="https://cc.hjfile.cn/cc/img/20200110/2020011011472209896561.png" alt="input-set" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <p>{this.state.response}</p>
        <form onSubmit={this.handleSubmit}>
          <p>
            <strong>Post to Server:</strong>
          </p>
          <input
            type="text"
            value={this.state.post}
            onChange={e => this.setState({ post: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>
        <p>{this.state.responseToPost}</p>
      </div>
    );
  }
}

export default App;
