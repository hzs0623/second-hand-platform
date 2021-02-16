//职责： 中间件

const { Utils, Tips } = require('../src/utils');
const path = require('path');
const fs = require('fs');
const mimeTypes = require('mime-types');

// 跳过校验接口地址
const notUrlMap = ['/login', '/register', '/public', '/init', '/shop/list', '/shop/get/message', '/shop/item',];
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

function images() {
  return async (ctx, next) => {
    const { url } = ctx;
    const publicMap = ['/public/upload', '/public/images'];

    const isPublic = publicMap.some(path => url.indexOf(path) !== -1);

    if (!isPublic) {
      await next();
      return;
    }
    try {
      let filePath = path.join(__dirname, ctx.url); //图片地址
      filePath = filePath.replace(/\/middleware/, "");
      const file = fs.readFileSync(filePath); //读取文件
      let mimeType = mimeTypes.lookup(filePath); //读取图片文件类型
      ctx.set('content-type', mimeType); //设置返回类型
      ctx.body = file; //返回图片
    } catch (e) {
      ctx.body = Tips[1002];
    }
  }
}


module.exports = {
  logger,
  checkToken,
  images
}
