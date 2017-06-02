const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('config');
const lc = require('../lib/leancloud');


router.get('/', async (ctx) => {
  await ctx.render('login', {
    'from': ctx.query.from || '/'
  });
})
router.post('/', koaBody, (ctx) => {
    let userName = ctx.request.body['userName'];
    ctx.session.userName = userName;
    ctx.body = {'userName': userName, 'code':0};
});

module.exports = router;
