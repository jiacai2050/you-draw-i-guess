const path = require('path');
const fs = require('fs');
const api = require('koa-router')();
const lc = require('../lib/leancloud');
const config = require('../config');

let routerFiles = fs.readdirSync(__dirname);
for (let rf of routerFiles) {
    if (!/index/.test(rf) && /.*js$/.test(rf)) {
        const prefix = rf.slice(0, -3);
        console.log(`add router [${prefix}] to hander [${rf}]`);
        api.use(`/${prefix}`, require(path.join(__dirname, rf)).routes());
    }
}

api.get('/', async(ctx) => {
    await ctx.render('canvas', {
        'convId': config.leancloud.convId,
        'lcAppId': config.leancloud.appId,
        'currentUserName': ctx.session.userName
    });
});
api.get('/logout', async (ctx) => {
    try {
        const success = await lc.Object.createWithoutData('SimpleUser', ctx.session.userId).destroy();
        if (success) {
            ctx.session = null;
            ctx.body = { 'code': 0 };
        } else {
            ctx.body = { 'code': 20000, 'errMsg': '退出失败' };
        }
    } catch (e) {
        console.error(e);
        ctx.body = { 'code': 10000, 'errMsg': `退出失败:${e.message}` };
    }
});

module.exports = api;