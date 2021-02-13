const Router = require('koa-router');
const User = require('./user'); //用户
const shopList = require('./shopList'); // 商品
const init = require('./init');
const message = require('./shopList/message');

const router = new Router();

router.get('/', (ctx, next) => {
  ctx.body = {
    code: 200,
    data: {
      text: '什么都没有'
    }
  }
})

// 用户
router.post('/login', User.login);
router.post('/register', User.registerUser);
router.post('/user/edit', User.userEdit);
router.get('/user/find', User.userInfo);

// 商品
router.get('/shop/list', shopList.getList);
router.get('/shop/item', shopList.getShopItem); // 获取单个商品信息
router.post('/shop/add', shopList.addShop); // 增加商品
router.post('/shop/delete', shopList.deleteShop); // 获取单个商品信息

// 商品留言
router.post('/shop/add/message', message.addShopMesg);
router.get('/shop/get/message', message.getShopMessage);
router.post('/shop/delete/message', message.deleteShopMessage); // 删除留言

// map映射
router.get('/init/map', init.getInit);

module.exports = router;
