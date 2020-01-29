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
        <h2>BNK48 Facial Recognition App</h2>
        <h4>
          Single Page App for face detection and recognition of BNK48 idol
          group, running in front-end browser using React and{' '}
          <a href="https://github.com/justadudewhohacks/face-api.js">
            face-api.js
          </a>{' '}
          (without back-end)
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
          <h3>How to Use</h3>
          <p>
            This App try to detect all faces from input image and recognize if
            any faces are BNK48 member. Member's name will be displayed under
            face box if recognized. Only the current members (as of December
            2018) are listed for this App to recognize.
          </p>
          <div>
            <ul>
              <h4>Requirement:</h4>
              <li>
                Support any PC browser with Javascript enabled (Chrome, IE,
                Safari)
              </li>
              <li>Support Android phone for Photo Input and Video Camera</li>
              <li>Support Iphone on Safari and Chrome only for Photo Input</li>
              <li>Not support older smartphone (such as Iphone4)</li>
            </ul>
            <ul>
              <h4>Photo Input:</h4>
              <li>Input image can be image file or URL</li>
              <li>Image file must be jpg, jpeg, or png format</li>
              <li>
                Image URL host should allow cross-origin requests (CORS) or else
                the App will not be able to access the image. (any facebook
                images are good for testing with this App)
              </li>
              <li>
                The App will try to detect all faces, which might take few
                seconds depend on how many faces are in the image.
              </li>
              <li>
                Face detection can be difficult if the object face is tilted,
                too large or too small, and/or blurry face.
              </li>
              <li>
                The App might recognize member wrongly if their face look
                similar, or the object face does not look straight to camera.
              </li>
              <li>
                This App may not work well for older smartphone or in some
                browsers. (I found my Iphone4 cannot process detection properly,
                while iphone7 or 8 are working fine.)
              </li>
            </ul>
            <ul>
              <h4>Video Camera:</h4>
              <li>
                Video Input works well with PC webcam or Android phone's camera.
              </li>
              <li>
                Currently Iphone camera is not supported for live detection in
                this App.
              </li>
              <li>
                App will try to detect and recognize any faces, but performance
                depends on CPU of the device.
              </li>
              <li>
                Detection and Recognition with PC webcam can be fast, while
                working on smartphone can be slower.
              </li>
            </ul>
            <ul>
              <h4>Reference:</h4>
              <li>
                Find more information of my code and API in{' '}
                <a href="https://github.com/supachaic/bnk48-face-recognition">
                  My Repo
                </a>
              </li>
              <li>
                Tutorial for this App in my Medium:{' '}
                <a href="https://medium.com/@supachaic/facial-recognition-spa-for-bnk48-idol-group-using-react-and-face-api-js-ad62b43ec5b6">
                  Facial Recognition SPA for BNK48 Idol group using React and
                  face-api.js
                </a>
              </li>
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
