let track_data = null;
VF = Vex.Flow;
let audio_elems = {}

function updateAudioElements(event) {
    const dropdown = event.target
    if (dropdown.value === 0) {
        return
    }
    const samples_url = '/api/get_sample/' + dropdown.value
    const request = new XMLHttpRequest()
    request.responseType = "blob";
    request.open('GET', samples_url, true)

    request.onload = function () {
        if (request.status === 200) {
            if (dropdown.id in audio_elems) {
                document.body.removeChild(audio_elems[dropdown.id])
            }
            let audio_file = request.response
            let audio_elem = document.createElement('audio')
            audio_elem.src = URL.createObjectURL(audio_file)
            audio_elem.type = "audio/mpeg"
            document.body.appendChild(audio_elem)
            audio_elems[dropdown.id] = audio_elem
        } else {
            console.error('An error occurred fetching the sample')
        }
    }

    request.send()
}


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
            track_data = request.response
            let track

            for (let i = 0; i < track_data.length; i++) {
                track = document.createElement('option')
                track.text = track_data[i].name
                track.value = track_data[i].track_id
                dropdown.add(track)
                track_data[i].elem = track

                // Open GET request to get backing track samples for each track_id
                const box = document.createElement('div')
                // Create checkbox for track_id
                let checkbox = document.createElement('input')
                checkbox.type = "checkbox"
                checkbox.text = track_data[i].name
                checkbox.value = track_data[i].track_id
                checkbox.id = "checkbox_" + track_data[i].track_id

                let sample_dropdown = document.createElement('select')
                sample_dropdown.length = 0

                let defaultOption = document.createElement('option')
                defaultOption.text = 'Choose backing track'
                defaultOption.value = '0'

                sample_dropdown.add(defaultOption)
                sample_dropdown.selectedIndex = 0
                sample_dropdown.id = "sample_dropdown_" + track_data[i].track_id
                sample_dropdown.onchange = updateAudioElements

                const samples_url = '/api/list_samples/' + track_data[i].track_id
                const request = new XMLHttpRequest()
                request.responseType = "json";
                request.open('GET', samples_url, true)

                request.onload = function () {
                    if (request.status === 200) {
                        let samples = request.response
                        track_data[i].samples = samples

                        for (let j = 0; j < samples.length; j++) {
                            let option = document.createElement('option')
                            option.text = 'Recording ' + samples[j].recording_number + ': ' + samples[j].created_at
                            option.value = samples[j].sample_id
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
        } else {
            console.error('An error occurred fetching the track options')
        }
    }

    request.send()
}

let rec = null

function startRecording() {
    const handleSuccess = function (stream) {
        const options = {mimeType: 'audio/webm'};
        const recordedChunks = [];
        rec = new MediaRecorder(stream, options);

        rec.addEventListener('dataavailable', function (e) {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        });

        rec.addEventListener('stop', function () {
            let blob = new Blob(recordedChunks, {type: 'audio/mpeg'});
            rec.src = URL.createObjectURL(blob);
            sendRecording(blob);
        });

        for (let key in audio_elems) {
            if (document.getElementById(key).parentElement.lastChild.checked) {
                audio_elems[key].play();
            }
        }

        rec.start(2000);
    };

    return navigator.mediaDevices.getUserMedia({audio: true, video: false})
        .then(handleSuccess);
}

function sendRecording(blob) {
    let elem = document.getElementById("errors");
    const track_id = document.getElementById('sampling-track-dropdown').value;
    if (track_id === "0") {
        elem.innerText = 'Please select a sampling track'
        return;
    }

    // Open POST request
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload_track/" + score_id + "/" + track_id);
    request.responseType = "json";
    request.setRequestHeader("Content-Type", "audio/mpeg");

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

let group

function finishRecording() {
    rec.stop()
    for (let key in audio_elems) {
        audio_elems[key].pause();
        audio_elems[key].currentTime = 0;
    }
    group.style.transition = 'transform 0.5s linear';
    group.style.transform = 'translate(0, 0)';
}

function setupScore() {
    const div = document.getElementById('score')
    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG)
    const context = renderer.getContext()

    group = context.openGroup();

    let prevTimeSig = null

    for (let i = 0; i < bars.length; i++) {
        const time_sig = bars[i].top_sig + '/' + bars[i].bottom_sig
        const tempo = bars[i].tempo

        if (prevTimeSig == null) {
            new VF.Stave(10 + (i * 200), 10, 200).addClef('treble').addTimeSignature(time_sig).setContext(context).draw()
        } else {
            if (prevTimeSig !== time_sig) {
                new VF.Stave(10 + (i * 200), 10, 200).addTimeSignature(time_sig).setContext(context).draw()
            } else {
                new VF.Stave(10 + (i * 200), 10, 200).setContext(context).draw()
            }
        }

        prevTimeSig = time_sig
    }

    context.closeGroup(); // and close the group

    const box = group.getBoundingClientRect();
}

getSamplingTracks();
setupScore()

