const { Utils, Tips, functions } = require('../../utils');
const md5 = require('md5'); // 加密
const db = require('../../db');

/**
 * 查询数据库
 * obj { username: 'daes'} 查询条件
 * configs ['username']返回值
 * */
async function formatUser(obj, configs) {
  let str = '';
  let arr = [];
  Object.keys(obj).forEach((key, i) => {
    if (i !== 0) {
      str += `and ${key} = ? `
    } else {
      str += `${key} = ?`
    }
    arr.push(obj[key]);
  })
  const valid = await db.query(`SELECT ${configs.join(',')} FROM user WHERE ${str}`, arr);
  return valid;
}

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

      let { username, password } = data;
      password = md5(password);
      const isUser = await formatUser({ username, password }, ['username']);
      if (!isUser.length) return ctx.body = Tips[1006];

      const sql = 'SELECT uid, username FROM user WHERE username=? and password=? ';
      const value = [username, password];
      const userData = await db.query(sql, value);
      const val = userData[0];
      const { uid, username: name = "" } = val;
      // 生成token
      const token = Utils.generateToken(uid);
      ctx.body = { ...Tips[1001], data: { user: name, uid, token } };
    } catch (e) {
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
    const value = [username, md5(password), Date.now(), Date.now()];
    const sql = `INSERT INTO user(username,password,create_time, update_time) VALUES(?,?,?,?)`
    try {
      const valid = await formatUser({ username }, ['username']);

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
    const data = Utils.filter(ctx, ['uid', 'username', 'phone', 'real_name', 'sno', 'gender', 'avatar']);
    const valid = Utils.formatData(data, {
      uid: "number",
      username: 'string',
      phone: 'number',
      real_name: 'string',
      sno: 'number',
      gender: 'number',
      avatar: 'string'
    });
    if (!valid) return ctx.body = Tips[400]; // 参数错误
    const { uid, username, phone, real_name, sno, gender, avatar = '' } = data;

    const str = Utils.updateFormatStr(['username', 'phone', 'real_name', 'sno', 'gender', 'avatar', 'update_time']);
    try {
      // 查找uid是否有
      await db.query('SELECT uid FROM user WHERE uid=? ', [uid]);

      let sqlUp = `UPDATE user SET ${str} WHERE uid = ?`;
      let modSqlParams = [username, phone, real_name, sno, gender, avatar, Date.now(), uid];
      await db.query(sqlUp, modSqlParams);
      ctx.body = { ...Tips[1001], data: 'edit user info success' };
    } catch (e) {
      ctx.body = Tips[1002];
    }

  }

  // 查询用户资料
  static async userInfo(ctx) {
    const data = Utils.filter(ctx, ['uid']);
    const valid = Utils.formatData(data, { uid: 'number' });
    if (!valid) return ctx.body = Tips[400];
    const { uid } = data;
    try {
      const sql = `SELECT * FROM user WHERE uid=?`;
      let res = await db.query(sql, [uid]);
      res = functions.splitData(res, ['password']);

      ctx.body = {
        ...Tips[1001],
        data: res
      }
    } catch (e) {
      ctx.body = Tips[1002];
    }
  }
}