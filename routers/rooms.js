const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('../config');
const lc = require('../lib/leancloud');

router.get('/:roomId', async (ctx) => {
    try {
        let room = await new lc.Query('Room').get(ctx.params.roomId);
        await ctx.render('room', {
            'createBy': room.get('createBy'),
            'name': room.get('name'),
            'id': room.get('objectId'),
            'convId': room.get('convId'),
            'lcAppId': config.leancloud.appId,
            'currentUserName': ctx.session.userName
        });
    } catch (err) {
        console.error(err);
        ctx.response.body = `roomId = ${ctx.params.roomId} not found!`;
    };
});
router.delete('/:roomId', async(ctx) => {
    let room = lc.Object.createWithoutData('Room', ctx.params.roomId);
    try {
        let success = await room.destroy();
        if(success) {
            ctx.body = {'code': 0}
        } else {
         ctx.body = { 'errMsg': `Ooops! 服务内部故障，请稍后重试！`, 'code': 20000 };   
        }
    } catch (err) {
         ctx.body = { 'errMsg': `Ooops! ${err.message}`, 'code': 10000 };
    }
    
});
router.get('/:roomId/drawing', async (ctx) => {
    try {
        let room = await new lc.Query('Room').get(ctx.params.roomId);
        await ctx.render('paint', {
            'createBy': room.get('createBy'),
            'name': room.get('name'),
            'id': room.get('objectId'),
            'convId': room.get('convId'),
            'lcAppId': config.leancloud.appId,
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
        });
        conv.on('membersleft', function (payload) {
            console.log(payload.members, payload.kickedBy);
        });
        conv.on('message', function (message) {
            console.log(`get message ${message.text}`)
        });

        let Room = lc.Object.extend('Room');
        let room = new Room();
        room.set('name', roomName);
        room.set('createBy', ctx.session.userName);
        room.set('convId', conv.id);
        room = await room.save();

        ctx.body = { 'roomId': room.id, 'code': 0 };
    }
    catch (err) {
        console.error(err);
        ctx.body = { 'errMsg': `Ooops! ${err.message}`, 'code': 10000 };
    };

});

module.exports = router;