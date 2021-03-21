// 职责： 购物车
const { Utils, Tips, functions } = require('../../utils');
const db = require('../../db');

const table = `shop_cart`; // 映射map

module.exports = {
  // 添加购物车
  async addShopCart(ctx) {
    const data = Utils.filter(ctx, ['uid', 'sid', 'shop_count']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      sid: 'number',
      shop_count: 'number',
    });
    if (!valid) return ctx.body = Tips[400];

    try {
      const { sid, uid, shop_count } = data;
      // 先查询一下里面是否有 有就修改
      const findSql = `SELECT sid,uid from ${table} where sid=? and uid=?`;
      const res = await db.query(findSql, [sid, uid]);
      if (!res.length) {
        const addSql = `INSERT INTO ${table}(uid,sid,shop_count,create_time, update_time) VALUES(?,?,?,?,?)`
        await db.query(addSql, {
          ...data,
          create_time: Date.now(),
          update_time: Date.now(),
        })
      } else {
        // 修改
        let sqlUp = `UPDATE ${table} SET shop_count=? WHERE uid = ? and sid = ?`;
        await db.query(sqlUp, [shop_count, uid, sid])
      }
      ctx.body = { ...Tips[1001], data: 'add user success' }
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },
  // 查询购物车列表
  async getShopCart(ctx) {
    // 查询的同时查看商品是否被购买 如果被购买改变状态
    const data = Utils.filter(ctx, ['uid']);
    const valid = Utils.formatData(data, {
      uid: 'number'
    });
    if (!valid) return ctx.body = Tips[400];

    try {
      const findSql = `SELECT sid,shop_count FROM ${table} WHERE uid = ? and display=1 `;
      const sids = await db.query(findSql, data);
      if (!sids.length) return ctx.body = Tips[1001];
      const list = [];
      for (let i = 0; i < sids.length; i++) {
        const { sid: id, shop_count } = sids[i];

        const shops = await db.query(`SELECT * FROM shop_list WHERE id=?`, [id]);
        // 这里前端判断状态是否被购买完 如果被购买提示用户下架

        const params = {
          ...shops[0],
          shop_count
        }
        list.push(params);
      }

      ctx.body = {
        ...Tips[1001],
        data: {
          list
        }
      }
    } catch (e) {
      ctx.body = Tips[1002]
    }
  },
  // 删除购物车
  async deleteShopCart(ctx) {
    const data = Utils.filter(ctx, ['uid', 'sid']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      sid: 'number'
    });
    if (!valid) return ctx.body = Tips[400];

    try {
      const deteleSql = `DELETE FROM ${table} WHERE uid=? and sid=? `;
      await db.query(deteleSql, data);
      ctx.body = {
        ...Tips[1001],
        data: `delete shopping cart success`
      }
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },

  // 获取所有购物车列表
  async getShopCartAllList(ctx) {
    try {
      const data = Utils.filter(ctx, ['curPage', 'pageSize']);
      const valid = Utils.formatData(data, {
        curPage: 'number',
        pageSize: 'number'
      });
      if (!valid) return ctx.body = Tips[400]; // 参数错误

      let { curPage, pageSize } = data;
      curPage = (Number(curPage) - 1) * pageSize;

      const list = await db.query(`SELECT * FROM ${table} order by create_time desc limit ${curPage}, ${pageSize}`);
      const total = await db.query(`SELECT COUNT(uid) FROM ${table}`);
      ctx.body = {
        ...Tips[1001],
        data: {
          list,
          total: total.length ? total[0]["COUNT(sid)"] : 0,
        },
      }
    
    } catch(e) {
      ctx.body = Tips[1002]
    }
  },

  // 修改购物车
  async editShopCart(ctx) {

  }
}
