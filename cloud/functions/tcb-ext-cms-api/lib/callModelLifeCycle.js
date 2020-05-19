let firstUpperCase = ([first, ...rest]) => first.toUpperCase() + rest.join('')

module.exports = async function (stage, modelParams, context, payload) {
  const { resource, operate } = modelParams
  try {
    let model = require(`../model/${resource}`)
    let lifeCycleFunctionName = `${stage}${firstUpperCase(operate)}`

    let modelLifeCycleFunction = model[lifeCycleFunctionName]

    return modelLifeCycleFunction(modelParams, context, payload)
  } catch (e) {
  }
}
