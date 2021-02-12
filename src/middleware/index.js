const { Utils, Tips } = require('../utils');

/**
 * 执行连接时间
*/
function logger() {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`);
  };
}

/**
 * token中间件
 */
function checkToken() {
  return async (ctx, next) => {
    let { url = '' } = ctx;
    const notUrlMap = ['/login', '/register'];

    if (notUrlMap.indexOf(url) === -1) {//需要校验登录态
      const { authtoken = "" } = ctx.request.header || {};
      if (!authtoken) return ctx.body = Tips[1005];
      const uid = Utils.verifyToken(authtoken) || "";
      if (!uid) return ctx.body = Tips[1005];
      ctx.state = { uid }; // state能获取uid值
      await next();
    } else {
      // login 和 注册 不需要校验token
      await next();
    }
  }
}


module.exports = {
  logger,
  checkToken
}
