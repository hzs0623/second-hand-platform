const { Utils, Tips, functions } = require('../../utils');
const db = require('../../db');

// console.log(functions.formatDate())

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

      const { pageSize, curPage } = data;

      // console.log(pageSize, curPage);
      ctx.body = { ...Tips[1001], data: { user: 123 } };
    } catch (e) {
      ctx.body = Tips[1002];
    }
  }
} 