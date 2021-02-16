const { Utils, Tips, functions } = require('../../utils');
const db = require('../../db');
const { bashUrl, upload_url } = require('../../utils/var');
const fs = require('fs');
const path = require('path');

const uploadUrl = path.resolve(__dirname, 'public/upload').replace('/src/router/shopList', ""); // 上传地址

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
      const sql = `SELECT * FROM ${table} WHERE display=1 limit ${curPage}, ${pageSize}`;

      const lists = await db.query(`SELECT COUNT(id) FROM ${table}  where display=1`);
      const total = lists.length ? lists[0]['COUNT(id)'] : 0;
      let list = await db.query(sql) || []; // 总列表
      ctx.body = { ...Tips[1001], data: { list, total } };
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
    const { id } = data; // 商品id
    try {
      let res = await db.query(`SELECT * FROM ${table} WHERE id=?`, [id]);
      res = res[0];
      // 每次请求增加浏览次数
      let { browse_num } = res;
      browse_num = Number(browse_num) + 1;
      let sqlUp = `UPDATE ${table} SET browse_num=? WHERE id = ?`;
      await db.query(sqlUp, [browse_num, id]);

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
      const sql = `INSERT INTO ${table}(${Object.keys(data).join()},create_time,update_time) VALUES(${functions.getUpdateStr(data)}, ${Date.now()}, ${Date.now()})`;
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
      const data = Utils.filter(ctx, ['id', 'uid']);
      const valid = Utils.formatData(data, {
        id: 'number',
        uid: 'number',
      });
      if (!valid) return ctx.body = Tips[400];
      const { id, uid } = data;

      // 删除本地图片
      const lists = await db.query(`SELECT image FROM ${table} WHERE id=? and uid=?`, [id, uid]);
      const { image } = lists[0];
      const imgUrl = image.replace(`${bashUrl}${upload_url}`, "");

      fs.unlink(`${uploadUrl}/${imgUrl}`, (e) => { }); // 删除图片
      let sql = `DELETE FROM ${table} where id=? and uid=?`;
      await db.query(sql, [id, uid]);
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
      let sqlUp = `UPDATE ${table} SET ${str},display=1 WHERE id = ?`;

      let modSqlParams = [title, level, price, count, image, sort, information, Date.now(), id];
      await db.query(sqlUp, modSqlParams);
      ctx.body = { ...Tips[1001], data: 'edit shop info success' };
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },

  /**
   * 修改商品状态
  */
  async editShopState(ctx) {
    const data = Utils.filter(ctx, ['id', 'uid', 'display']);
    const valid = Utils.formatData(data, {
      id: 'number',
      uid: 'number',
      display: 'number'
    });
    if (!valid) return ctx.body = Tips[400];
    const { id, uid, display } = data;
    try {
      let sqlUp = `UPDATE ${table} SET display=? WHERE id = ? and uid = ?`;
      await db.query(sqlUp, [display, id, uid]);
      ctx.body = { ...Tips[1001], data: 'edit shopping state success' };
    } catch (e) {
      ctx.body = Tips[1002];
    }
  },

  /**
   * 商品搜索
  */
  async shopSearch(ctx) {
    const data = Utils.filter(ctx, ['title']);
    const valid = Utils.formatData(data, {
      title: 'string',
    });

    if (!valid) return ctx.body = Tips[400];
    try {
      const { title } = data;
      const findSql = `select * from ${table} where title like '%${title}%'`;
      const res = await db.query(findSql);
      ctx.body = {
        ...Tips[1001],
        data: {
          list: res
        }
      }
    } catch (error) {
      ctx.body = Tips[1002]
    }

  }
} 
