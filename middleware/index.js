const { Utils, Tips } = require('../src/utils');

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
    const notUrlMap = ['/login', '/register']; // 不需要校验接口

    const isValid = notUrlMap.some(str => url.indexOf(str) === 0);
    try {
      if (!isValid) {//需要校验登录态
        const { authtoken = "" } = ctx.request.header || {};
        if (!authtoken) return ctx.body = Tips[1005];
        const uid = await Utils.verifyToken(authtoken) || "";
        ctx.state = { uid }; // state能获取uid值
        await next();
      } else {
        // login 和 注册 不需要校验token
        await next();
      }
    } catch (e) {
      ctx.body = Tips[1005];
    }
  }
}


module.exports = {
  logger,
  checkToken
}
