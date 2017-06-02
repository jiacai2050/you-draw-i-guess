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
  let cql = 'select * from Room limit 5 order by updatedAt desc';
  let rooms = [];
  try {
    let qryResult = await lc.Query.doCloudQuery(cql);
    for (let room of qryResult.results) {
      rooms.push({
        'createBy': room.get('createBy'),
        'name': room.get('name'),
        'id': room.get('objectId')
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
  ctx.session = null;
  ctx.body = { 'code': 0 };
});

module.exports = api;