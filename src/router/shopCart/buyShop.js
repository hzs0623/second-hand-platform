/**
 * 当前用户购买商品
 **/ 
const { Utils, Tips } = require('../../utils');
const db = require('../../db');

const table = `buy_shop`; // 映射map

module.exports = {
  // 购买商品
  async paymentShop(ctx) {
    const data = Utils.filter(ctx, ['uid', 'shopList', 'buy_method', 'shipping_address', 'phone']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      shopList: 'array',
      buy_method: 'number', // 支付方式
      shipping_address: 'string', // 收货地址
      phone: 'number',
    });
    if (!valid) return ctx.body = Tips[400];

    try {
      const { uid, shopList, buy_method, shipping_address = '', phone = "" } = data;
      for (let i = 0; i < shopList.length; i++) {
        const item = shopList[i];
        const { sid, shop_count, state, vendor_uid = "" } = item || {};

        // 改变商品列表为被购买状态
        const shops = await db.query(`SELECT count,display FROM shop_list WHERE id=${sid}`);
        const { count: num, display } = shops[0];

        if (display == 2) {
          // 当前不加载
          continue;
        }

        // 添加商品
        const addSql = `INSERT INTO ${table}(uid, sid,shop_count, state, buy_method,shipping_address,phone,vendor_uid,create_time, update_time) VALUES(?,?,?,?,?,?,?,?,?,?)`;

        await db.query(addSql, [uid, sid, shop_count, state, buy_method, shipping_address, phone, vendor_uid, Date.now(), Date.now()]);

        // 删除购物车里商品
        const deteleSql = `DELETE FROM shop_cart WHERE uid=? and sid=? `;
        await db.query(deteleSql, [uid, sid]);

        if (num == shop_count) {
          // 购买数量和总数量 当前商品改变为卖完
          await db.query(`UPDATE shop_list SET display=2 WHERE id = ?`, [sid]);
        } else {
          const count_shop = num - shop_count;
          await db.query(`UPDATE shop_list SET count=? WHERE id = ?`, [count_shop, sid]);
        }
      }

      ctx.body = {
        ...Tips[1001],
        data: 'payment shop in success'
      }
    } catch (error) {
      ctx.body = Tips[1002]
    }
  },
  // 获取购买的商品列表
  async getbuyShopList(ctx) {
    const data = Utils.filter(ctx, ['uid']);
    const valid = Utils.formatData(data, {
      uid: 'number'
    });
    if (!valid) return ctx.body = Tips[400];

    try {
      let findBuySql = `SELECT * FROM ${table} WHERE uid=?`;
      const { uid } = data;
      const shopLists = await db.query(findBuySql, [uid]);
      let list = [];
      if (shopLists.length) {
        for (let i = 0; i < shopLists.length; i++) {
          const { sid, state, create_time, shop_count, buy_method } = shopLists[i];

          // 查找相应商品
          const shops = await db.query(`SELECT uid,title,price,image,level,information,count FROM shop_list WHERE id=?`, [sid]);
          const { uid: shop_uid, title, price, image, level, information, count } = shops[0];
          list.push({
            sid,
            title, price, image, level, information, count, state, create_time, shop_count, buy_method, uid: shop_uid
          })
        }
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
}