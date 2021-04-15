const { Tips } = require('../../utils');
const db = require('../../db');
const getOss = require('../../sdk');
const table = `init_map`; // 映射map

module.exports = {
  // 查询各个map
  async getInit(ctx) {
    const sql = `SELECT type_key, content FROM ${table}`;
    try {
      const res = await db.query(sql);
      let reslut = Object.create(null);
      res.forEach(item => {
        const {type_key = '', content =""} = item;
        reslut[type_key] = JSON.parse(content);
      })
      ctx.body = {
        ...Tips[1001],
        data: {
          ...reslut
        }
      }
    } catch (e) {
      ctx.body = Tips[1002]
    }
  },

  // 获取所有用户name列表
  async getUsernameList(ctx) {
    try {
      let sql = `SELECT username, uid FROM user`;
      const res = await db.query(sql);
      ctx.body = {
        ...Tips[1001],
        data: {
          username_map: res
        }
      }
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },

  // oss配置
  async getOssConfig(ctx) {
    try {
      const data = await getOss.getCredential(ctx.query);
      ctx.body = {
        ...Tips[1001],
        data
      }
    } catch (e) {
      ctx.body = Tips[1002];
    }
  }
}