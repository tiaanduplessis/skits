import React from 'react'
import { extendObservable, action, computed, useStrict } from 'mobx'
import { default as mobxReact } from 'mobx-react'

const isFunction = val => typeof val === 'function'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const storeToObservable = store => {
  let obs = extendObservable({})

  extendObservable(obs, store.state || {})

  const actions = store.actions || {}
  Object.keys(actions).forEach(key => {
    extendObservable(obs, {
      [key]: action.bound(actions[key])
    })
  })

  Object.keys(store.computed || {}).forEach(key => {
    extendObservable(obs, {
      [key]: computed(store.computed[key])
    })
  })

  return obs
}

class Skits {
  constructor ({ isStrict = true } = {}) {
    useStrict(isStrict)

    this.stores = []
    this.observers = {}
    this.App = null
  }

  store (store = '') {
    assert(
      store.name && typeof store.name === 'string',
      'Skits:store - Store requires a name'
    )

    const obs = storeToObservable(store)
    this.observers[store.name] = obs
    this.stores.push(store)
  }

  router (routerFunc = null) {
    this.App = () =>
      React.createElement(mobxReact.Provider, this.observers, routerFunc())
  }

  use (plugin = () => {}, options = {}) {
    plugin(this, options)
  }
}

export const inject = view =>
  mobxReact.inject(stores => ({ stores }))(mobxReact.observer(view))

export default Skits
