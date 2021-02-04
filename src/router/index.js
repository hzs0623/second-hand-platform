const Router = require('koa-router');
const User = require('./user');

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


module.exports = router;
