const Koa = require('koa');
const app = new Koa();
const router = require('./src/router');
const bodyParser = require('koa-bodyparser');
const { logger, checkToken, images } = require('./middleware'); // 自定义中间件
const cors = require('./libs/koa-cors');

app.use(cors); // 跨站资源共享
app.use(bodyParser()); // post处理
app.use(logger()); // 自定义中间件
app.use(checkToken()); // token校验
app.use(images()); // 访问本地图片
app.use(router.routes()).use(router.allowedMethods()); // 路由
// 调用了 allowedMethods 方法注册了 HTTP 方法检测的中间件，这样当用户通过不正确的 HTTP 方法访问 API 时，就会自动返回 405 Method Not Allowed 状态码

app.listen(3333, () => {
  console.log('app listen at 3333')
});

