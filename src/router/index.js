const Router = require('koa-router');
const User = require('./user'); //用户
const shopList = require('./shopList'); // 商品列

const router = new Router();

router.get('/', (ctx, next) => {
  ctx.body = {
    code: 200,
    data: {
      list: [1, 3, 4]
    }
  }
})

// user 
router.post('/login', User.login);
router.post('/register', User.registerUser);
router.post('/user/edit', User.userEdit);

router.get('/shop/list', shopList.getList);

module.exports = router;
