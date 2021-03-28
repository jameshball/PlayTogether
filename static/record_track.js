let dropdown = document.getElementById('sampling-track-dropdown')
dropdown.length = 0

let defaultOption = document.createElement('option')
defaultOption.text = 'Choose sampling track'

dropdown.add(defaultOption)
dropdown.selectedIndex = 0

// Open GET request to get tracks for score
const track_url = '/api/list_tracks/' + score_id
const request = new XMLHttpRequest()
request.responseType = "json";
request.open('GET', track_url, true)

request.onload = function () {
    if (request.status === 200) {
        const tracks_data = request.response
        console.log(tracks_data)
        let track

        for (let i=0; i < tracks_data.length; i++) {
            track = document.createElement('option')
            track.text = tracks_data[i].name
            track.value = tracks_data[i].track_id
            dropdown.add(track)
        }
    } else {
        console.error('An error occurred fetching the track options')
    }
}

request.send()

let shouldStop = false;
let stopped = false;
let rec = null

function startRecording() {
    const handleSuccess = function (stream) {
        const options = {mimeType: 'audio/webm'};
        const recordedChunks = [];
        rec = new MediaRecorder(stream, options);

        rec.addEventListener('dataavailable', function (e) {
            console.log("available");
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
            if (rec.state === "inactive") {
                let blob = new Blob(recordedChunks, {type: 'audio/mpeg-3'});
                rec.src = URL.createObjectURL(blob);
                sendRecording(blob);
            }
        });

        rec.start(2000);
    };

    navigator.mediaDevices.getUserMedia({audio: true, video: false})
        .then(handleSuccess);
}

function sendRecording(blob) {
    let elem = document.getElementById("errors");
    const track_id = document.getElementById('sampling-track-dropdown').value;
    if (track_id === 0) {
        elem.innerText = 'Please select a sampling track'
        return;
    }

    // Open POST request
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload_track/" + score_id + "/" + track_id);
    request.responseType = "json";
    request.setRequestHeader("Content-Type", "audio/mpeg-3");

    // Display result or error message to user
    request.onload = function () {
        if (request.status === 200) {
            elem.innerText = request.response;
        } else {
            elem.innerText = request.response.errors[0].defaultMessage;
        }
    }

    elem.innerText = "Please wait...";
    request.send(blob);
}

function finishRecording() {
    rec.stop()
}

