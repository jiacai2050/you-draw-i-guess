const lc = require('./leancloud');
const code = require('./code');

function addRoomListener(conv, roomId) {
    console.log(`add listener for ${roomId}`);
    let startPlayQuery = new lc.Query('Room');
    startPlayQuery.equalTo('status', code.ROOM_STATUS.PLAYING);
    startPlayQuery.equalTo('objectId', roomId);

    startPlayQuery.subscribe().then((liveQuery) => {
        liveQuery.on('enter', (room) => {
            console.log(`enter... ${JSON.stringify(room)}`);
            conv.send(new lc.TextMessage(JSON.stringify({
                'type': 'system',
                'cmd': 'draw',
                'drawer': 'xigua'
            })))
        });
    });
    // conv.on('message', (message) => {
    //     console.log(`${message.from}: ${message.text}`);
    //     conv.send(new lc.TextMessage(JSON.stringify({
    //         'type': 'system',
    //         'cmd': 'draw',
    //         'drawer': ctx.session.userName
    //     }))).then((m) => {
    //         console.log(`${m.text} send!`)
    //     }, (e) => {
    //         console.error(e);
    //     });
    // });
}
function getRoomAdminName(roomName) {
    return `__admin__${roomName}`;
}

module.exports = {
    'getRoomAdminName': getRoomAdminName,
    'addRoomListener': addRoomListener
}