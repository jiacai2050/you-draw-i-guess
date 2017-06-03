const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('config');
const lc = require('../lib/leancloud');


router.get('/', async (ctx) => {
  await ctx.render('login', {
    'from': ctx.query.from || '/'
  });
})
router.post('/', koaBody, async (ctx) => {
  let userName = ctx.request.body['userName'];
  ctx.session.userName = userName;
  let SimpleUser = lc.Object.extend('SimpleUser');
  let simpleUser = new SimpleUser();
  simpleUser.set('name', userName);
  simpleUser.set('ua', ctx.headers['user-agent']);
  simpleUser.set('ip', ctx.headers['x-real-ip'] || ctx.ip);
  try {
    simpleUser = await simpleUser.save();
    ctx.session.userId = simpleUser.id;
    ctx.body = { 'userName': userName, 'code': 0 };
  } catch (e) {
    ctx.body = { 'code': 10000, 'errMsg': `登录:${e.message}` };
  }

});

module.exports = router;
