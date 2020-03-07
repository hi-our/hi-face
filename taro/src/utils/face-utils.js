/**
 * 获取中间的点
 * @param {*} points
 */
const getMedian = points => points[Math.floor(points.length / 2)];

/**
 * 获取两点之间的中点
 * @param {*} pa
 * @param {*} pb
 */
const getMidPoint = (pa, pb) => ({
  X: (pa.X + pb.X) / 2,
  Y: (pa.Y + pb.Y) / 2,
});

/**
 * 获取两点之间距离
 * @param {*} a
 * @param {*} b
 */
const getDistance = (a, b) => Math.sqrt(Math.pow(a.X - b.X, 2) + Math.pow(a.Y - b.Y, 2));

/**
 * 获取两个眉毛中点
 * @param {*} leftPoints
 * @param {*} rightPoints
 */
const getMidPointOfEye = (leftPoints, rightPoints) =>
  getMidPoint(getMedian(leftPoints), getMedian(rightPoints));

/**
 * 获取下颌的最低点
 * @param {*} jawPoints
 */
const getJawPos = jawPoints => getMedian(jawPoints);

/**
 * 获取脸的长度 （按照三停五眼）
 * @param {*} jawPos
 * @param {*} midPointOfEyebrows
 */
const getFaceLength = (jawPos, midPointOfEyebrows) => (5 * getDistance(jawPos, midPointOfEyebrows)) / 3;

/**
 * 获取脸的宽度（即帽子宽度）
 * @param {*} outlinePoints
 */
const getFaceWidth = outlinePoints => getDistance(outlinePoints[0], outlinePoints[outlinePoints.length - 1])

/**
 * 获取脸的倾斜弧度
 * @param {*} jawPos // 获取下颌的点
 * @param {*} midPointOfEyebrows // 两眼之间的点
 */
const getFaceRadian = (jawPos, midPointOfEyebrows) =>
  Math.PI - Math.atan2(jawPos.X - midPointOfEyebrows.X, jawPos.Y - midPointOfEyebrows.Y); //弧度  0.9272952180016122

// 计算帽子的位置, 眉心和右上角顶点的中点（考虑到图片绘制是从左上角开始绘制，还需要根据图片中心做个变换）
// 知道眉心坐标（x1,y1) 知道下颌的坐标(x2, y2)，知道脸宽w，知道脸长l
/**
 * 已知K，d, 点，求另一个点
 * @param {*} k
 * @param {*} d
 * @param {*} point
 */
const getPos = (k, d, point) => {
  // 取y变小的那一边
  let y = -Math.sqrt((d * d) / (1 + k * k)) + point.Y;
  let x = k * (y - point.Y) + point.X;
  return { X: x, Y: y };
};

/**
 * 获取头顶的坐标
 * @param {*} midPos 眉心点坐标
 * @param {*} jawPos 下巴底点坐标
 */
const getHeadPos = (midPos, jawPos) => {
  // 获取线的k值
  const k = getK(midPos, jawPos);
  // 获取眉心到下颌的距离
  const distanceOfEye2Jaw = getDistance(midPos, jawPos);
  return getPos(k, distanceOfEye2Jaw / 2, midPos);
};

/**
 * 获取K值
 * @param {*} a
 * @param {*} b
 */
const getK = (a, b) => (a.X - b.X) / (a.Y - b.Y);

export function getHatInfo(results) {
  const { FaceShapeSet, ImageWidth, ImageHeight } = results 
  function getFaceInfo(leftEyeBrowPoints, rightEyeBrowPoints, outlinePoints) {
    // 获取眉心的点
    const midPointOfEyebrows = getMidPointOfEye(leftEyeBrowPoints, rightEyeBrowPoints);
    // 获取下颌的点
    const jawPos = getJawPos(outlinePoints);
    // 获取脸的倾斜角度
    const angle = getFaceRadian(midPointOfEyebrows, jawPos);
    // 获取头顶的坐标
    const headPos = getHeadPos(midPointOfEyebrows, jawPos);
    // 获取脸大小信息
    const faceLength = getFaceLength(getJawPos(outlinePoints), midPointOfEyebrows);
    const faceWidth = getFaceWidth(outlinePoints);

    return {
      midPointOfEyebrows,
      jawPos,
      headPos,
      angle,
      faceWidth,
      faceLength,
      ImageWidth, ImageHeight
    };
  }
  return FaceShapeSet.map(face => {
    const { LeftEyeBrow, RightEyeBrow, FaceProfile } = face
    console.log('FaceProfile :', FaceProfile);

    return getFaceInfo(LeftEyeBrow, RightEyeBrow, FaceProfile);
  });
}

const getMouthLeftRigthPoint = (Mouth = []) => {
  let xPoints = Mouth.map(item => item.X)
  var minX = xPoints.sort(function (a, b) {
    return a - b;
  })[0];
  var maxX = xPoints.sort(function (a, b) {
    return b - a;
  })[0];
  let leftPoint = {}
  let rightPoint = {}
  Mouth.forEach(item => {
    if (item.X === minX) leftPoint = item
    if (item.X === maxX) rightPoint = item
  })
  return {
    leftPoint,
    rightPoint
  }
}

export function getMouthInfo(results) {
  const { FaceShapeSet, ImageWidth, ImageHeight } = results 
  function getFaceInfo(leftEyeBrowPoints, rightEyeBrowPoints, outlinePoints, mouthPoint) {
    // 获取眉心的点
    const midPointOfEyebrows = getMidPointOfEye(leftEyeBrowPoints, rightEyeBrowPoints);
    // 获取下颌的点
    const jawPos = getJawPos(outlinePoints);
    // 获取脸的倾斜角度
    const angle = getFaceRadian(midPointOfEyebrows, jawPos);
    // 获取头顶的坐标
    const faceWidth = getFaceWidth(outlinePoints);


    const { leftPoint, rightPoint } = getMouthLeftRigthPoint(mouthPoint)
    const mouthMidPoint = getMidPoint(leftPoint, rightPoint)
    
    return {
      mouthMidPoint,
      leftPoint,
      rightPoint,
      angle,
      faceWidth,
      ImageWidth, ImageHeight
    }
  }
  return FaceShapeSet.map(face => {
    const { LeftEyeBrow, RightEyeBrow, FaceProfile, Mouth } = face

    return getFaceInfo(LeftEyeBrow, RightEyeBrow, FaceProfile, Mouth);
  })
}

export function getMaskShapeList(mouthList, dprCanvasWidth, shapeSize) {
  return mouthList.map(item => {
    let { faceWidth, angle, mouthMidPoint, ImageWidth } = item
    let dpr = ImageWidth / dprCanvasWidth
    const shapeCenterX = mouthMidPoint.X / dpr
    const shapeCenterY = mouthMidPoint.Y / dpr
    const scale = faceWidth / shapeSize / dpr
    const rotate = angle / Math.PI * 180

    // 角度计算有点难
    let widthScaleDpr = Math.sin(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50
    let heightScaleDpr = Math.cos(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50

    const resizeCenterX = shapeCenterX + widthScaleDpr - 2
    const resizeCenterY = shapeCenterY + heightScaleDpr - 2

    const shapeWidth = faceWidth * 1.2 / dpr

    return {
      name: 'mask',
      shapeWidth,
      currentShapeId: 1,
      timeNow: Date.now() * Math.random(),
      shapeCenterX,
      shapeCenterY,
      reserve: 1,
      rotate,
      resizeCenterX,
      resizeCenterY,
    }

  })
}

export function getHatShapeList(mouthList, dprCanvasWidth, shapeSize) {
  return mouthList.map(item => {
    console.log('item :', item);
    let { faceWidth, angle, headPos = {}, ImageWidth } = item
    let dpr = ImageWidth / dprCanvasWidth
    const shapeCenterX = headPos.X / dpr
    const shapeCenterY = headPos.Y / dpr
    const rotate = angle / Math.PI * 180
    const scale = faceWidth / shapeSize / dpr

    // // 角度计算有点难
    let widthScaleDpr = Math.sin(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50
    let heightScaleDpr = Math.cos(Math.PI / 4 - angle) * Math.sqrt(2) * scale * 50

    const resizeCenterX = shapeCenterX + widthScaleDpr - 2
    const resizeCenterY = shapeCenterY + heightScaleDpr - 2

    const shapeWidth = faceWidth / 0.6 / dpr

    return {
      categoryName: 'crown',
      shapeWidth,
      currentShapeId: 1,
      timeNow: Date.now() * Math.random(),
      shapeCenterX,
      shapeCenterY,
      reserve: 1,
      rotate,
      resizeCenterX,
      resizeCenterY,
    }

  })
}