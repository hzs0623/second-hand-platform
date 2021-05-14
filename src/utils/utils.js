const IS = require("is")
const fs = require("fs")
const path = require("path")
const jwt = require("jsonwebtoken")

const formatToken = (data) => {
  let arr = []
  Object.keys(data).forEach((key) => {
    arr.push(`${key}=${data[key]}`)
  })
  return arr.join("&")
}

const getTokenInfo = (token = "") => {
  let arr = token.split("&")
  let obj = Object.create(null)
  arr.forEach((item) => {
    const [key, value] = item.split("=")
    obj[key] = Number(value)
  })
  return obj
}

module.exports = {
  // 过滤不需要的值
  filter(ctx, filterArr) {
    const { body = {}, query = {}, method } = ctx.request || {}
    try {
      let params = method === "POST" ? body : query
      params = JSON.parse(JSON.stringify(params))
      if (IS.object(params) && IS.array(filterArr)) {
        let data = {}
        filterArr.forEach((e) => {
          let val = params[e]
          if (
            (!IS.undefined(val) && !IS.null(val) && !IS.empty(val)) ||
            IS.array.empty(val)
          ) {
            data[e] = val
          }
        })
        return data
      }
      return params
    } catch (e) {
      console.log(e)
    }
  },
  // 校验返回的data类型
  formatData(params, valid) {
    if (!IS.object(params) || !IS.object(valid)) return false

    return !Object.keys(valid).some((key) => {
      const type = valid[key]
      let value = params[key] || ""
      let res = false
      switch (`${type}`) {
        case "number":
          value = Number(value)
          if (!IS.number(value) || IS.nan(value)) {
            res = true
          }
          break
        case "string":
          if (!IS.string(value)) {
            res = true
          }
          break
        case "array":
          if (!IS.array(value)) {
            res = true
          }
          break
        default:
          res = false
          break
      }
      return res
    })
  },
  /**
   * 更新数据格式化条件
   */
  updateFormatStr(arr) {
    const newArr = arr.map((item) => {
      return `${item} = ?`
    })
    return newArr.join(",")
  },
  /**
   * 生成token
   * @param {Object} data
   * @param {number} uid   // 用户id
   * @param {number} admin_state  // 用户权限
   */
  generateToken(obj = {}) {
    let created = Date.now() + 12 * 3600 * 1000 // 12h
    let cert = fs.readFileSync(path.join(__dirname, "../../config/pri.pem"))
    const data = formatToken(obj)

    let token = jwt.sign(
      {
        data,
        iat: created, // 过期时间
      },
      cert,
      { algorithm: "RS256" }
    )
    return token
  },
  /**
   * 校验token
   */
  verifyToken(token = "") {
    return new Promise((resolve, reject) => {
      try {
        const cert = fs.readFileSync(
          path.join(__dirname, "../../config/pub.pem")
        )
        let result = jwt.verify(token, cert, { algorithms: ["RS256"] }) || {}
        let { iat = 0 } = result,
          current = Date.now()

        current <= iat ? resolve(getTokenInfo(result.data)) : reject("")
      } catch (e) {
        reject(e)
      }
    })
  },

  // 返回有数据的字符串
  strData(params, sql) {
    // sno=? and phone=? and username=?
    let str = '';
    for(let key in params) {
      if(params[key] != null && params[key]) {
        str += `${key}='${params[key]}' and`
      }
    }
    str = str ? str : str.substring(0, str.length - 4);
    return sql ? str + sql : str;
  }
}
