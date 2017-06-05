const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('../config');
const lc = require('../lib/leancloud');
const code = require('../lib/code');

router.get('/:roomId', async (ctx) => {
    try {
        let room = await new lc.Query('Room').get(ctx.params.roomId);
        let conv = await new lc.Query('_Conversation').get(room.get('convId'));
        let members = conv.get('m');
        let status = room.get('status');
        if (status === code.ROOM_STATUS.UNUSED) {
            if (members.length > 8) {
                ctx.body = '该房间人员已满，请返回重新选择！';
            } else {
                await ctx.render('room', {
                    'createBy': room.get('createBy'),
                    'name': room.get('name'),
                    'id': room.get('objectId'),
                    'convId': room.get('convId'),
                    'lcAppId': config.leancloud.appId,
                    'currentUserName': ctx.session.userName
                });
            }
        } else if (status === code.ROOM_STATUS.PLAYING) {
            ctx.redirect(`/rooms/${ctx.params.roomId}/drawing`);
        } else {
            ctx.body = '该房间已被删除';
        }
    } catch (err) {
        console.error(err);
        ctx.body = `roomId = ${ctx.params.roomId} not found!`;
    };
});

router.get('/:roomId/drawing', async (ctx) => {
    try {
        let room = await new lc.Query('Room').get(ctx.params.roomId);
        await ctx.render('canvas', {
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
        room.set('status', code.ROOM_STATUS.UNUSED);
        room = await room.save();

        ctx.body = { 'roomId': room.id, 'code': code.RESP_CODE.OK };
    }
    catch (err) {
        console.error(err);
        ctx.body = { 'errMsg': `Ooops! ${err.message}`, 'code': code.RESP_CODE.SERVICE_UNAVAILABLE };
    };

});

router.delete('/:roomId', async (ctx) => {
    let room = lc.Object.createWithoutData('Room', ctx.params.roomId);
    room.set('status', code.ROOM_STATUS.DELETED);
    try {
        let success = await room.save();
        if (success) {
            ctx.body = { 'code': code.RESP_CODE.OK }
        } else {
            ctx.body = { 'errMsg': `Ooops! 服务内部故障，请稍后重试！`, 'code': code.RESP_CODE.FAIL };
        }
    } catch (err) {
        ctx.body = { 'errMsg': `Ooops! ${err.message}`, 'code': code.RESP_CODE.SERVICE_UNAVAILABLE };
    }
});
module.exports = router;