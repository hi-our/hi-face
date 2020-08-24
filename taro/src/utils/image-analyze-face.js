export const getResCode = (res) => {
  const { errMsg, data } = res
  if (errMsg.includes(':ok')) {
    if (data) {
      if (Object.keys(data).length === 0) return {} // 某些接口判断返回data字段是否是空对象的逻辑
      return data
    } else {
      throw res.data
    }
  } else {
    throw res
  }
}

export const imageAnalyzeFace = async (base64Main) => {
  try {
    const res = await wx.serviceMarket.invokeService({
      service: 'wx2d1fd8562c42cebb',
      api: 'analyzeFace',
      data: {
        Action: 'AnalyzeFace',
        Image: base64Main
      },
    })

    let data = getResCode(res)
    return data
  } catch (error) {
    console.log('error2 :', error)
    throw error
  }
}

