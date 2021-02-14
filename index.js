const Koa = require('koa');
const app = new Koa();
const path = require('path');
const router = require('./src/router');
const koaBody = require('koa-body'); // post请求 上传文件
const { checkToken, images } = require('./middleware'); // 自定义中间件
const cors = require('./libs/koa-cors');// 跨站资源共享
const { port, bashUrl, upload_url } = require('./src/utils/var');

app.use(cors);
app.use(koaBody({
  multipart: true, // 支持文件上传
  // encoding: 'gzip', // 暂时开启报错
  formidable: {
    uploadDir: path.join(__dirname, upload_url), // 设置文件上传目录
    keepExtensions: true,    // 保持文件的后缀
    maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
    // onFileBegin: (name, file) => {}, // 文件上传前的设置
  }
})); // post处理
app.use(checkToken()); // token校验
app.use(images()); // 访问本地图片

app.use(router.routes()).use(router.allowedMethods()); // 路由
// 调用了 allowedMethods 方法注册了 HTTP 方法检测的中间件，这样当用户通过不正确的 HTTP 方法访问 API 时，就会自动返回 405 Method Not Allowed 状态码

app.listen(port, _ => {
  console.log(`service listen at ${bashUrl}`)
});
