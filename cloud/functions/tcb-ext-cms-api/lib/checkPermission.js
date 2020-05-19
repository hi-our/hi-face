module.exports = async function (modelParams, context) {
  const { resource, operate } = modelParams

  const auth = context.app.auth()
  const { db, config } = context
  const userInfo = auth.getUserInfo()

  const customUserId = userInfo.customUserId

  // 系统配置默认可读
  if (resource === config.contentsCollectionName && operate === 'getList') {
    return true
  }

  // 如果未登录不可读写
  if (!customUserId) {
    return false
  }

  // 身份信息
  const dbUsers = await db
    .collection(config.usersCollectionName)
    .where({
      userName: customUserId
    })
    .get()

  const dbUser = dbUsers.data[0]

  // 配置信息
  const dbConfigs = await db.collection(config.contentsCollectionName).get()

  // collection 白名单
  const resourceWhiteList = dbConfigs.data.map(config => config.collectionName)
  const adminWhiteList = [config.contentsCollectionName, config.webhooksCollectionName]

  // 管理员读写包含内容集合和配置集合
  if (
    dbUser.role === 'administrator' &&
    [...adminWhiteList, ...resourceWhiteList].includes(resource)
  ) {
    return true
  }

  // 运营权限
  if (dbUser.role === 'operator' && resourceWhiteList.includes(resource)) {
    return true
  }

  return false
}
