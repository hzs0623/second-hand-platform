const { Utils, Tips, functions } = require("../../utils")
const db = require("../../db")
const table = `shop_message`

module.exports = {
  // 获取所有留言
  async getAllMesList(ctx) {
    try {
      const data = Utils.filter(ctx, ["curPage", "pageSize"])
      const valid = Utils.formatData(data, {
        curPage: "number",
        pageSize: "number",
      })
      if (!valid) return (ctx.body = Tips[400]) // 参数错误

      let { curPage, pageSize } = data
      curPage = (Number(curPage) - 1) * pageSize

      const list = await db.query(
        `SELECT * FROM ${table} order by create_time desc limit ${curPage}, ${pageSize}`
      )
      const total = await db.query(`SELECT COUNT(sid) FROM ${table}`)
      ctx.body = {
        ...Tips[1001],
        data: {
          list,
          total: total.length ? total[0]["COUNT(sid)"] : 0,
        },
      }
    } catch (e) {
      ctx.body = Tips[1002]
    }
  },
  /**
   * 添加商品留言
   */
  async addShopMesg(ctx) {
    const data = Utils.filter(ctx, ["uid", "sid", "content"])
    const valid = Utils.formatData(data, {
      uid: "number",
      sid: "number",
      content: "string",
    })
    if (!valid) return (ctx.body = Tips[400])
    let { content } = data
    content = content.trim()
    if (!content) {
      ctx.body = Tips[1002]
      return
    }
    try {
      let str = Object.keys(data)
      const sql = `INSERT INTO ${table}(${str.join()},create_time) VALUES(${functions.getUpdateStr(
        data
      )},?)`
      await db.query(sql, { ...data, content, create_time: Date.now() })
      ctx.body = Tips[1001]
    } catch (e) {
      ctx.body = Tips[1002]
    }
  },

  /**
   * 获取当前商品留言
   */
  async getShopMessage(ctx) {
    const data = Utils.filter(ctx, ["sid", "curPage", "pageSize"])
    const valid = Utils.formatData(data, {
      uid: "number",
      curPage: "number",
      pageSize: "number",
    })
    if (!valid) return (ctx.body = Tips[400])
    let { curPage, pageSize, sid } = data
    curPage = curPage == 1 ? 0 : curPage
    // 查询语句
    const sql = `SELECT * FROM ${table} WHERE sid=? limit ${curPage}, ${pageSize}`
    try {
      let res = await db.query(sql, [sid])
      let list = []
      for (let i = 0; i < res.length; i++) {
        const item = res[i]
        const { uid } = item
        const username = await db.query(
          `select username from user where uid=?`,
          uid
        )
        item.username = username[0].username
        list.push(item)
      }
      ctx.body = {
        ...Tips[1001],
        data: {
          list,
        },
      }
    } catch (e) {
      ctx.body = Tips[1002]
    }
  },

  /**
   *删除商品留言
   */
  async deleteShopMessage(ctx) {
    try {
      const data = Utils.filter(ctx, ["uid", "sid", "id"])
      const valid = Utils.formatData(data, {
        uid: "number",
        sid: "number",
        id: "number",
      })
      if (!valid) return (ctx.body = Tips[400])
      const { id } = data
      let delSql = `DELETE FROM ${table} where id=?`
      const res = await db.query(delSql, [id])
      ctx.body = Tips[1001]
    } catch (e) {
      ctx.body = Tips[1002]
    }
  },
}
