; (async function ($) {

    let canvas = null;
    let ctx = null;
    let points = [];
    class CanvasStatus {
        constructor() {
            this.FLAG_PENCEL = 0b01;
            this.FLAG_ERASER = 0b10;
            this.current = 0;
            this.last = this.FLAG_PENCEL; // 默认为绘画状态
        }
        init() {
            if (this.current === 0) {
                this.current = this.last;
            }
        }
        saveLast() {
            this.last = this.current;
            this.current = 0;
        }
        inWorking() {
            return this.current > 0;
        }
        setDrawing() {
            this.last = this.FLAG_PENCEL;
            this.current = 0;
        }
        setErasering() {
            this.last = this.FLAG_ERASER;
            this.current = 0;
        }
        isDrawing() {
            return (this.current & 0b11) === this.FLAG_PENCEL;
        }
        isErasering() {
            return (this.current & 0b11) === this.FLAG_ERASER;
        }
    }
    const canvasStatus = new CanvasStatus();

    window.document.body.onload = () => {
        initCanvas();

        const msgInput = document.getElementById('message');
        const sendBtn = document.getElementById('send');
        sendBtn.onclick = function (e) {
            if (msgInput.value.trim() !== '') {
                addBulletScreens(`${currentUserName}: ${msgInput.value}`);
                sendMessage({ 'type': 'msg', 'value': msgInput.value });
                msgInput.value = '';
            }
        };
        msgInput.onkeypress = function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) { // 13 is enter
                sendBtn.click();
            }
        };
    }
    const imClient = await realtime.createIMClient(currentUserName);
    let conv = await imClient.getConversation(convId);
    conv = await conv.join();
    startGame();

    async function sendMessage(msg) {
        const sent = await conv.send(new AV.TextMessage(JSON.stringify(msg)));
        console.log(`${sent.text} send!`);
    }
    function touchStartHandler(e) {
        canvasStatus.init();
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
    function touchMoveHandler(e) {

        if (canvasStatus.inWorking()) {
            let x, y;
            if (e.remote) {
                x = e.clientX + canvas.offsetLeft;
                y = e.clientY + canvas.offsetTop;
            } else {
                let ex = e.clientX || e.touches[0].clientX;
                let ey = e.clientY || e.touches[0].clientY;
                x = ex - canvas.offsetLeft;
                y = ey - canvas.offsetTop;

                points.push({
                    x: (x / canvas.width).toFixed(4),
                    y: (y / canvas.height).toFixed(4)
                });
                if (points.length > 10) {
                    sendMessage(points);
                    points = [];
                }
            }

            if (canvasStatus.isDrawing()) {
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (canvasStatus.isErasering()) {
                let radius = 5;
                ctx.arc(x, y, radius, 0, Math.PI * 2, true);
                ctx.fill();
            }
        }

    }
    function touchEndHandler(e) {

        if (points.length > 0 && !e.remote) {
            sendMessage(points);
            points = [];
        }

        canvasStatus.saveLast();
    }
    function usePencil(e) {
        ctx.globalCompositeOperation = 'source-over';
        canvasStatus.setDrawing();

        if (!e.remote) {
            sendMessage({
                "type": 'event',
                'src': 'pencil'
            });
        }

    };
    function useEraser(e) {
        ctx.globalCompositeOperation = 'destination-out';
        canvasStatus.setErasering();
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
        canvasStatus.setDrawing();
        console.log(`set color to ${ctx.strokeStyle}`);

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

        canvas.onmousedown = touchStartHandler;
        canvas.onmousemove = touchMoveHandler;
        canvas.onmouseup = touchEndHandler;

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

        document.getElementById('logout').onclick = (e) => {
            if (confirm("确认嘛？")) {
                getAjax('/logout', (resp) => {
                    window.location = "/login";
                });
            }
        };
    }
    async function startGame() {
        const messageHandler = (message) => {
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
        }
        imClient.on('message', function (message, conversation) {
            if (conversation.id === convId) {
                messageHandler(message);
            }
        });
        const historyMsgs = await conv.queryMessages({ 'limit': 100 });
        for (const m of historyMsgs) {
            // 忽略弹幕
            if (JSON.parse(m.text).type !== 'msg') {
                messageHandler(m);
            }
        }
        const numOnlineMembers = document.getElementById('numOnlineMembers');
        setInterval(async () => {
            const c = await conv.count();
            numOnlineMembers.innerHTML = c;
        }, 2000);

    }
})(jQuery);