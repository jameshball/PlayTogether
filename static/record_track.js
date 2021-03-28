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
        const tracks_data = JSON.parse(request.responseText)
        console.log(tracks_data)
        let track

        for (let i=0; i < tracks_data.length; i++) {
            track = document.createElement('track')
            track.text = tracks_data[i].name
            track.value = tracks_data[i].track_id
            dropdown.add(track)
        }
    } else {
        console.error('An error occurred fetching the track options')
    }
}

request.send()

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

