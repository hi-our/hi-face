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
  x: (pa.x + pb.x) / 2,
  y: (pa.y + pb.y) / 2,
});

/**
 * 获取两点之间距离
 * @param {*} a
 * @param {*} b
 */
const getDistance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

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
const getFaceWith = outlinePoints => getDistance(outlinePoints[0], outlinePoints[outlinePoints.length - 1])

/**
 * 获取脸的倾斜弧度
 * @param {*} jawPos
 * @param {*} midPointOfEyebrows
 */
const getFaceRadian = (jawPos, midPointOfEyebrows) =>
  Math.PI - Math.atan2(jawPos.x - midPointOfEyebrows.x, jawPos.y - midPointOfEyebrows.y); //弧度  0.9272952180016122

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
  let y = -Math.sqrt((d * d) / (1 + k * k)) + point.y;
  let x = k * (y - point.y) + point.x;
  return { x, y };
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
const getK = (a, b) => (a.x - b.x) / (a.y - b.y);

export function getHatInfo(results) {
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
    const faceWidth = getFaceWith(outlinePoints);
    return {
      midPointOfEyebrows,
      jawPos,
      headPos,
      angle,
      faceWidth,
      faceLength,
    };
  }
  return results.map(({landmarks}) => {
    const rightEyeBrowPoints = landmarks.getRightEyeBrow();
    const leftEyeBrowPoints = landmarks.getLeftEyeBrow();
    const outlinePoints = landmarks.getJawOutline();
    return getFaceInfo(leftEyeBrowPoints, rightEyeBrowPoints, outlinePoints);
  });
}
