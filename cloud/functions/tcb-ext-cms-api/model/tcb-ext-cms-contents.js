const CloudBase = require('@cloudbase/manager-node')

module.exports = {
  async afterCreate(modelParams, context, payload) {
    const { tcb } = context

    const manager = CloudBase.init({
      envId: tcb.getCurrentEnv()
    })
    const { collectionName } = payload.data
    await manager.database.createCollectionIfNotExists(collectionName)
  },
  async afterUpdate(modelParams, context, payload) {
    const { tcb } = context

    const manager = CloudBase.init({
      envId: tcb.getCurrentEnv()
    })
    const { collectionName } = payload.data
    await manager.database.createCollectionIfNotExists(collectionName)
  }
}
