const { Utils, Tips } = require('../../utils');
const db = require('../../db');
const md5 = require('md5'); // 加密
const table = `user`;

// 修改密码
const editUserPassword =async (ctx) => {
  try {
    const data = Utils.filter(ctx, ['uid', 'old_password', 'password']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      old_password: 'string',
      password: 'string',
    });
    if(!valid) return ctx.body = Tips[400];
    const { uid, password, old_password,  } = data;
    const val = await db.query(`SELECT uid FROM ${table} WHERE uid=? and password=?`, [uid, md5(md5(old_password))], true);
    if(!val) return ctx.body = Tips[1009]; // 密码错误

    let sqlUp = `UPDATE ${table} SET password=?,update_time=? WHERE uid = ?`;
    await db.query(sqlUp, [md5(md5(password)),Date.now(),uid]);
    ctx.body = Tips[1001];
  } catch(e) {
    ctx.body = Tips[1002]
  }
}

module.exports = {
  editUserPassword
}