var ghpages = require('gh-pages');

console.log('开始执行发布~');

ghpages.publish('dist-h5', {
  // branch: 'master',
  repo: 'https://github.com/hi-our/hi-face.git'
}, function(params) {
    console.log('发布 params :', params);
});