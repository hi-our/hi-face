import { bindStore, createStore, store } from './store'
import { actions, getAction } from './actions'
import model, { combine } from './model'

const mirror = { model, getAction, combine }

export {
  bindStore,
  createStore,
  actions,
  store
}

export default mirror
