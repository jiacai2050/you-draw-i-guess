const router = require('koa-router')();
const koaBody = require('koa-body')();
const AV = require('leancloud-storage');

router.get('/:roomId', async (ctx) => {
    let query = new AV.Query('Room');
    await query.get(ctx.params.roomId).then(async (room) => {
        await ctx.render('paint', {
            'createBy':  room.get('createBy'),
            'name': room.get('name'),
            'id': room.get('objectId')
        });
    }, (err) => {
        console.error(err);
        ctx.response.body = `roomId = ${ctx.params.roomId} not found!`;
    });

});

router.post('/', koaBody, async (ctx) => {
    let roomName = ctx.request.body['roomName'];
    let userName = ctx.request.body['userName'];

    let Room = AV.Object.extend('Room');
    let room = new Room();
    room.set('name', roomName);
    room.set('createBy', userName);
    await room.save().then((room) => {
        console.log(`new room id: ${room.id}`);
        ctx.body = { 'roomId': room.id, 'code': 0 };
    }, (err) => {
        console.error(`new room error ${room.message}`);
        ctx.body = { 'errMsg': room.message, 'code': 10000 };
    });

});

module.exports = router;