const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const serve = require('koa-static');
const path = require('path');

const app = new Koa();
render(app, {
    root: path.join(__dirname, 'views'),
    layout: false,
    viewExt: 'html',
    cache: false,
    debug: true
});

const router = new Router();

router.get('/', async (ctx) => {
    await ctx.render('index');
});
// x-response-time

app.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger

app.use(async function (ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${start}<||>${ctx.ip}<||>${ctx.method}<||>${ctx.url}<||>${ms}ms`);
});

app.use(router.routes())
   .use(router.allowedMethods())
   .use(serve(path.join(__dirname, 'assets')))
   .listen(parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000));
