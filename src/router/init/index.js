const { Utils, Tips, functions } = require('../../utils');
const db = require('../../db');

const table = `init_map`;

module.exports = {
  // 查询
  async getInit(ctx) {
    const sql = `SELECT * FROM ${table}`;
    try {
      const res = await db.query(sql);
      let { sort_map } = res[0];
      sort_map = JSON.parse(sort_map);
      ctx.body = {
        ...Tips[1001],
        data: {
          sort_map
        }
      }
    } catch (e) {
      ctx.body = Tips[1002]
    }
  },
}