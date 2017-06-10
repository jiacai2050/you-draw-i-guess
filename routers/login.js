const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('../config');
const lc = require('../lib/leancloud');
const code = require('../lib/code');

router.get('/', async (ctx) => {
    await ctx.render('login', {
        'from': ctx.query.from || '/'
    });
})
router.post('/', koaBody, async (ctx) => {
    let userName = ctx.request.body['userName'];
    let SimpleUser = lc.Object.extend('SimpleUser');
    let simpleUser = new SimpleUser();
    simpleUser.set('name', userName);
    simpleUser.set('ua', ctx.headers['user-agent']);
    simpleUser.set('ip', ctx.headers['x-real-ip'] || ctx.ip);
    ctx.session.userName = userName;
    try {
        simpleUser = await simpleUser.save();
        ctx.session.userId = simpleUser.id;
        // ctx.session.userName = userName;
        ctx.body = { 'userName': userName, 'code': code.RESP_CODE.OK };
    } catch (e) {
        ctx.body = { 'code': code.RESP_CODE.SERVICE_UNAVAILABLE, 'errMsg': `登录:${e.message}` };
    }

});

module.exports = router;
