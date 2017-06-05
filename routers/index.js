const path = require('path');
const fs = require('fs');
const api = require('koa-router')();
const lc = require('../lib/leancloud');

let routerFiles = fs.readdirSync(__dirname);
for (let rf of routerFiles) {
    if (!/index/.test(rf) && /.*js$/.test(rf)) {
        let prefix = rf.slice(0, -3);
        api.use(`/${prefix}`, require(path.join(__dirname, rf)).routes());
        console.log(`add router [${prefix}] to hander [${rf}]`);
    }
}

api.get('/', async (ctx) => {
    let rooms = [];
    try {
        let qryResult = await lc.Query.doCloudQuery('select * from Room where status>0 limit 15 order by updatedAt desc');
        for (let room of qryResult.results) {
            let conv = await new lc.Query('_Conversation').get(room.get('convId'));
            rooms.push({
                'createBy': room.get('createBy'),
                'name': room.get('name'),
                'id': room.get('objectId'),
                'numMembers': conv.get('m').length
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        await ctx.render('index', {
            'rooms': rooms,
            'currentUserName': ctx.session.userName
        });
    }
});
api.get('/logout', async (ctx) => {
    try {
        let success = await lc.Object.createWithoutData('SimpleUser', ctx.session.userId).destroy();
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