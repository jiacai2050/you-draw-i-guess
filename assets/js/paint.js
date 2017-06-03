const FLAG_PENCEL = 1;
const FLAG_ERASER = 2;
let canvas = null;
let ctx = null;
//  1  pencil
//  2  eraser
let status = 0;
let lastStatus = FLAG_PENCEL;

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
            y: y / canvas.height,
            status: status,
            color: ctx.strokeStyle
        };
        points.push(p);
        if (points.length > 20) {
            conv.send(new AV.TextMessage(JSON.stringify(points))).then(function (message) {
                console.log(message.text + " send!");
            }).catch(console.error.bind(console));
            points = [];
        }
    }

}
function touchEndHandler(e) {
    lastStatus = status;
    status = 0;
    if (points.length > 0 && !e.remote) {
        conv.send(new AV.TextMessage(JSON.stringify(points))).then(function (message) {
            console.log(message.text + " send!");
        }).catch(console.error.bind(console));
        points = [];
    }
}
function draw() {
    canvas = document.getElementById('tutorial');
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.5;
    ctx = canvas.getContext('2d');

    canvas.ontouchstart = touchStartHandler;
    canvas.ontouchmove = touchMoveHandler;
    canvas.ontouchend = touchEndHandler;

    canvas.onmousedown = canvas.ontouchstart;
    canvas.onmousemove = canvas.ontouchmove;
    canvas.onmouseup = canvas.ontouchend;

    let chooseColor = document.getElementById("choose-color");
    let predefinedColors = ["fuchsia", "darkorchid", "red", "green", "blue", "black", "teal", "orange"];
    for (let c of predefinedColors) {
        let div = document.createElement("div");
        div.style['background-color'] = c;
        chooseColor.appendChild(div);
    }
    chooseColor.onclick = function (e) {
        ctx.strokeStyle = e.target.style['background-color'];
        ctx.globalCompositeOperation = 'source-over';
        lastStatus = FLAG_PENCEL;
        status = 0;
    }
    // disable page scolling
    // https://coderwall.com/p/w_likw/enable-disable-scrolling-in-iphone-ipad-s-safari
    document.ontouchmove = function (e) { e.preventDefault(); return false; }

    document.getElementById('pencil').onclick = function (e) {
        ctx.globalCompositeOperation = 'source-over';
        lastStatus = FLAG_PENCEL;
        status = 0;
    };
    document.getElementById('eraser').onclick = function (e) {
        ctx.globalCompositeOperation = 'destination-out';
        lastStatus = FLAG_ERASER;
        status = 0;
    };

    document.getElementById('rollback').onclick = function (e) {
        if (confirm("确定吗？")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    document.getElementById('gohome').onclick = function (e) {
        if (confirm("确定返回首页吗？")) {
            window.location = '/';
        }
    };
}