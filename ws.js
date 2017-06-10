const ws = require('koa-router')();
const code = require('./lib/code');
const lc = require('./lib/leancloud');
let userSocket = {};
ws.get('/ping', async (ctx) => {
    ctx.websocket.on('message', (message) => {
        console.log(message);
        ctx.websocket.send(message);
    });
});
ws.get('/ws/health_monitor', async (ctx) => {
    let roomId = ctx.query.roomId;
    let room = await new lc.Query('Room').get(roomId);
    let createBy = room.get('createBy');
    let imClient = await lc.realtime.createIMClient(createBy);
    let conv = await imClient.getConversation(room.get('convId'));
    ctx.websocket.on('message', (message) => {
        // await redis.SETEX(`${ctx.session.userName}`, 5, 1);
        // await redis.hset(ctx.message.roomId, ctx.session.userName, 1);
        ctx.websocket.send(JSON.stringify({
            'code': code.RESP_CODE.OK, 'msg': message
        }));
    });

    ctx.websocket.on('error', (e) => {
        console.error(`${JSON.stringify(e)} exit with error`);
    });
    ctx.websocket.on('close', (e) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
        console.log(roomId, e);
        if (e === 1000) { // CLOSE_NORMAL

        } else if (e === 1006) { // CLOSE_ABNORMAL, no close frame being sent
            conv.remove(ctx.session.userName).then((conv) => {
                console.error(`${ctx.session.userName} left. Remaining members: ${conv.members}`);
            }, (e) => {
                console.log(e);
            });
        }
    });
});

module.exports = ws;