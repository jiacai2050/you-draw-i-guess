const Koa = require('koa');
const render = require('koa-ejs');
const serve = require('koa-static');
const koaBody = require('koa-body');
const path = require('path');
const routers = require('./routers');
const config = require('./config');
const session = require('koa-session');

const app = new Koa()
app.keys = ['leancloud'];
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
    if (process.env.NODE_ENV === 'production') {
        console.log(`${start}<||>${ctx.headers['x-real-ip']}<||>${ctx.method}<||>${ctx.url}<||>${ms}ms<||>${ctx.headers['user-agent']}`);
    }})
    .use(serve(path.join(__dirname, 'assets')))
    .use(async (ctx, next) => {
        const whitePaths = ['/debug', '/login'];
        if (whitePaths.indexOf(ctx.path) > -1 || ctx.headers['host'].startsWith('docker')) {
            await next();
        } else if (!ctx.session.userName) {
            ctx.redirect(`/login?from=${ctx.path}`);
        } else {
            await next();
        }
    })
    .use(session({ 'key': 'koa:s' }, app))
    .use(routers.routes())
    .use(routers.allowedMethods())
    .listen(parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000));

console.log(`start server successfully!`);    