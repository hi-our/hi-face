/**
 * 根据我当前的圣诞帽元素进行一些偏移(我的图片大小是200*130)， 圣诞帽可佩戴部分的中心 (62,60)  这里需要微调
 * 图片可佩戴部分是 0.6 倍图片宽度
 * @param {*} x
 * @param {*} y
 */
const translateHat = (faceWidth, x, y) => {
  const picSize = { width: faceWidth / 0.6, height: (faceWidth * 0.65) / 0.6 };
  return {
    ...picSize,
    x: x - (62 * picSize.width) / 200,
    y: y - (60 * picSize.height) / 130,
  };
};

/**
 * 获取图片
 * @param {*} src 图片地址
 * @param {*} callback
 */
function getImg(src, callback) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = src;
  img.onload = () => callback(img);
}

/**
 * 绘制帽子
 * @param {*} ctx 画布实例
 * @param {{}} config 配置
 */
function drawHat(ctx, config) {
  const { headPos, angle, faceWidth } = config;
  getImg('images/hat.png', img => {
    // 保存画布绘制状态
    ctx.save();
    console.log('headPos.x, headPos.y :', headPos.x, headPos.y);
    // 画布原点移动到画帽子的地方
    ctx.translate(headPos.x, headPos.y);
    // 旋转画布到特定角度
    ctx.rotate(angle);
    // 偏移图片，使帽子中心刚好在原点
    const { x, y, width, height } = translateHat(faceWidth, 0, 0);
    // 我的圣诞帽子实际佩戴部分长度只有0.75倍整个图片长度
    ctx.drawImage(img, x, y, width, height);
    // 还原画布绘制状态，如偏移
    ctx.restore();
  });
}

/**
 * 绘制主流程
 * @param {*} canvas
 * @param {*} options
 */
export function drawing(canvas, options) {
  const { info, width = 200, height = 200, imgSrc = 'images/default.jpg' } = options;
  const ctx = canvas.getContext('2d');
  // 重置
  console.log('width, height :', width, height, ctx);
  ctx.clearRect(0, 0, width, height);
  // 先把图片绘制上去
  getImg(imgSrc, img => {
    ctx.drawImage(img, 0, 0, width, height)
    // // 循环把帽子画到对应的点上
    for (let i = 0, len = info.length; i < len; i++) {
      drawHat(ctx, info[i]);
    }
  });
}
