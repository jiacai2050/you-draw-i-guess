function postAjax(uri, data, success, fail) {
    success = success || function (resp) { console.log(resp) };

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status < 300) {
                let resp = JSON.parse(xmlhttp.responseText);
                if (resp.code == 0) {
                    success(resp);
                } else {
                    alert(resp.errMsg);
                }
            } else {
                alert('something else other than 200 was returned');
            }
        }
    };

    xmlhttp.open("POST", uri, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(data));
}
function requestWithoutData(method) {
    return (uri, success, fail) => {
        success = success || function (resp) { console.log(resp) };
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status < 300) {
                    let resp = JSON.parse(xmlhttp.responseText);
                    if (resp.code == 0) {
                        success(resp);
                    } else {
                        alert(resp.errMsg);
                    }
                } else {
                    alert('something else other than 200 was returned');
                }
            }
        }

        xmlhttp.open(method, uri, true);
        xmlhttp.send();
    }
}
let deleteAjax = requestWithoutData('DELETE');
let getAjax = requestWithoutData('GET');

function health_monitor(roomId) {
    const socket = new WebSocket(`ws://${window.location.host}/ws/health_monitor?roomId=${roomId}`);

    socket.addEventListener('open', function (event) {
        socket.send('Hello Server!');
        // setInterval(() => {
        //     socket.close();
        // }, 5000);
    });
    socket.addEventListener('message', function (event) {
        console.log('Message from server', event.data, typeof (event.data));
    });
    return socket;
}