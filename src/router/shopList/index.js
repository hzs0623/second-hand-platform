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
      curPage = (Number(curPage) - 1) * pageSize;

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
      let { browse_num } = res;
      browse_num = Number(browse_num) + 1;
      const str = Utils.updateFormatStr(['browse_num']);
      let sqlUp = `UPDATE ${table} SET ${str} WHERE id = ?`;
      await db.query(sqlUp, [browse_num, id]); // 每次请求增加浏览次数

      ctx.body = {
        ...Tips[1001],
        data: {
          ...res,
          browse_num
        }
      }
    } catch (e) {
      ctx.body = Tips[1002];
    }


  },
  /**
   * 增加商品
  */
  async addShop(ctx) {
    const data = Utils.filter(ctx, ['uid', 'title', 'level', 'price', 'count', 'image', 'sort', 'information']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      title: 'string',
      level: 'number',
      price: 'number',
      count: 'number',
      image: 'string',
      sort: 'number',
      information: 'string',
    });
    if (!valid) return ctx.body = Tips[400];

    try {
      const sql = `INSERT INTO ${table}(${Object.keys(data).join()},create_time) VALUES(${functions.getUpdateStr(data)}, ${Date.now()})`;
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
    try {
      const data = Utils.filter(ctx, ['id']);
      const valid = Utils.formatData(data, {
        id: 'number'
      });
      if (!valid) return ctx.body = Tips[400];

      let sql = `DELETE FROM ${table} where id=?`;
      const { id } = data;
      await db.query(sql, [id]);
      ctx.body = Tips[1001];
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },

  /**
   * 获取当前用户所有商品列表
  */
  async getByIdShopList(ctx) {
    try {
      // 过滤一下参数
      const data = Utils.filter(ctx, ['uid', 'pageSize', 'curPage']);
      const valid = Utils.formatData(data, {
        uid: 'number',
        pageSize: "number",
        curPage: "number",
      });
      if (!valid) return ctx.body = Tips[400];

      let { curPage, pageSize, uid } = data;
      curPage = (Number(curPage) - 1) * pageSize;

      const sql = `SELECT * FROM ${table} WHERE uid=? limit ${curPage}, ${pageSize}`

      const lists = await db.query(`SELECT * FROM  ${table} WHERE uid = ?`, [uid]);
      const total = lists.length;

      const res = await db.query(sql, [uid]) || [];

      ctx.body = { ...Tips[1001], data: { list: res, total } };
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },

  /**
   * 修改商品
  */
  async editShop(ctx) {
    try {
      const data = Utils.filter(ctx, ['id', 'uid', 'title', 'level', 'price', 'count', 'image', 'sort', 'information']);
      const valid = Utils.formatData(data, {
        id: 'number',
        uid: 'number',
        title: 'string',
        level: 'number',
        price: 'number',
        count: 'number',
        image: 'string',
        sort: 'number',
        information: 'string',
      });
      if (!valid) return ctx.body = Tips[400]; // 参数错误

      const { title, level, price, count, image, sort, information, id } = data;
      const str = Utils.updateFormatStr(['title', 'level', 'price', 'count', 'image', 'sort', 'information', 'update_time']);
      let sqlUp = `UPDATE ${table} SET ${str} WHERE id = ?`;

      let modSqlParams = [title, level, price, count, image, sort, information, Date.now(), id];
      await db.query(sqlUp, modSqlParams);
      ctx.body = { ...Tips[1001], data: 'edit user info success' };
    } catch (e) {
      ctx.body = Tips[1002];
    }
  }
} 