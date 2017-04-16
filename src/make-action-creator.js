export default (type, meta = {}, payload = {}) => {
  const actionCreator = (...args) => {
    return {
      type,
      meta: Object.assign({}, meta, { actionParameters: Array.from(args) }),
      payload
    }
  }
  actionCreator.toString = () => type
  return actionCreator
}
