const Koa = require('koa');
const render = require('koa-ejs');
const serve = require('koa-static');
const websockify = require('koa-websocket');
const koaBody = require('koa-body');
const path = require('path');
const routers = require('./routers');
const config = require('config');
const AV = require('leancloud-storage');

AV.init({
  'appId': config.get('leancloud.appId'),
  'appKey': config.get('leancloud.appKey')
});

const app = new Koa();

app.proxy = true;

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  debug: true
});
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
}).use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${start}<||>${ctx.ip}<||>${ctx.method}<||>${ctx.url}<||>${ms}ms<||>${ctx.headers['user-agent']}`);
}).use(routers.routes())
  .use(routers.allowedMethods())
  .use(serve(path.join(__dirname, 'assets')))
  .use(koaBody())
  .listen(parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000));
