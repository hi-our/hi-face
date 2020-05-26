const DataProvider = require('./dataProvider')
const callModelLifeCycle = require('./callModelLifeCycle')
const callWebhook = require('./callWebhook')
const checkPermission = require('./checkPermission')

module.exports = async function (modelParams, context) {
  const { resource, operate, params } = modelParams
  const { config } = context
  const dataProvider = DataProvider(context.db)
  const can = await checkPermission(modelParams, context)
  const supportWebhookOperates = ['create', 'update', 'updateMany', 'delete', 'deleteMany']
  const notSupportWebhookResources = [config.contentsCollectionName, config.usersCollectionName, config.webhooksCollectionName]
  if (can) {
    // 前置钩子
    await callModelLifeCycle('before', modelParams, context)
    // 执行数据操作
    const result = await dataProvider[operate](resource, params)
    // 后置钩子
    await callModelLifeCycle('after', modelParams, context, result)
    // 调用 Webhook
    if (supportWebhookOperates.includes(operate)
      && !notSupportWebhookResources.includes(resource)
    ) {
      await callWebhook(modelParams, context, result)
    }
    return result
  } else {
    return {
      code: 'NO_AUTH'
    }
  }
}
