function startRecording() {

}

function finishRecording() {

}

function handleSubmit(event) {


    // Open POST request
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload_track/" + score_id + "/" + track_id);
    request.responseType = "json";
    request.setRequestHeader("Content-Type", "audio/mpeg");

    // Display result or error message to user
    let elem = document.getElementById("errors");
    request.onload = function () {
        if (request.status === 200) {
            elem.innerText = request.response;
        } else {
            elem.innerText = request.response.errors[0].defaultMessage;
        }
    }

    elem.innerText = "Please wait...";
    request.send(JSON.stringify(json));
}

const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

