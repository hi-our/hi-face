import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {
  render() {
    return (
      <header>
        <div className="Navbar">
          <Link to="/">首页</Link>
          <Link to="/christmas-hat">圣诞帽</Link>
          <Link to="/photo">图片识别</Link>
          <Link to="/camera">实时识别</Link>
        </div>
      </header>
    );
  }
}

export default Header;
