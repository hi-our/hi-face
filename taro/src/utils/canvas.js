/* eslint-disable no-unused-expressions */
/* eslint-disable operator-linebreak */

/**
 * 画圆图形
 * @export drawRoundImg
 * @param {*} ctx
 * @param {*} img
 * @param {*} x
 * @param {*} y
 * @param {*} r
 */
export function drawRoundImage(ctx, img, x, y, r) {
  ctx.save()
  let d = 2 * r
  let cx = x + r
  let cy = y + r
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x, y, d, d)
  ctx.restore()
}

/**
 * 画粗体文字的hack方法
 * @export fillBoldText
 * @param {*} ctx
 * @param {*} txt
 * @param {*} x
 * @param {*} y
 */
export function fillBoldText(ctx, txt, x, y) {
  ctx.fillText(txt, x, y + 0.5)
  ctx.fillText(txt, x + 0.5, y)
  ctx.fillText(txt, x, y)
}

/** 画文字（支持多行适配）
 * @export fillmultiLineText
 * @param {object} {
 *   ctx,
 *   x,
 *   y,
 *   maxWidth,
 *   txt,
 *   originBold,
 *   bold = false,
 *   fontSize,
 *   paddingTop = 0,
 *   firstLineX = 0 // 解决「」特殊字符定位不精准问题
 * }
 * @returns finalHeight 最后画笔所在的高度
 */
export function fillmultiLineText({
  ctx,
  x,
  y,
  maxWidth,
  txt,
  originBold,
  bold = false,
  fontSize,
  paddingTop = 0,
  firstLineX
}) {
  let isSingle = true
  let finalHeight = 0
  if (firstLineX === undefined) firstLineX = x

  if (originBold) ctx.font = `normal bold ${fontSize}px sans-serif`

  bold
    ? ctx.setFontSize(fontSize)
    : (ctx.font = `normal normal ${fontSize}px sans-serif`)

  let txtArr = txt.split('')
  let singleLine = ''
  let newTxtArr = []
  for (let i = 0; i < txtArr.length; i++) {
    let testLine = singleLine + txtArr[i]
    let metrics = ctx.measureText(testLine).width
    if (metrics > maxWidth && i > 0) {
      newTxtArr.push(singleLine)
      singleLine = txtArr[i]
    } else {
      singleLine = testLine
    }
    if (i === txtArr.length - 1) {
      newTxtArr.push(singleLine)
    }
  }

  newTxtArr.length === 1 ? (isSingle = true) : (isSingle = false)

  newTxtArr.forEach((text, i) => {
    let textX = i === 0 ? firstLineX : x
    let textY = isSingle
      ? y + paddingTop
      : y + paddingTop + i * (Math.ceil(fontSize / 2) + fontSize)

    // console.log('x', textX)

    if (originBold) {
      ctx.fillText(text, textX, textY)
    } else {
      bold
        ? fillBoldText(ctx, text, textX, textY)
        : ctx.fillText(text, textX, textY)
    }
    finalHeight =
      y + paddingTop + (i + 1) * (Math.ceil(fontSize / 2) + fontSize)
  })
  return finalHeight
}

/**
 * 画圆角矩形
 * @export roundRect
 * @param {*} ctx
 * @param {*} x
 * @param {*} y
 * @param {*} width
 * @param {*} height
 * @param {*} radius
 * @param {*} type
 */
export function drawRoundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius,
  type = 'stroke',
  shape = { tl: true, tr: true, br: true, bl: true }
) {
  let PI = Math.PI
  ctx.moveTo(x, y + radius)
  ctx.beginPath()
  shape.tl
    ? ctx.arc(x + radius, y + radius, radius, PI, 1.5 * PI)
    : ctx.arc(x, y, 0, 0, 0)
  shape.tr
    ? ctx.arc(x + width - radius, y + radius, radius, 1.5 * PI, 2 * PI)
    : ctx.arc(x + width, y, 0, 0, 0)
  shape.br
    ? ctx.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * PI)
    : ctx.arc(x + width, y + height, 0, 0, 0)
  shape.bl
    ? ctx.arc(x + radius, y + height - radius, radius, 0.5 * PI, PI)
    : ctx.arc(x, y + height, 0, 0, 0)
  ctx.closePath()
  const method = type // 默认描边，传入fill即可填充矩形
  ctx[method]()
}

/**
 * 画普通文字
 * @export fillText
 * @param {*} ctx
 * @param {*} x
 * @param {*} y
 * @param {*} width
 * @param {*} height
 * @param {*} bold
 * @param {*} fontSize
 * @param {*} color
 * @param {*} returnWidth
 */
export function fillText(
  ctx,
  txt,
  x,
  y,
  bold = false,
  fontSize,
  color,
  returnWidth = false
) {
  ctx.setFillStyle(color)
  let boldFlag = bold ? 'bold' : 'normal'
  ctx.font = `normal ${boldFlag} ${fontSize}px sans-serif`
  ctx.fillText(txt, x, y)
  if (returnWidth) {
    return ctx.measureText(txt).width
  }
}

/**
 * 画cover效果的背景图
 * @export drawCoverImage
 * @param {*} ctx
 * @param {*} bg
 * @param {*} bgWidth
 * @param {*} bgHeight
 * @param {*} canvasWidth
 * @param {*} canvasHeight
 */
export function drawCoverImage({
  ctx,
  bg,
  bgWidth,
  bgHeight,
  canvasWidth,
  canvasHeight
}) {
  const imageRatio = bgWidth / bgHeight
  const canvasRatio = canvasWidth / canvasHeight
  let sx, sy, sHeight, sWidth
  if (imageRatio < canvasRatio) {
    sWidth = bgWidth
    sHeight = sWidth / canvasRatio
    sx = 0
    sy = (bgHeight - sHeight) / 2
  } else {
    sHeight = bgHeight
    sWidth = bgHeight * canvasRatio
    sy = 0
    sx = (bgWidth - sWidth) / 2
  }
  ctx.drawImage(
    bg,
    sx,
    sy,
    sWidth,
    sHeight,
    0,
    0,
    canvasWidth,
    canvasHeight
  )
}
