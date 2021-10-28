export function App({ accessToken, appID, name, url }) {
  if (!accessToken) throw ReferenceError('missing_access_token')
  if (!appID) throw ReferenceError('missing_appID')
  if (!name) throw ReferenceError('missing_name')

  async function builds() {
    const path = '/builds'
    return await read({ accessToken, appID, path })
  }

  async function logs() {
    const path = '/logs'
    return await read({ accessToken, appID, path })
  }

  async function deploy(params) {
    if (!!params.name && !!params.zip) throw ReferenceError('missing_name_or_zip')
    await write({ accessToken, appID, params })
  }

  async function destroy() {
    const path = '/delete'
    return await write({ accessToken, appID, path })
  }

  return {
    builds,
    logs,
    deploy,
    destroy,
    env: env({ accessToken, appID }),
    staticAssets: staticAssets({ accessToken, appID }),
    appID,
    url
  }

  function env({ accessToken, appID }) {
    async function get() {
       return await read({
         accessToken,
         appID,
         path: '/env'
      })
    }

    async function set({ key, value }) {
      if (!key) throw ReferenceError('missing_key')
      if (!value) throw ReferenceError('missing_value')
      return await write({
        accessToken,
        appID,
        path: '/env',
        params: { [key]: value }
      })
    }

    async function destroy({ key }) {
      if (!key) throw ReferenceError('missing_key')
      return await write({
        accessToken,
        appID,
        path: '/env/delete',
        params: { envs: [ key ] }
      })
    }

    return {
      get,
      set,
      destroy
    }
  }

  function staticAssets({ accessToken, appID }) {
    async function get(params) {
      const path = '/static'
      if (params && params.name) {
        path += params.name
      }
      return await read({
        accessToken,
        appID,
        path
      })
    }

    async function set({ name, body, meta, cache, type }) {
      if (!name) throw ReferenceError('missing_name')
      if (!body) throw ReferenceError('missing_body')

      return await write({
        accessToken,
        appID,
        path: '/static' + name,
        params: { body, meta, cache, type }
      })
    }

    async function destroy({ name }) {
      if (!name) throw ReferenceError('missing_name')

      return await write({
        accessToken,
        appID,
        path: '/static/' + name,
        params: { destroy: true }
      })
    }

    return {
      get,
      set,
      destroy
    }
  }
}

async function create({ accessToken, name, zip }) {
  if (!name) throw ReferenceError('missing_name')
  if (!zip) throw ReferenceError('missing_zip')
  if (!accessToken) throw ReferenceError('missing_access_token')

  const result = await write({
    accessToken,
    params: { name, zip }
  })

  if (result.errors) {
    const err = new Error('create_failed')
    err.raw = result.errors
    throw err
  }

  return App({
    accessToken,
    ...result
  })
}

async function find({ accessToken, appID }) {
  if (!accessToken) throw ReferenceError('missing_access_token')
  if (!appID) throw ReferenceError('missing_appID')

  try {
    const record = await read({
      accessToken,
      appID
    })

    return App({ accessToken, ...record })
  }
  catch (err) {
    return err.message
  }
}

async function list({ accessToken }) {
  if (!accessToken) throw ReferenceError('missing_access_token')

  try {
    const { apps } = await read({ accessToken })

    return apps.map(app => App({
      accessToken,
      ...app
    }))
  }
  catch (err) {
    return err.body
  }
}

function getBase () {
  const isProd = process.env.NODE_ENV === 'production'
  return `${isProd ? 'api' : 'staging-api'}.begin.com`
}

async function read({ accessToken, appID, path }) {
  try {
    const base = getBase()
    let url = `https://${base}/apps`
    if (appID) url += '/' + appID
    if (path) url += path
    const result = await fetch(
      url, {
      headers: {
        authorization: `bearer ${accessToken}`
      },
      data: {}
    })
    return result.body
  }
  catch (err) {
    return err.body
  }
}

async function write({ accessToken, appID, path, params }) {
  try {
    const base = getBase()
    let url = `https://${base}/apps`
    if (appID) {
      url += '/' + appID
    }
    if (path) {
      url += path
    }

    const result = await fetch(
      url, {
      headers: {
        authorization: `bearer ${accessToken}`
      },
      data: params
    })

    return result.body
  }
  catch (err) {
    return err.body
  }
}

App.create = create
App.find = find
App.list = list
