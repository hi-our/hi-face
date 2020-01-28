import { addActions, getAction, actions } from './actions'
import { replaceReducer, store } from './store'
import { FETCH_ACTION_NAME, TYPES, SEP, mirrorLogger, SUBTREE, combineReducers } from './consts'

const models = []
const isRegistedModel = Symbol('isRegistedModel')

function setStateReducer(state, nextState) {
  if (!nextState) return state
  if (typeof nextState === 'function') {
    const _nextState = nextState(state)
    return _nextState || state
  }

  return { ...state, ...nextState }
}

function validateModel(m = {}) {
  const {
    name,
    reducers,
    effects
  } = m

  const isObject = target => Object.prototype.toString.call(target) === '[object Object]'

  if (!name || typeof name !== 'string') {
    throw new Error('Model name must be a valid string!')
  }

  if (name === 'routing') {
    throw new Error('Model name can not be "routing", it is used by react-router-redux!')
  }

  if (reducers !== undefined && !isObject(reducers)) {
    throw new Error('Model reducers must be a valid object!')
  }

  if (effects !== undefined && !isObject(effects)) {
    throw new Error('Model effects must be a valid object!')
  }
  return m
}

function fetchDataReducer(state, data) {
  if (data.type === TYPES.REQUESTING) {
    return {
      ...state,
      requestings: {
        ...state.requestings,
        [data.key]: true
      },
      payloads: {
        ...state.payloads,
        [data.key]: undefined
      },
      errors: {
        ...state.errors,
        [data.key]: undefined
      }
    }
  } else if (data.type === TYPES.SUCCESS) {
    return {
      ...state,
      requestings: {
        ...state.requestings,
        [data.key]: false
      },
      payloads: {
        ...state.payloads,
        [data.key]: data.value
      },
      errors: {
        ...state.errors,
        [data.key]: undefined
      }
    }
  } else if (data.type === TYPES.FAILURE) {
    return {
      ...state,
      requestings: {
        ...state.requestings,
        [data.key]: false
      },
      payloads: {
        ...state.payloads,
        [data.key]: undefined
      },
      errors: {
        ...state.errors,
        [data.key]: data.value
      }
    }
  }
  return state
}

function resolveReducers(modelName, reducers = {}) {
  let keys = Object.keys(reducers).concat(Object.getOwnPropertySymbols(reducers))
  const o = keys.reduce((acc, cur) => {
    let curString = cur
    if (typeof cur === 'symbol') {
      curString = cur.toString()
    }
    acc[`${modelName}${SEP}${curString}`] = reducers[cur]
    return acc
  }, {})
  return o
}

function getReducer(reducers, initialState = {}) {
  return (state = initialState, action) => {
    if (typeof reducers[action.type] === 'function') {
      return reducers[action.type](state, action.data)
    }
    return state
  }
}

export function combine(parent, children) {
  if (!children instanceof Array) {
    children = [children]
  }
  parent.children = children
  return parent
}

function initializeAction (node, parentName, cacheReducers) {
  node.reducers = node.reducers || {}
  node.effects = node.effects || {}
  node.initialState = node.initialState || {}
  validateModel(node)
  let fullName = parentName ? `${parentName}${SEP}${node.name}` : node.name
  let model = {
    name: fullName,
    originalName: node.name,
    reducers: { 
      ...node.reducers,
      [FETCH_ACTION_NAME]: fetchDataReducer,
      reset: node.reducers.reset ? node.reducers.reset : () => model.initialState,
      setState: node.reducers.setState ? node.reducers.setState : setStateReducer,
    },
    effects: {
      ...node.effects,
      getState: node.effects.getState ? node.effects.getState : (() => {
        if (store) {
          return parentName ? store.getState()[parentName][node.name] : store.getState()[node.name]
        }
        return {}
      }),
    }
  }
  if (Object.keys(node.effects).length > 0) {
    model.initialState = {
      requestings: {},
      payloads: {},
      errors: {},
      ...node.initialState
    }
  } else {
    model.initialState = { ...node.initialState }
  }
  const reducer = getReducer(resolveReducers(model.name, model.reducers), model.initialState)
  addActions(model.name, model.reducers, model.effects)
  cacheReducers[fullName] = reducer
}


function handle(node, parentName, level, cacheReducers) {
  initializeAction(node, parentName, cacheReducers)
  let fullName = parentName ? `${parentName}${SEP}${node.name}` : node.name
  if (node.children) {
    let combine = {}
    for (let i = 0 ; i < node.children.length; i++) {
      let child = node.children[i]
      let relativeName = child.name
      let fullChildName = parentName ? `${parentName}${SEP}${node.name}${SEP}${relativeName}`: `${node.name}${SEP}${relativeName}`
      combine[relativeName] = cacheReducers[fullChildName]
      actions[fullName][relativeName] = actions[fullChildName]
    }
    let chilrenReducer = combineReducers(combine)
    let selfReducer = cacheReducers[fullName]
    let reducer = function (state, action) {
      let nextSelfState = selfReducer(state, action)
      const childrenstate = chilrenReducer(nextSelfState, action)
      let nextState = { ...nextSelfState, ...childrenstate }
      return nextState
    }
    cacheReducers[fullName] = reducer
  }
  if (level === 0) { // 如果是顶层
    const _model = {
      name: node.name,
      reducer: cacheReducers[fullName]
    }
    models.push(_model)
    node[isRegistedModel] = true
    replaceReducer({
      [node.name]: cacheReducers[fullName]
    })
  }
}

function tranverse(node, parentName = '', level = 0, cacheReducers) {
  let nextParentName = parentName ? `${parentName}${SEP}${node.name}`: node.name
  let nextLevel = level + 1
  if (node.children) {
    for ( var i = 0; i < node.children.length; i++) {
      tranverse(node.children[i], nextParentName, nextLevel, cacheReducers)
    }
  }
  handle(node, parentName, level, cacheReducers)
}

export default function model(m) {
  if(m[isRegistedModel]) {
    return
  }
  if (models.find(item => item.name === m.name)) {
    mirrorLogger.error(`the ${m.name} has already registered, please change another module name`)
    return
  }
  let cacheReducers = {}
  let parentName = ''
  let level = 0
  tranverse(m, parentName, level, cacheReducers)
  cacheReducers = null
  return getAction(m.name)
}

export function getModels() {
  return models
}
