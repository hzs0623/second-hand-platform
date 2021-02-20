const { Utils, Tips } = require('../../utils');
const db = require('../../db');

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
    let total = 0;
    try {
      // 查询出当前用户发布的商品
      const shopLists = await db.query(`SELECT * FROM ${shopTable} WHERE uid=? and display!=0 limit ${curPage},${pageSize} `, [uid]);

      let list = [];
      for (let i = 0; i < shopLists.length; i++) {
        const { id: sid, title, price, sort, image, information } = shopLists[i]; // 商品信息

        const buyItem = await db.query(`SELECT * FROM ${buyTable} WHERE sid=?`, [sid]);
        buyItem.length && total++
        buyItem.forEach(item => {
          const { uid: buyId = '', buy_method = '', shop_count = '', state = '', phone = '', shipping_address = "" } = item;
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
            information,
            shipping_address,
            phone
          })
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
  },

  // 取消订单
  async orderCancel(ctx) {
    // 删除购物表当前数据
    // 改变商品状态display=1，先获取当前商品数量 加上当前数量
    const data = Utils.filter(ctx, ['uid', 'sid']);
    const valid = Utils.formatData(data, {
      uid: 'number',
      sid: 'number',
    });

    if (!valid) return ctx.body = Tips[400];

    const { uid, sid } = data;

    try {

      //2. 接下来进行添加商品列表里面
      const shopList = await db.query(`SELECT count,uid FROM ${shopTable} where id=?`, [sid]);
      let { count, uid: curId } = shopList[0];

      let buyLists = [];
      if (uid === curId) {
        // 商家
        buyLists = await db.query(`SELECT id,state, shop_count FROM ${buyTable} WHERE sid=? and state!=3`, [sid]);
      } else {
        // 先查询当前购物车列表状态, 交易完成的不能搜索
        buyLists = await db.query(`SELECT id,state, shop_count FROM ${buyTable} WHERE uid=? and sid=? and state!=3`, [uid, sid]);
      }
      if (!buyLists.length) return ctx.body = Tips[1002];
      const { id, shop_count } = buyLists[0];
      // 删除当前在购车列表里面
      await db.query(`DELETE FROM ${buyTable} where id=?`, [id]);
      count += shop_count; // 加上去；
      //3. 设置当前商品
      await db.query(`UPDATE ${shopTable} SET count=?, display=1  where id=?`, [count, sid]);
      ctx.body = Tips[1001]
    } catch (e) {
      ctx.body = Tips[1002]
    }
  }
}
