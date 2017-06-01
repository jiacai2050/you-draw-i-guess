const path = require('path');
const fs = require('fs');
const api = require('koa-router')();
const AV = require('leancloud-storage');

let routerFiles = fs.readdirSync(__dirname);
for (let rf of routerFiles) {
  if (!/index/.test(rf) && /.*js$/.test(rf)) {
    let prefix = rf.slice(0, -3);
    api.use(`/${prefix}`, require(path.join(__dirname, rf)).routes());
    console.log(`add router [${prefix}] to hander [${rf}]`);
  }
}



api.get('/', async (ctx) => {
  let cql = 'select * from Room limit 5  order by updatedAt desc';
  await AV.Query.doCloudQuery(cql).then(async (data) => {
    let rooms = [];
    for (let room of data.results) {
      rooms.push({
        'createBy': room.get('createBy'),
        'name': room.get('name'),
        'id': room.get('objectId')
      });
    }
    await ctx.render('index', { 'rooms': rooms });
  }, async (error) => {
    await ctx.render('index', { 'rooms': [] });
    console.error(error);
  });

});
api.get('/ws', async (ctx) => {
  ctx.websocket.send('Hello World');
  ctx.websocket.on('message', function (message) {
    // do something with the message from client
    console.log(message);
    ctx.websocket.send(message);
  });
});


module.exports = api;