import React, { Component } from 'react';
import { Route, Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import FaceRecognition from './pages/face-recognition';
import CameraFaceDetect from './pages/camera-face-detect';
import ChristmasHat from './pages/christmas-hat';
import Home from './pages/home';
import Header from './components/header-nav';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router history={createBrowserHistory({ basename: process.env.PUBLIC_URL })}>
          <div className="route">
            <Header />
            <Route exact path="/" component={Home} />
            <Route exact path="/christmas-hat" component={ChristmasHat} />
            <Route exact path="/photo" component={FaceRecognition} />
            <Route exact path="/camera" component={CameraFaceDetect} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
