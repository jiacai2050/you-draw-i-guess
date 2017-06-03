const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('config');
const lc = require('../lib/leancloud');

router.get('/:roomId', async (ctx) => {
    try {
        let query = new lc.Query('Room');
        let room = await query.get(ctx.params.roomId);
        await ctx.render('paint', {
            'createBy': room.get('createBy'),
            'name': room.get('name'),
            'id': room.get('objectId'),
            'convId': room.get('convId'),
            'lcAppId': config.get('leancloud.appId'),
            'currentUserName': ctx.session.userName
        });
    } catch (err) {
        console.error(err);
        ctx.response.body = `roomId = ${ctx.params.roomId} not found!`;
    };
});

router.post('/', koaBody, async (ctx) => {
    let roomName = ctx.request.body['roomName'];

    try {
        let IMClient = await lc.realtime.createIMClient(ctx.session.userName);
        let conv = await IMClient.createConversation({
            'members': [],
            'name': roomName,
            // 'transient': true,
        });

        let Room = lc.Object.extend('Room');
        let room = new Room();
        room.set('name', roomName);
        room.set('createBy', ctx.session.userName);
        room.set('convId', conv.id);
        // Error: Converting circular structure to JSON
        // room.relation('conv').add(conv);
        room = await room.save();

        ctx.body = { 'roomId': room.id, 'code': 0 };
    }
    catch (err) {
        console.error(err);
        ctx.body = { 'errMsg': `Ooops! ${err.message}`, 'code': 10000 };
    };

});

module.exports = router;