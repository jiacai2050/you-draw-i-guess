const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('../config');
const lc = require('../lib/leancloud');
const code = require('../lib/code');
const redis = require('../lib/redis');


router.get('/ping', async (ctx) => {
    if (ctx.query.roomId) {
        await redis.SETEX(`${ctx.session.userName}`, 5, 1);
        await redis.hset(ctx.query.roomId, ctx.session.userName, 1);
        ctx.body = { 'code': code.RESP_CODE.OK };
    } else {
        ctx.body = { 'code': code.RESP_CODE.BAD_REQUEST, 'errMsg': 'roomId 参数不能为空！' };
    }
});


module.exports = router;