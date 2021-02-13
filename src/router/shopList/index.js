const { Utils, Tips, functions } = require('../../utils');
const db = require('../../db');

const table = 'shop_list';

module.exports = {
  /**
   * 获取商品列表
  */
  async getList(ctx, next) {
    try {
      // 过滤一下参数
      const data = Utils.filter(ctx, ['pageSize', 'curPage']);
      const valid = Utils.formatData(data, {
        pageSize: "number",
        curPage: "number",
      });
      if (!valid) return ctx.body = Tips[400];

      let { curPage, pageSize, } = data;
      curPage = curPage == 1 ? 0 : curPage;
      const sql = `SELECT * FROM ${table} limit ${curPage}, ${pageSize}`
      const lists = await db.query(`SELECT COUNT(id) FROM shop_list`);
      const total = lists.length ? lists[0]['COUNT(id)'] : 0;
      const res = await db.query(sql) || [];

      ctx.body = { ...Tips[1001], data: { list: res, total } };
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },

  /**
   * 获取单个商品数据
   * */
  async getShopItem(ctx) {
    const data = Utils.filter(ctx, ['id']);
    const valid = Utils.formatData(data, { id: 'number' });
    if (!valid) return ctx.body = Tips[400];
    const { id } = data;
    try {
      let res = await db.query(`SELECT * FROM ${table} WHERE id=?`, [id]);
      res = res[0];
      ctx.body = {
        ...Tips[1001],
        data: res
      }
    } catch (e) {
      ctx.body = Tips[1002];
    }


  },
  /**
   * 增加商品
  */
  async addShop(ctx) {
    const data = Utils.filter(ctx, ['uid', 'title', 'level', 'price', 'count', 'imgage', 'sort', 'information']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      title: 'string',
      level: 'number',
      price: 'number',
      count: 'number',
      imgage: 'string',
      sort: 'number',
      information: 'string'
    });
    if (!valid) return ctx.body = Tips[400];

    try {
      const sql = `INSERT INTO ${table}(${Object.keys(data).join()}) VALUES(${functions.getUpdateStr(data)})`;
      await db.query(sql, data);
      ctx.body = Tips[1001];
    } catch (e) {
      ctx.body = Tips[1002];
    }

  },
  /**
   * 删除商品
  */
  async deleteShop(ctx) {
    const data = Utils.filter(ctx, [id]);
    const valid = Utils.formatData(data, {
      id: 'number'
    });
    if (!valid) return ctx.body = Tips[400];

    let sql = `DELETE FROM ${table} where id=?`;
    try {
      await db.query(sql, data);
      ctx.body = Tips[1001];
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },
} 