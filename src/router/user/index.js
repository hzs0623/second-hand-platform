// const xss = require('xss'); // 返回的数据进行包一层
const { Utils, Tips } = require('../../utils');
const md5 = require('md5'); // 加密
const db = require('../../db');

module.exports = class user {
  // 登陆
  static async login(ctx, next) {
    const data = Utils.filter(ctx.request.body, ['username', 'password']);
    const res = Utils.formatData(data, [
      { key: 'username', type: 'string' },
      { key: 'password', type: 'string' }
    ]);
    if (!res) return ctx.body = Tips[400]; // 参数错误

    const { username, password } = data;
    const sql = 'SELECT uid FROM user WHERE username=? and password=? and is_delete=0';
    const value = [username, md5(password)];

    try {
      const data = await db.query(sql, value);
      if (!data) return Tips[1006]; // 账户密码错误
      const val = data[0];
      const uid = val['uid'];
      ctx.session.uid = uid; //保存登录状态，这句代码会在浏览器中生成一个cookie
      ctx.body = { ...Tips[0], data: { uid } };
    } catch (e) {
      console.log(e);
      ctx.body = Tips[1002];
    }
  }

  static async getAuth(ctx) {
    const uid = ctx.session.uid;
    const sql = 'SELECT uid, username FROM user WHERE uid=? and is_delete=0';
    const value = [uid];
    try {
      const res = await db.query(sql, value);
      if (res && res.length > 0) {
        ctx.body = { ...Tips[0], data: res[0] };
      } else {
        ctx.body = Tips[1005]; // 请登陆
      }
    } catch (e) {
      console.log(e);
      ctx.body = Tips[1005]; // 请登陆
    }
  }
}