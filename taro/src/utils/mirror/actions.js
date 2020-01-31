import { store } from './store'
import { FETCH_ACTION_NAME, TYPES, SEP, mirrorLogger } from './consts'

export const actions = {}

function actionCreator(modelName, actionName) {
  if(typeof actionName === 'symbol') {
    actionName = actionName.toString()
  }
  return data => {
    store.dispatch({
      type: `${modelName}${SEP}${actionName}`,
      data
    })
  }
}

function enhanceEffect(modelName, effectName, effectFunc) {
  const action = getAction(modelName)
  return async (...args) => {
    let data = null
    action[FETCH_ACTION_NAME]({ key: effectName, type: TYPES.REQUESTING, value: true })
    try {
      data = await effectFunc.call(action, ...args )
      action[FETCH_ACTION_NAME]({ key: effectName, type: TYPES.SUCCESS, value: data })
    } catch(e) {
      action[FETCH_ACTION_NAME]({ key: effectName, type: TYPES.FAILURE, value: e })
      throw e
    }
    return data
  }  
}

function each(obj, callback) {
  Object.keys(obj).forEach(callback)
  Object.getOwnPropertySymbols(obj).forEach(callback)
}

export function addActions(modelName, reducers = {}, effects = {}, children = null) {
  actions[modelName] = actions[modelName] || {}
  each(reducers, actionName => {
    if (actions[modelName][actionName]) {
      mirrorLogger.warn(`Notice: ${actionName} has been used! It will override the previous ${actionName}`)
    }
    actions[modelName][actionName] = actionCreator(modelName, actionName)
  })

  each(effects, effectName => {
    if (actions[modelName][effectName]) {
      mirrorLogger.warn(`Notice:  ${effectName} has been used! It will override the previous ${effectName}`)
    }
    actions[modelName][effectName] = enhanceEffect(modelName, effectName, effects[effectName])
  })

  if (children) {
    Object.keys(children).forEach((key) => {
      actions[modelName][key] = actions[children[key]]
    })
  }
}

export function getAction(name) {
  return actions[name]
}