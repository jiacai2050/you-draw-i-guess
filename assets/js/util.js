function postAjax(uri, data, success, fail) {
    success = success || function (resp) { console.log(resp) };

    const xmlhttp = new XMLHttpRequest();
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
        const xmlhttp = new XMLHttpRequest();
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
const deleteAjax = requestWithoutData('DELETE');
const getAjax = requestWithoutData('GET');