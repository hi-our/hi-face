const FACE_CODE = {
  'FailedOperation.ConflictOperation': '操作冲突，请勿同时操作相同的Person。',
  'FailedOperation.DetectNoFace': '未检测到人脸。',
  'FailedOperation.FreqCtrl': '操作太频繁，触发频控，请稍后重试。',
  'FailedOperation.ImageDecodeFailed': '图片解码失败。',
  'FailedOperation.ImageDownloadError': '图片下载错误。',
  'FailedOperation.InnerError': '服务内部错误，请重试。',
  'FailedOperation.RequestEntityTooLarge': '整个请求体太大（通常主要是图片）。',
  'FailedOperation.RequestTimeout': '后端服务超时。',
  'InvalidParameterValue.FaceRectInvalidFirst': '第1个人脸框参数不合法。',
  'InvalidParameterValue.FaceRectInvalidSecond': '第2个人脸框参数不合法。',
  'InvalidParameterValue.FaceRectInvalidThrid': '第3个人脸框参数不合法。',
  'InvalidParameterValue.ImageSizeExceed': '图片数据太大。',
  'InvalidParameterValue.ParameterValueError': '参数不合法。',
}

module.exports = {
  FACE_CODE
}

