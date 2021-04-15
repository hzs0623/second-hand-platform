const { Utils, Tips, functions } = require('../../utils');
const md5 = require('md5'); // 加密
const db = require('../../db');
const table = `user`;

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
  // 查询所有用户
  static async getUserList(ctx) {
    try {
      const data = Utils.filter(ctx, ['curPage', 'pageSize']);
      const valid = Utils.formatData(data, {
        curPage: 'number',
        pageSize: 'number'
      });
      if (!valid) return ctx.body = Tips[400]; // 参数错误

      const { uid } = ctx.state || {};
      const curUser = await db.query(`SELECT admin_state FROM ${table} WHERE uid=? `, uid);
      const { admin_state } = curUser[0];

      let { curPage, pageSize } = data;
      curPage = (Number(curPage) - 1) * pageSize;

      // 查询字段
      const findConditions = ['username', 'admin_state', 'uid', 'create_time', 'update_time', 'gender', 'shipping_address', 'sno', 'real_name', 'phone'];

      const sql = `SELECT ${findConditions.join()} FROM ${table} WHERE uid!=? and admin_state < ? order by uid desc limit ${curPage}, ${pageSize}`;

      const findDatas = [uid,admin_state];

      let list = await db.query(sql, findDatas) || []; // 总列表
      const lists = await db.query(`SELECT COUNT(uid) FROM ${table} WHERE uid!=? and admin_state <= ?`, findDatas);
      
      const total = lists.length ? lists[0]['COUNT(uid)'] : 0;
      ctx.body = { ...Tips[1001], data: { list, total } };
    } catch(e) {
      ctx.body = Tips[1002];
    }
  }
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
      password = md5(md5(password));

      const isUser = await formatUser({ username, password }, ['username']);
      if (!isUser.length) return ctx.body = Tips[1006];

      const sql = 'SELECT uid, username, admin_state FROM user WHERE username=? and password=? ';
      const value = [username, password];
      const userData = await db.query(sql, value);
      const val = userData[0];
      const { uid, username: name = "", admin_state = ""  } = val;
      // 生成token
      const token = Utils.generateToken({uid, admin_state});
      ctx.body = { ...Tips[1001], data: { user: name, uid, token, admin_state } };
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
    const value = [username, md5(md5(password)), Date.now(), Date.now()];
    const sql = `INSERT INTO user(username,password,create_time, update_time) VALUES(?,?,?,?)`
    try {
      const valid = await formatUser({ username }, ['username']);

      if (valid && valid.length) {
        ctx.body = Tips[1007]
        return;
      }

      await db.query(sql, value);
      ctx.body = { ...Tips[1001], data: 'add user success' }
    } catch (e) {
      ctx.body = Tips[1002];
    }
  }

  // 修改个人信息
  static async userEdit(ctx) {
    const data = Utils.filter(ctx, ['uid', 'username', 'phone', 'real_name', 'sno', 'gender', 'avatar', 'shipping_address']);
    const valid = Utils.formatData(data, {
      uid: "number",
      username: 'string',
      phone: 'number',
      real_name: 'string',
      sno: 'number',
      gender: 'number',
      avatar: 'string',
      shipping_address: 'string'
    });
    if (!valid) return ctx.body = Tips[400]; // 参数错误

    try {
      const { uid, username, phone, real_name, sno, gender, shipping_address = '', avatar = '' } = data;

      // 查找用户名是否重复
      const validUsername = await db.query(`SELECT uid FROM ${table} WHERE uid!=${uid} and username=?`, [username]);

      if (validUsername && validUsername.length > 0) {
        ctx.body = Tips[1007]
        return;
      }


      const str = Utils.updateFormatStr(['username', 'phone', 'real_name', 'sno', 'gender', 'shipping_address', 'avatar', 'update_time']);
      let sqlUp = `UPDATE ${table} SET ${str} WHERE uid = ?`;
      await db.query(sqlUp, [username, phone, real_name, sno, gender, shipping_address, avatar, Date.now(), uid]);
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

  // 用户信息校验
  static async userInfoValid(ctx) {
    const data = Utils.filter(ctx, ['username', 'phone']);
    const valid = Utils.formatData(data, {
      username: 'string',
      phone: 'number',
    })
    if (!valid) return ctx.body = Tips[400];

    try {
      const { username, phone } = data;
      // 查询数据库 是否有当前账号 
      const user = await db.query(`SELECT uid,username FROM ${table} WHERE username=? and phone=?`, [username, phone]);
      if (user.length === 0) {
        ctx.body = Tips[1009]; // 账号异常 没有
        return;
      }

      ctx.body = {
        ...Tips[1001],
        data: {
          info: user[0]
        }
      }

    } catch (error) {
      ctx.body = Tips[1002];
    }
  }
}