/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
  const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
  if (typeof str === 'string' || str instanceof String) {
    return true
  }
  return false
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

/**
 * 验证手机号
 * @param {string} arg
 * @returns {Boolean}
 */
export function isMobile(arg) {
  const reg = /1[3456789]\d{9}/
  return reg.test(arg)
}

/**
 * 验证固定电话
 * @param {string} arg
 * @returns {Boolean}
 */
export function isFixedPhone(arg) {
  const reg = /^(\d{3,4}-)?\d{7,8}$|^(\d{2,3}-)?(\d{7,8})?(\d{1,4})?$/
  return reg.test(arg)
}

/**
 * 验证字母和数字
 * @param {string} arg
 * @returns {Boolean}
 */
export function isLettersAndNumbers(arg) {
  const reg = /^[A-Za-z0-9]+$/
  return reg.test(arg)
}

/**
 * 验证税号
 * @param {string} arg
 * @returns {Boolean}
 */
export function isTaxNo(arg) {
  const reg = /^[0-9A-Za-z]{10,20}$/
  return reg.test(arg)
}

/**
 * 判断字符串是null或者空字符串
 * @param {string} str
 * @returns {Boolean}
 */
export function isEmpty(str) {
  return (str == null || str == '')
}

/**
 * 验证组织机构代码
 * @param {string} arg
 * @returns {Boolean}
 */
export function isOrganizationNo(arg) {
  const reg = /[a-zA-Z0-9]{9}/
  return reg.test(arg)
}

/**
 * 验证行政区域编码
 * @param {string} arg
 * @returns {Boolean}
 */
export function isCountryCode(arg) {
  const reg = /.{6}/
  return reg.test(arg)
}
