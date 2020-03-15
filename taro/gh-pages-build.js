var ghpages = require('gh-pages');

console.log('开始执行发布~');

ghpages.publish('dist-h5', {
  // branch: 'master',
  repo: 'https://github.com/shenghanqin/quickly-mask.git'
}, function(params) {
    console.log('发布 params :', params);
});