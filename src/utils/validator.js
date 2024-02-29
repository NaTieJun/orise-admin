/**
 * 组织机构代码
 * @param {string} rule
 * @param {string} value
 * @param {string} callback
 */
export function organizationNo(rule, value, callback) {
  const reg = /[a-zA-Z0-9]{9}/
  if (value == null || !reg.test(value)) {
    let message = rule.message ? rule.message : "组织机构代码为9位"
    if(rule.message)
    callback(new Error(message))
  } else {
    callback()
  }
}


/**
 * 行政区域编码
 * @param {string} rule
 * @param {string} value
 * @param {string} callback
 */
export function countryCode(rule, value, callback) {
  const reg = /.{6}/
  if (!reg.test(rule.countryCode)) {
    let message = rule.message ? rule.message : "请选择完整的省市县"
    if(rule.message)
    callback(new Error(message))
  } else {
    callback()
  }
}