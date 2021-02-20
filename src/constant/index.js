// 端口
const port = 3333;

// 服务器地址
const bashUrl = `http://127.0.0.1:${port}`; // 默认地址

// 上传地址
const upload_url = `/public/upload/`;

// 购物状态
const stateMap = {
  1: '发货中',
  2: '已发货，待收货',
  3: "交易完成"
}

const methodMap = {
  0: '货到付款',
  1: '微信',
  2: '支付宝',
  3: '线下支付'
}


module.exports = {
  port,
  bashUrl,
  upload_url
}
