; (function ($) {

    let imClient = null;
    let conv = null;
    let membersDiv = null;
    let socket = null;
    let membersToShow = new Set();
    function addBulletScreens(bullet, opts) {
        opts = opts || {};
        opts = Object.assign({
            'info': bullet,
            'close': true
        }, opts);
        $('body').barrager(opts);
    }
    function addMember(m) {
        let p = document.createElement('p');
        p.setAttribute('id', m);
        p.appendChild(document.createTextNode(m));
        membersDiv.appendChild(p);

        membersToShow.add(m);
    }
    function removeMember(m) {
        let self = document.getElementById(m);
        self.parentElement.removeChild(self);

        membersToShow.delete(m);
    }

    realtime.createIMClient(currentUserName).then(function (client) {
        console.log(`client init ok...`);
        imClient = client;
        imClient.on('membersjoined', (payload, conversation) => {
            if (conversation.id === convId) {
                addBulletScreens(`${payload.members} 加入`);
                for (let m of payload.members) {
                    if (!membersToShow.has(m)) {
                        addMember(m);
                    }

                }
            }
            console.log(payload.members, payload.invitedBy, conversation.members, 'joined');
        });
        imClient.on('message', function (message, conversation) {
            let msg = JSON.parse(message.text);
            if (msg.type === 'msg') {
                addBulletScreens(`${message.from}: ${msg.value}`);
            } else if (msg.type === 'cmd') {
                if (msg.op === 'startDraw') {
                    socket.close();
                    window.location = `/rooms/${roomId}/drawing`;
                }
            }
        });
        return client.getConversation(convId);
    }).then(function (conversation) {
        // 列举已有成员
        for (let m of conversation.members) {
            if (m.indexOf('__admin__') !== 0) {
                membersToShow.add(m);
                addMember(m);
            }

        }
        return conversation.join();
    }).then(function (conversation) {
        console.log(`join conv ok...`);
        conv = conversation;
        conversation.on('membersleft', function membersleftEventHandler(payload) {
            for (let m of payload.members) {
                if (m === createBy) {
                    alert(`${createBy} 房主已经离开房间，请重新开房间再开始游戏。`)
                    window.location = '/';
                } else {
                    addBulletScreens(`${m} 已离开...`);
                    removeMember(m);
                }
            }
            console.log(payload.members, payload.kickedBy, 'membersleft');
        });
    }).catch(console.error.bind(console));

    function sendMsg(msg) {
        if (msg.trim() !== '') {
            conv.send(new AV.TextMessage(JSON.stringify({
                'type': 'msg',
                'value': msg
            }))).then(function (message) {
                console.log(message.text + " send!");
            }).catch(console.error.bind(console));
        }
    }
    window.document.body.onload = () => {
        document.title = `${roomName} by ${createBy}`;
        socket = health_monitor(roomId);
        membersDiv = document.getElementById('members');

        let msgInput = document.getElementById('message');
        let sendBtn = document.getElementById('send');

        sendBtn.onclick = function (e) {
            sendMsg(msgInput.value);
        };
        msgInput.onkeypress = function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) { // 13 is enter
                sendMsg(msgInput.value);
            }
        };
        document.getElementById('startDraw').onclick = (e) => {
            conv.send(new AV.TextMessage(JSON.stringify({
                'type': 'cmd',
                'op': 'startDraw'
            }))).then(function (message) {
                let orderDraw = [];
                for(let child of membersDiv.children) {
                    orderDraw.push(child.id);
                }
                postAjax('/rooms/start_game', {
                    'roomId': roomId,
                    'members': orderDraw
                }, (resp) => {
                    socket.close();
                    window.location = `/rooms/${roomId}/drawing`;
                });
            }).catch((e) => {
                alert(e.message);
            });

        }
        document.getElementById('gohome').onclick = function (e) {
            if (currentUserName === createBy) {
                if (confirm("你是该房间的创建者，离开将导致本房间被删除，确定嘛？")) {
                    deleteAjax(`/rooms/${roomId}`, (resp) => {
                        window.location = `/`;
                    })
                }
            } else {
                if (confirm("确定返回首页吗？")) {
                    conv.quit().then((conv) => {
                        // console.log('退出成功', conv.members);
                        window.location = '/';
                    }).catch((e) => {
                        alert(`出错了！${e.message}`);
                    });
                }
            }

        };
    }

})(jQuery);
