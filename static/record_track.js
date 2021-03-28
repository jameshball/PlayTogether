let shouldStop = false;
let stopped = false;
let mediaRecorder = null;

function getSamplingTracks() {
    let dropdown = document.getElementById('sampling-track-dropdown')
    dropdown.length = 0

    let defaultOption = document.createElement('option')
    defaultOption.text = 'Choose sampling track'
    defaultOption.value = '0'

    dropdown.add(defaultOption)
    dropdown.selectedIndex = 0

    let backing_tracks = document.getElementById('backing-track-options')

    // Open GET request to get tracks for score
    const track_url = '/api/list_tracks/' + score_id
    const request = new XMLHttpRequest()
    request.responseType = "json";
    request.open('GET', track_url, true)

    request.onload = function () {
        if (request.status === 200) {
            const track_data = request.response
            let track

            for (let i = 0; i < track_data.length; i++) {
                track = document.createElement('option')
                track.text = track_data[i].name
                track.value = track_data[i].track_id
                dropdown.add(track)

                // Open GET request to get backing track samples for each track_id
                for (let i = 0; i < track_data.length; i++) {
                    const box = document.createElement('div')
                    // Create checkbox for track_id
                    let checkbox = document.createElement('input')
                    checkbox.type = "checkbox"
                    checkbox.text = track_data[i].name
                    checkbox.value = track_data[i].track_id
                    checkbox.id = "id"

                    let sample_dropdown = document.createElement('select')
                    sample_dropdown.length = 0

                    let defaultOption = document.createElement('option')
                    defaultOption.text = 'Choose backing track'
                    defaultOption.value = '0'

                    sample_dropdown.add(defaultOption)
                    sample_dropdown.selectedIndex = 0

                    const samples_url = '/api/list_samples/' + track_data[i].track_id
                    const request = new XMLHttpRequest()
                    request.responseType = "json";
                    request.open('GET', samples_url, true)

                    request.onload = function () {
                        if (request.status === 200) {
                            samples = request.response

                            for (let i = 0; i < samples.length; i++) {
                                option = document.createElement('option')
                                option.text = samples[i].track_id
                                option.value = track_data[i].date
                                sample_dropdown.add(option)
                            }
                        } else {
                            console.error('An error occurred fetching the sample options')
                        }
                    }

                    request.send()

                    box.appendChild(document.createTextNode(track_data[i].name))
                    box.appendChild(sample_dropdown)
                    box.appendChild(checkbox)
                    backing_tracks.appendChild(box)
                }
            }
        } else {
            console.error('An error occurred fetching the track options')
        }
    }

    request.send()
}

function startRecording() {
    const handleSuccess = function (stream) {
        const options = {mimeType: 'audio/webm'};
        const recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.addEventListener('dataavailable', function (e) {
            console.log("available");
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        });

        mediaRecorder.addEventListener('stop', function () {
            console.log("stop");
            downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
            downloadLink.download = 'acetest.wav';
        });

        mediaRecorder.start(2000);
    };

    navigator.mediaDevices.getUserMedia({audio: true, video: false})
        .then(handleSuccess);
}

function finishRecording() {
    mediaRecorder.stop()
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

getSamplingTracks();

