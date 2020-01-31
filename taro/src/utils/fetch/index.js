import request from './request'

export default ({ type = 'get', url, data = {}, cb }) => {
  if (!Reflect.has(request, type)) {
    console.error(`fetch: type ${type} is not a request method. and please use lower case.`)
  }

  const func = Reflect.get(request, type)
  return func({
    url,
    data,
    cb,
  })
}
