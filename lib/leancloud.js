const AV = require('leancloud-storage');
const Realtime = require('leancloud-realtime').Realtime;
const config = require('config');

AV.init({
  'appId': config.get('leancloud.appId'),
  'appKey': config.get('leancloud.appKey')
});

exports.realtime = new Realtime({
  appId: config.get('leancloud.appId'),
  region: 'cn', // 美国节点为 "us"
  noBinary: true,
});
exports.Object = AV.Object
exports.Query = AV.Query