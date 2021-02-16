const { Utils, Tips, functions } = require('../../utils');
const db = require('../../db');
const buyShop = require('../shopCart/buyShop');

const shopTable = `shop_list`;
const buyTable = `buy_shop`;

module.exports = {
  // 获取订单列表
  async getOrderList(ctx) {
    const data = Utils.filter(ctx, ['uid', 'pageSize', 'curPage']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      pageSize: 'number',
      curPage: 'number',
    });

    if (!valid) return ctx.body = Tips[400];

    let { uid, curPage, pageSize } = data;

    curPage = (curPage - 1) * pageSize;
    try {
      const shopLists = await db.query(`SELECT * FROM ${shopTable} WHERE uid=? and display!=0 limit ${curPage},${pageSize} `, [uid]);
      const lists = await db.query(`SELECT COUNT(id) FROM shop_list  where display!=0 and uid=?`, [uid]);
      const total = lists.length ? lists[0]['COUNT(id)'] : 0;

      let list = [];
      for (let i = 0; i < shopLists.length; i++) {
        const { id: sid, title, price, sort, image, information } = shopLists[i]; // 商品信息
        const buyItem = await db.query(`SELECT * FROM ${buyTable} WHERE sid`, [sid]);
        const { uid: buyId = '', buy_method = '', shop_count = '', state = '' } = buyItem.length && buyItem[0];
        list.push({
          buy_uid: buyId, // 购买人id，
          buy_method,
          title,
          sid,
          price,
          sort,
          image,
          shop_count,
          state,
          information
        })
      }
      ctx.body = {
        ...Tips[1001],
        data: { list, total }
      }

    } catch (error) {
      ctx.body = Tips[1002]
    }
  },
  // 修改订单商品状态
  async orderEdit(ctx) {
    const data = Utils.filter(ctx, ['uid', 'sid', 'state']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      state: 'number',
      sid: 'number',
    });

    if (!valid) return ctx.body = Tips[400];
    const { uid, state, sid } = data;
    try {
      const str = Utils.updateFormatStr(['state', 'update_time']);
      let sqlUp = `UPDATE ${buyTable} SET ${str}  WHERE uid=? and sid=?`;

      let modSqlParams = [state, Date.now(), uid, sid];
      await db.query(sqlUp, modSqlParams);

      ctx.body = Tips[1001];
    } catch (error) {
      ctx.body = Tips[1002]
    }
  }
}
