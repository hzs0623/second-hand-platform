const { Utils, Tips } = require('../../utils');
const db = require('../../db');

const shopTable = `shop_list`;
const buyTable = `buy_shop`;

module.exports = {
  // 获取所有订单
  async getAllOrderList(ctx) {
    try {
      const data = Utils.filter(ctx, ['curPage', 'pageSize']);
      const valid = Utils.formatData(data, {
        curPage: 'number',
        pageSize: 'number'
      });
      if (!valid) return ctx.body = Tips[400]; // 参数错误

      let { curPage, pageSize } = data;
      curPage = (Number(curPage) - 1) * pageSize;

      const list = await db.query(`SELECT * FROM ${buyTable} order by create_time desc limit ${curPage}, ${pageSize}`);
      const total = await db.query(`SELECT COUNT(id) FROM ${buyTable}`);
   
      ctx.body = {
        ...Tips[1001],
        data: {
          list,
          total: total.length ? total[0]["COUNT(id)"] : 0,
        },
      }
    
    } catch(e) {
      ctx.body = Tips[1002]
    }
  },
  // 获取当前用户订单列表
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
      // 查询购买表有多少数量 
      const buyListOrders = await db.query(`SELECT * FROM ${buyTable} WHERE vendor_uid=? limit ${curPage},${pageSize}`, [uid]);

      // 总条数
      const totals = await db.query(`SELECT COUNT(id) FROM ${buyTable}  where vendor_uid=?`, [uid]);
      const total = totals.length ? totals[0]['COUNT(id)'] : 0;

      let obj = {}; // 判断是否重复
      const orderlists = [];
      for (let i = 0; i < buyListOrders.length; i++) {
        const { sid, uid: buyId, buy_method, shop_count, state, phone, shipping_address } = buyListOrders[i];

        let shopInfo = {}; // 商品信息
        if (sid in obj) {
          // 里面是有值的 就直接取商品属性  
          shopInfo = obj[sid];
        } else {
          const shopData = await db.query(`SELECT title, price, sort, image, information,count FROM ${shopTable} WHERE id=?`, [sid]);
          shopInfo = shopData[0];
          obj[sid] = shopInfo;
        }

        const { title, price, sort, image, information, count } = shopInfo;
        orderlists.push({
          buy_uid: buyId, // 购买人id，
          buy_method, // 支付方式
          title, // 商品标题
          sid, // 商品id
          price, // 商品价格
          sort, // 商品种类
          image, // 图片
          shop_count, // 购买数量
          count_total: count, // 商品总数量
          state, // 交易状态
          information,
          shipping_address,
          phone
        })
      }

      ctx.body = {
        ...Tips[1001],
        data: { list: orderlists, total }
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
  // 删除订单
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
