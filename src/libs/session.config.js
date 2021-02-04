const session = require('koa-session');

module.exports = function (app, id) {
  const CONFIG = {
    key: id ? id : 'uid', //cookie key (default is koa:sess)
    maxAge: 86400000,  // cookie的过期时间 maxAge in ms (default is 1 days)
    overwrite: true,  //是否可以overwrite    (默认default true)
    httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
    signed: true,   //签名默认true
    rolling: false,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
    renew: false  //(boolean) renew session when session is nearly expired,
  }

  app.keys = ['this is my secret and fuck you all'];//我理解为一个加密的密钥
  return session(CONFIG, app);
}
