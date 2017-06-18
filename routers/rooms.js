const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('../config');
const lc = require('../lib/leancloud');
const roomLib = require('../lib/room');
const code = require('../lib/code');

router.get('/:roomId', async (ctx) => {
    try {
        let room = await new lc.Query('Room').get(ctx.params.roomId);
        let conv = await new lc.Query('_Conversation').get(room.get('convId'));
        let members = conv.get('m');
        let status = room.get('status');
        if (status === code.ROOM_STATUS.UNUSED) {
            // __admin__ should not be checked in.
            if (members.length - 1 > 8) {
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

router.post('/start_game', koaBody, async (ctx) => {
    let m = ctx.request.body['members'];
    let roomId = ctx.request.body['roomId'];
    try {
        let room = await new lc.Query('Room').get(roomId);
        room.set('order', m);
        room.set('status', code.ROOM_STATUS.PLAYING);
        room = await room.save();
        ctx.body = { 'code': code.RESP_CODE.OK };
    } catch (err) {
        console.error(err);
        ctx.body = { 'code': code.RESP_CODE.SERVICE_UNAVAILABLE, 'errMsg': err.message };
    };
});
router.get('/:roomId/drawing', async (ctx) => {
    let room = await new lc.Query('Room').get(ctx.params.roomId);

    await ctx.render('canvas', {
        'createBy': room.get('createBy'),
        'name': room.get('name'),
        'id': room.get('objectId'),
        'convId': room.get('convId'),
        'lcAppId': config.leancloud.appId,
        'currentUserName': ctx.session.userName
    });
});
router.post('/', koaBody, async (ctx) => {
    let roomName = ctx.request.body['roomName'];
    let adminName = roomLib.getRoomAdminName(roomName);
    try {
        let IMClient = await lc.realtime.createIMClient(adminName);
        let conv = await IMClient.createConversation({
            'members': [adminName],
            'name': roomName,
        });

        let Room = lc.Object.extend('Room');
        let room = new Room();
        room.set('name', roomName);
        room.set('createBy', ctx.session.userName);
        room.set('convId', conv.id);
        room.set('status', code.ROOM_STATUS.UNUSED);
        room = await room.save();
        roomLib.addRoomListener(conv, room.id);
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