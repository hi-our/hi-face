const TRANS_CODE = {
  'Unknown error': '服务器内部错误，请再次请求， 如果持续出现此类错误，请通过QQ群（659268104）或工单联系技术支持团队。',
  'Service temporarily unavailable': '服务暂不可用，请再次请求， 如果持续出现此类错误，请通过QQ群（659268104）或工单联系技术支持团队。',
  'Unsupported openapi method': '调用的API不存在，请检查后重新尝试',
  'Open api request limit reached': '集群超限额',
  'No permission to access data': '无权限访问该用户数据',
  'Get service token failed': '获取token失败',
  'IAM Certification failed': 'IAM鉴权失败',
  'app not exsits or create failed': '应用不存在或者创建失败',
  'Open api daily request limit reached': '每天请求量超限额，已上线计费的接口，请直接在控制台开通计费，调用量不受限制，按调用量阶梯计费；未上线计费的接口，请通过QQ群（659268104）联系群管手动提额',
  'Open api qps request limit reached': 'QPS超限额，已上线计费的接口，请直接在控制台开通计费，调用量不受限制，按调用量阶梯计费；未上线计费的接口，请通过QQ群（659268104）联系群管手动提额',
  'Open api total request limit reached': '请求总量超限额，已上线计费的接口，请直接在控制台开通计费，调用量不受限制，按调用量阶梯计费；未上线计费的接口，请通过QQ群（659268104）联系群管手动提额',
  'Invalid parameter': '无效的access_token参数，请检查后重新尝试',
  'Access token invalid or no longer valid': 'access_token无效',
  'Access token expired': 'access token过期',
  'invalid param': '请求中包含非法参数，请检查后重新尝试',
  'not enough param': '缺少必须的参数，请检查参数是否有遗漏',
  'empty image': '图片为空，请检查后重新尝试',
  'image format error': '上传的图片格式错误，现阶段我们支持的图片格式为：PNG、JPG、JPEG、BMP，请进行转码或更换图片',
  'image size error': '上传的图片大小错误，请参考输入参数说明重新上传图片',
  'image\'s size dose not match mask\'s size': '上传的image图片大小和mask图片大小不一致，请参考输入参数说明重新上传图片',
  'image no face': '图片中没有人脸，请检查图片质量，上传有人脸的图片后重新尝试',
  'recognize error': '识别错误，请再次请求，如果持续出现此类错误，请通过QQ群（659268104）或工单联系技术支持团队',
  'internal error': '服务器内部错误，请再次请求， 如果持续出现此类错误，请通过QQ群（659268104）或工单联系技术支持团队',
  'nvalid parameter(s)': '请求中包含非法参数，请检查后重新尝试',
}

module.exports = {
  TRANS_CODE
}

