// const AV = require('leancloud-storage/dist/node/live-query');
//const AV = require('leancloud-storage/live-query');
const AV = require('leancloud-storage/live-query');
const Realtime = require('leancloud-realtime').Realtime;
const config = require('../config');

AV.init({
    'appId': config.leancloud.appId,
    'appKey': config.leancloud.appKey
});

module.exports = {
    'realtime': new Realtime({
        appId: config.leancloud.appId,
        region: 'cn', // 美国节点为 "us"
        noBinary: true,
    }),
    'Object': AV.Object,
    'Query': AV.Query,
    'TextMessage': require('leancloud-realtime').TextMessage
}
