const tcb = require('tcb-admin-node')
const callModel = require('./lib/callModel')

module.exports.main = async (event, context) => {
  const envId = context.namespace
  const app = tcb.init({
    env: envId
  })

  const db = tcb.database({
    env: envId
  })

  const { resource, operate, params } = event

  console.log(resource, operate, params)

  return callModel(
    {
      resource,
      operate,
      params
    },
    // 上下文
    {
      tcb,
      app,
      db,
      callModel,
      config: {
        contentsCollectionName: 'tcb-ext-cms-contents',
        usersCollectionName: 'tcb-ext-cms-users',
        webhooksCollectionName: 'tcb-ext-cms-webhooks'
      }
    }
  )
}
