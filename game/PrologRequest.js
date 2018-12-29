function getPrologRequest(requestString, onSuccess, onError, port) {
    var requestPort = port || 8081
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true);

    request.onload = onSuccess || function (data) { console.log("Request successful. Reply: " + data.target.response); };
    request.onerror = onError || function () { console.log("Error waiting for response"); };

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

// Make Request
function makeRequest(requestString) {
    return new Promise(function(resolve, reject) {
        getPrologRequest(requestString, function (data) { resolve(data.target.response); });
    });

    // getPrologRequest(requestString, handleReply);
}

//Handle the Reply
function handleReply(data) {
    console.log('Data: ' + data.target.response);
}