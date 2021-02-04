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
    const sql = 'SELECT uid FROM t_user WHERE username=? and password=? and is_delete=0';
    const value = [username, md5(password)];

    try {
      const data = await db.query(sql, value);
      if (!data) return Tips[1006]; // 账户密码错误
      const val = data[0];
      const uid = val['uid'];
      ctx.session.uid = uid; //保存登录状态，这句代码会在浏览器中生成一个cookie
      // ctx.cookies.set('uid', uid, {
      //   maxAge: 86400000, // 过期时间 1天
      //   httpOnly: true // 告诉浏览器禁止脚本修改
      // });
      ctx.body = { ...Tips[0], data: { uid } };

    } catch (e) {
      ctx.body = Tips[1002];
    }
  }

}