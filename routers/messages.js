const router = require('koa-router')();
const koaBody = require('koa-body')();
const config = require('config');
const Realtime = require('leancloud-realtime').Realtime;
const TextMessage = require('leancloud-realtime').TextMessage;


const realtime = new Realtime({
  appId: config.get('leancloud.appId'),
  region: 'cn',
  noBinary: true,
});


router.post('/', koaBody, (ctx) => {
    let roomName = ctx.request.body['name'];
    let roomId = uuidV1();
    ctx.body = {'roomId': roomId};
});

module.exports = router;
