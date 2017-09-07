const Koa = require('koa');
const render = require('koa-ejs');
const serve = require('koa-static');
const koaBody = require('koa-body');
const path = require('path');
const routes = require('./routes');
const config = require('./config');

const app = new Koa()
app.keys = ['leancloud'];
app.proxy = true;

const port = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000);
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
    if (process.env.NODE_ENV === 'production') {
        console.log(`${start}<||>${ctx.headers['x-real-ip']}<||>${ctx.method}<||>${ctx.url}<||>${ms}ms<||>${ctx.headers['user-agent']}`);
    }})
    .use(serve(path.join(__dirname, 'assets')))
    .use(routes.routes())
    .use(routes.allowedMethods())
    .listen(port);

console.log(`start server on ${port} ...`);    