const { Utils, Tips, functions } = require('../../utils');
const md5 = require('md5'); // 加密
const db = require('../../db');

module.exports = class user {
  // 登陆
  static async login(ctx, next) {
    try {
      const data = Utils.filter(ctx, ['username', 'password']);
      const valid = Utils.formatData(data, {
        username: "string",
        password: "string"
      });
      if (!valid) return ctx.body = Tips[400]; // 参数错误

      const { username, password } = data;
      const sql = 'SELECT uid, username FROM user WHERE username=? and password=? ';
      // const sql = options.select(['uid', 'username']).table('user').where(['username','password']);
      const value = [username, md5(password)];

      const userData = await db.query(sql, value);
      if (!userData) return Tips[1006]; // 账户密码错误
      const val = userData[0];
      const { uid, username: name = "" } = val;

      // 生成token
      const token = Utils.generateToken(uid);

      ctx.body = { ...Tips[1001], data: { user: name, token } };
    } catch (e) {
      console.log(e);
      ctx.body = Tips[1002];
    }
  }
  // 注册用户
  static async registerUser(ctx) {
    const data = Utils.filter(ctx, ['username', 'password']);
    const valid = Utils.formatData(data, {
      username: "string",
      password: "string"
    });
    if (!valid) return ctx.body = Tips[400]; // 参数错误

    const { username, password } = data;
    const value = [username, md5(password), functions.formatDate()];
    const sql = `INSERT INTO user(username,password,create_time) VALUES(?,?,?)`
    try {
      const valid = await db.query(`SELECT username FROM user WHERE username = ?`, [username]);

      if (valid && valid.length) {
        ctx.body = { ...Tips[1007], data: '用户名重复' }
        return;
      }

      await db.query(sql, value);
      ctx.body = { ...Tips[1001], data: 'add user success' }
    } catch (e) {
      ctx.body = Tips[1002];
    }
  }

  // 修改信息
  static async userEdit(ctx) {
    const data = Utils.filter(ctx, ['uid', 'password', 'phone', 'real_name', 'sno', 'gender', 'avatar']);
    const valid = Utils.formatData(data, {
      uid: "number",
      password: "string",
      phone: 'number',
      real_name: 'string',
      sno: 'number',
      gender: 'number',
      avatar: 'string'
    });
    if (!valid) return ctx.body = Tips[400]; // 参数错误
    const { uid, password, phone, real_name, sno, gender, avatar } = data;

    const str = Utils.formatStr(['password', 'phone', 'real_name', 'sno', 'gender', 'avatar', 'update_time']);
    try {
      // 查找uid是否有
      await db.query('SELECT uid FROM user WHERE uid=? ', [uid]);
      let sqlUp = `UPDATE user SET ${str} WHERE uid = ?`;
      let modSqlParams = [md5(password), phone, real_name, sno, gender, avatar, functions.formatDate(), uid];
      await db.query(sqlUp, modSqlParams);
      ctx.body = { ...Tips[1001], data: 'edit user info success' };
    } catch (e) {
      ctx.body = Tips[1002];
    }

  }
}