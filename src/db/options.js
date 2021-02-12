const db = require('./index');

module.exports = class Option {
  // 插入语句
  static insert(db) {
    this._db = `INSERT INTO ${db}`;
    return this;
  }
  // 查找语句
  static select(arrs) {
    if (!arrs && !arrs.length) return ''; // 错误
    this._find = `SELECT ${arrs.join()}`; // ['1','2'] => 'username, password'
    return this;
  }
  // 选择表
  static table(db) {
    this._db = `FROM ${db}`;
    return this;
  }
  // 条件
  static where(conditions) {
    if (typeof conditions !== 'object' || !conditions.length || conditions == null) return ''; // 错误
    let arr = []
    if (Object.prototype.toString.call(conditions) === '[object Array]') {
      arr = conditions.map((item, i) => {
        if (i === 0 || i < conditions.length - 1) {
          return `${item}=?`
        } else {
          return ` and ${item}=?`
        }

      });
    } else {
      arr = Object.keys(conditions).map(key => {
        const val = conditions[key];
        return `${key} = ${val}`;
      })
    }

    let str = `WHERE ${arr.join('')}`
    return `${this._find} ${this._db} ${str}`;
  }
}
