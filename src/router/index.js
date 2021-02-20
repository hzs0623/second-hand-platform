const Router = require('koa-router');
const User = require('./user'); //用户
const shopList = require('./shopList'); // 商品
const init = require('./init');  // 映射数据
const message = require('./shopList/message');  // 商品留言
const upload = require('./upload'); // 上传接口
const shopCart = require('./shopCart'); // 购物车
const buyShop = require('./shopCart/buyShop');
const order = require('./order');

const router = new Router();

router.get('/', (ctx, next) => {
  ctx.body = {
    code: 200,
    data: {
      text: '什么都没有'
    }
  }
})
// map映射
router.get('/init/map', init.getInit);
router.get('/init/user/map', init.getUsernameList);  // 用户姓名列表 
router.get('/oss/config', init.getOssConfig); // 获取oss配置

// 用户
router.post('/login', User.login);
router.post('/register', User.registerUser);
router.post('/user/edit', User.userEdit);
router.get('/user/find', User.userInfo);

// 商品
router.get('/shop/list', shopList.getList);
router.get('/shop/item', shopList.getShopItem); // 获取单个商品信息
router.post('/shop/add', shopList.addShop); // 增加商品 getByIdShopList
router.post('/shop/delete', shopList.deleteShop); // 获取单个商品信息
router.get('/shop/uid/list', shopList.getByIdShopList); // 获取单个商品信息
router.post('/shop/edit', shopList.editShop); // 商品信息修改 
router.post('/shop/edit/state', shopList.editShopState); // 下架
router.get('/shop/search', shopList.shopSearch); // 商品搜索 标题

// 商品留言
router.post('/shop/add/message', message.addShopMesg);
router.get('/shop/get/message', message.getShopMessage);
router.post('/shop/delete/message', message.deleteShopMessage); // 删除留言

// 上传接口
router.post('/upload/image', upload.uploadImg);

// 购物车
router.post('/shop/cart/add', shopCart.addShopCart); // 添加购物车
router.get('/shop/cart/list', shopCart.getShopCart); // 查询购物车列表  
router.post('/shop/cart/delete', shopCart.deleteShopCart); // 删除购物车
router.get('/buy/shop/list', buyShop.getbuyShopList); // 已买的商品 
router.post('/payment/shop', buyShop.paymentShop); // 购买商品 

// 订单
router.get('/order/list', order.getOrderList);
router.post('/order/edit', order.orderEdit);
router.post('/order/cancel', order.orderCancel); // 取消订单

module.exports = router;
