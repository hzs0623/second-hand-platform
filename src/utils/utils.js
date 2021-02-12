const Tips = require('./tip');
const IS = require('is');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

module.exports = {
  // 过滤不需要的值
  filter(ctx, filterArr) {
    const { body = {}, query = {}, method } = ctx.request || {};
    try {
      let params = method === "POST" ? body : query;
      params = JSON.parse(JSON.stringify(params));
      if (IS.object(params) && IS.array(filterArr)) {
        let data = {};
        filterArr.forEach(e => {
          let val = params[e];
          if (!IS.undefined(val) && !IS.null(val) && !IS.empty(val) || IS.array.empty(val)) {
            data[e] = val;
          }
        });
        return data;
      }
      return params;
    } catch (e) {
      console.log(e);
    }
  },
  // 校验返回的data类型
  formatData(params, valid) {
    if (!IS.object(params) || !IS.object(valid)) return false;

    return !Object.keys(valid).some(key => {
      const type = valid[key];
      let value = params[key] || '';
      let res = false;
      switch (`${type}`) {
        case "number":
          value = Number(value);
          if (!IS.number(value) || IS.nan(value)) {
            res = true;
          }
          break;
        case 'string':
          if (!IS.string(value)) {
            res = true;
          }
          break
        default:
          res = false;
          break;
      }
      return res;
    })
  },
  /**
   * 格式化条件
  */
  formatStr(arr) {
    const newArr = arr.map(item => {
      return `${item} = ?`;
    });
    return newArr.join(',');
  },
  /**
   * 生成token
   * @param {string} data 
   */
  generateToken(data) {
    let created = Math.floor(Date.now() / 1000);
    let cert = fs.readFileSync(path.join(__dirname, '../config/pri.pem'));
    let token = jwt.sign({
      data,
      exp: created + 3600 * 24     // 过期时间  一天
    }, cert, { algorithm: 'RS256' });
    return token;
  },
  /**
   * 校验token
  */
  verifyToken(token) {
    let cert = fs.readFileSync(path.join(__dirname, '../config/pub.pem')), res = {};
    try {
      let result = jwt.verify(token, cert, { algorithms: ['RS256'] }) || {};
      let { exp = 0 } = result, current = Math.floor(Date.now() / 1000);
      if (current <= exp) {
        res = result.data || {};
      }
    } catch (e) {
      console.log(e);
    }
    return res;

  }
}


