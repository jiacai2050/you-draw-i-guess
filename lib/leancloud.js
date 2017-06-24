const AV = require('leancloud-storage');
const config = require('../config');

AV.init({
    'appId': config.leancloud.appId,
    'appKey': config.leancloud.appKey
});

module.exports = {
    'Object': AV.Object
}
