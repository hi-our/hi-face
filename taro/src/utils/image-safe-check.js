export const getResCode = (res) => {
  const { errMsg, data = {} } = res
  if (errMsg.includes(':ok')) {
    if (data.Response) {
      const finalResult = data.Response
      if (Object.keys(finalResult).length === 0) return finalResult || {} // 某些接口判断返回data字段是否是空对象的逻辑
      return finalResult
    } else {
      throw res.data
    }
  } else {
    throw res
  }
}

const getCheckResult =(data) => {
  const { Suggestion, PoliticsResult = {}, PornResult = {}, TerrorismResult = {} } = data

  let result = {}

  if (Suggestion === 'PASS') {
    result.status = 0
    result.data = { isSuccess: true }
    result.message = ''
  } else if (PoliticsResult.Suggestion !== 'PASS' || PornResult.Suggestion !== 'PASS' || TerrorismResult.Suggestion !== 'PASS') {
    result.status = -87014
    result.message = '存在违禁图片'
  } else {
    result.status = -1002
    result.message = '请求失败'
  }

  console.log('审核结果result :', result);
  if (result.status) {
    throw result
  }
  return result

}

export const imgSecCheck = async (base64Main) => {
  try {
    const res = await wx.serviceMarket.invokeService({
      service: 'wxee446d7507c68b11',
      api: 'imgSecCheck',
      clientMsgId: 'id' + parseInt(Math.random() * 10000),
      data: {
        Action: 'ImageModeration',
        Scenes: ['PORN', 'POLITICS', 'TERRORISM'],
        ImageBase64: base64Main,
        Config: '',
        Extra: ''
      }
    })

    console.log('res :>> ', res);
    let data = getResCode(res)
    let result = getCheckResult(data)
    console.log('result :>> ', result);
    return result
  } catch (error) {
    console.log('error2 :', error)
    throw {
      status: 87014,
      message: '图中包含违规内容，请更换'
    }
  }
}

