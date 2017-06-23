; (async function ($) {

    let canvas = null;
    let ctx = null;

    const FLAG_PENCEL = 1;
    const FLAG_ERASER = 2;
    //  1  pencil
    //  2  eraser
    let status = 0;
    let lastStatus = FLAG_PENCEL;

    window.document.body.onload = () => {
        initCanvas();

        const msgInput = document.getElementById('message');
        const sendBtn = document.getElementById('send');
        sendBtn.onclick = function (e) {
            addBulletScreens(`${currentUserName}: ${msgInput.value}`);
            sendMessage({ 'type': 'msg', 'value': msgInput.value });
        };
        msgInput.onkeypress = function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) { // 13 is enter
                addBulletScreens(`${currentUserName}: ${msgInput.value}`);
                sendMessage({ 'type': 'msg', 'value': msgInput.value });
            }
        };
    }

    const realtime = new Realtime({
        appId: appId,
        region: 'cn', // 美国节点为 "us"
        noBinary: true,
    });
    const imClient = await realtime.createIMClient(currentUserName);
    let conv = await imClient.getConversation(convId);
    conv = await conv.join();
    startGame();


    async function sendMessage(msg) {
        const sent = await conv.send(new AV.TextMessage(JSON.stringify(msg)));
        console.log(`${sent.text} send!`);
    }
    function touchStartHandler(e) {
        if (status === 0) {
            status = lastStatus;
        }
        ctx.beginPath();
        let x, y;
        if (e.remote) {
            x = e.clientX + canvas.offsetLeft;
            y = e.clientY + canvas.offsetTop;
            console.log(`move to ${x}:${y}`);
        } else {
            let ex = e.clientX || e.touches[0].clientX;
            let ey = e.clientY || e.touches[0].clientY;
            x = ex - canvas.offsetLeft;
            y = ey - canvas.offsetTop;
        }
        ctx.moveTo(x, y);

    }
    let points = [];
    function touchMoveHandler(e) {
        let x, y;

        if (e.remote) {
            x = e.clientX + canvas.offsetLeft;
            y = e.clientY + canvas.offsetTop;
        } else {
            let ex = e.clientX || e.touches[0].clientX;
            let ey = e.clientY || e.touches[0].clientY;
            x = ex - canvas.offsetLeft;
            y = ey - canvas.offsetTop;
        }

        if (status & FLAG_PENCEL) {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (status & FLAG_ERASER) {
            let radius = 5;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();
        }
        if (status > 0 && !e.remote) {
            let p = {
                x: x / canvas.width,
                y: y / canvas.height
            };
            points.push(p);
            if (points.length > 20) {
                sendMessage(points);
                points = [];
            }
        }

    }
    function touchEndHandler(e) {
        lastStatus = status;
        status = 0;
        if (points.length > 0 && !e.remote) {
            sendMessage(points);
            points = [];
        }
    }
    function usePencil(e) {
        ctx.globalCompositeOperation = 'source-over';
        lastStatus = FLAG_PENCEL;
        status = 0;
        if (!e.remote) {
            sendMessage({
                "type": 'event',
                'src': 'pencil'
            });
        }

    };
    function useEraser(e) {
        ctx.globalCompositeOperation = 'destination-out';
        lastStatus = FLAG_ERASER;
        status = 0;
        if (!e.remote) {
            sendMessage({
                "type": 'event',
                'src': 'eraser'
            });
        }

    };
    function useRollback(e) {
        if (!e.remote) {
            if (confirm("确定吗？")) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                sendMessage({
                    "type": 'event',
                    'src': 'rollback'
                });
            }
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

    };
    function useColor(e) {
        if (!e.remote) {
            ctx.strokeStyle = e.target.style['background-color'];
            sendMessage({
                "type": 'event',
                'src': 'color',
                'value': e.target.style['background-color']
            });
        } else {
            ctx.strokeStyle = e.color;
        }
        ctx.globalCompositeOperation = 'source-over';
        lastStatus = FLAG_PENCEL;
        status = 0;

    }

    function addBulletScreens(bullet) {
        $('body').barrager({
            'info': bullet,
            'close': true
        });
    }

    function initCanvas() {
        canvas = document.getElementById('ydig');
        canvas.width = window.innerWidth * 0.95;
        canvas.height = window.innerHeight * 0.5;
        ctx = canvas.getContext('2d');

        canvas.ontouchstart = touchStartHandler;
        canvas.ontouchmove = touchMoveHandler;
        canvas.ontouchend = touchEndHandler;

        canvas.onmousedown = canvas.ontouchstart;
        canvas.onmousemove = canvas.ontouchmove;
        canvas.onmouseup = canvas.ontouchend;

        const chooseColor = document.getElementById("choose-color");
        const predefinedColors = ["fuchsia", "darkorchid", "red", "green", "blue", "black", "teal", "orange"];
        for (const c of predefinedColors) {
            const div = document.createElement("div");
            div.style['background-color'] = c;
            chooseColor.appendChild(div);
        }
        chooseColor.onclick = useColor;

        // disable page scolling
        // https://coderwall.com/p/w_likw/enable-disable-scrolling-in-iphone-ipad-s-safari
        document.ontouchmove = function (e) { e.preventDefault(); return false; }

        document.getElementById('pencil').onclick = usePencil;
        document.getElementById('eraser').onclick = useEraser;
        document.getElementById('rollback').onclick = useRollback;
    }
    function startGame() {
        imClient.on('message', function (message, conversation) {
            const text = JSON.parse(message.text);
            if (Array.isArray(text)) {
                const points = text;
                const startPoint = points.shift();

                touchStartHandler({
                    clientX: startPoint.x * canvas.width,
                    clientY: startPoint.y * canvas.height,
                    remote: true
                })

                for (const p of points) {
                    touchMoveHandler({
                        clientX: p.x * canvas.width,
                        clientY: p.y * canvas.height,
                        remote: true
                    })
                }
                touchEndHandler({ remote: true });
            } else {
                const e = text;
                if (e.type === 'msg') {
                    addBulletScreens(`${message.from}: ${e.value}`);
                } else if (e.type === 'event') {
                    const ehs = {
                        'pencil': usePencil,
                        'eraser': useEraser,
                        'rollback': useRollback,
                        'color': useColor
                    };
                    if (e.src === 'color') {
                        ehs[e.src]({
                            'remote': true,
                            'color': e.value
                        });
                    } else {
                        ehs[e.src]({ 'remote': true });
                    }
                } else {
                    console.log(`get unknown ${text}...`)
                }
            }
        });
    }
})(jQuery);