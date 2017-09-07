const path = require('path');
const fs = require('fs');
const api = require('koa-router')();
const config = require('./config');

api.get('/', async (ctx) => {
    await ctx.render('index', {
        'convId': config.leancloud.convId,
        'lcAppId': config.leancloud.appId,
        'lcAppKey': config.leancloud.appKey

    });
});

api.get('/register', async (ctx) => {
    await ctx.render('register', {
        'lcAppId': config.leancloud.appId,
        'lcAppKey': config.leancloud.appKey
    });
});

api.get('/login', async (ctx) => {
    await ctx.render('login', {
        'lcAppId': config.leancloud.appId,
        'lcAppKey': config.leancloud.appKey
    });
})

module.exports = api;