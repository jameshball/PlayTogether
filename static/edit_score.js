VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
const svg = document.getElementById("score");


const bars = [];
const barTimeSigs = [];
let buttons = [];

function createDeleteButton(barNum) {
    const button = document.createElement("button");
    button.innerHTML = "Remove";

    const body = document.getElementById("sheet-music");
    body.appendChild(button);
    buttons.push(button)

    button.addEventListener("click", function () {
        removeStave(barNum)
    });
}

function removeDeleteButtons() {
    for (let i = 0; i < buttons.length; i++) {
        const body = document.getElementById("sheet-music");
        body.removeChild(buttons[i])
    }
    buttons = []
}

const barWidth = 200
const maxBarsPerLine = 4
const maxViewBoxWidth = maxBarsPerLine * barWidth + 20

function renderScore() {
    removeDeleteButtons()
    if (svg.firstChild) {
        svg.removeChild(svg.firstChild)
    }
    const renderer = new VF.Renderer(svg, VF.Renderer.Backends.SVG);

    // And get a drawing context:
    const context = renderer.getContext();

    let prevTimeSig = null;
    let prevMeasure = null;
    let lastLineBarCount = 0;
    let viewBoxWidth = 10;
    let viewBoxHeight = 100;

    for (let i = 0; i < barTimeSigs.length; i++) {
        console.log(lastLineBarCount)
        if (prevMeasure == null) {
            const stave = new VF.Stave(0, 0, barWidth);
            // Size our SVG:
            viewBoxWidth += barWidth
            svg.firstChild.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)

            createDeleteButton(i)
            stave.addClef("treble").addTimeSignature(barTimeSigs[i]).setContext(context).draw()
            prevMeasure = stave
            prevTimeSig = barTimeSigs[i]
            lastLineBarCount++
        } else {
            if (lastLineBarCount >= maxBarsPerLine) {
                // if we need a new line
                viewBoxHeight += prevMeasure.height
                // we don't add onto viewBoxWidth because there's already a full line
                svg.firstChild.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
                const stave = new VF.Stave(0, prevMeasure.height + prevMeasure.y, barWidth)
                createDeleteButton(i)
                lastLineBarCount = 1

                if (prevTimeSig !== barTimeSigs[i]) {
                    stave.addTimeSignature(barTimeSigs[i])
                    prevTimeSig = barTimeSigs[i]
                }

                stave.setContext(context).draw()
                prevMeasure = stave
            } else {
                // if we don't need a new line
                viewBoxWidth = viewBoxWidth >= maxViewBoxWidth ? maxViewBoxWidth : viewBoxWidth + barWidth
                svg.firstChild.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
                const stave = new VF.Stave(prevMeasure.width + prevMeasure.x, prevMeasure.y, barWidth)
                createDeleteButton(i)
                lastLineBarCount++

                if (prevTimeSig !== barTimeSigs[i]) {
                    stave.addTimeSignature(barTimeSigs[i])
                    prevTimeSig = barTimeSigs[i]
                }

                stave.setContext(context).draw()
                prevMeasure = stave
            }
        }
    }
}

function removeStave(barNum) {
    barTimeSigs.splice(barNum, 1)
    renderScore()
}

function addBar(barData) {
    barTimeSigs.push(barData.get('time_sig'))
}

function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    // Add new bars
    let num_bars = data.get('num_bars')

    for (num_bars; num_bars > 0; num_bars--) {
        addBar(data)
        const time_sig = data.get('time_sig').split("/")
        let bar = {"top_sig": time_sig[0], "bottom_sig": time_sig[1], "tempo": data.get('tempo')}
        bars.push(bar)
    }

    renderScore()

    // Get bars as JSON
    const json = {
        "bars": bars
    }

    // Open POST request
    const request = new XMLHttpRequest();
    request.open("POST", "/api/edit_score/" + score_id);
    request.responseType = "json";
    request.setRequestHeader("Content-Type", "application/json");

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

function listTracks() {
    const container = document.getElementById("existing-tracks");
    container.innerHTML = "" // clear all existing ones

    const request = new XMLHttpRequest();
    request.open("GET", "/api/list_tracks/" + score_id);
    request.responseType = "json";

    request.onload = function () {
        if (request.status === 200) {
            request.response.forEach(track => {
                    const row = document.createElement("div")
                    row.className = "row track"
                    row.id = "track_" + track["track_id"]


                    const name = document.createElement("div")
                    name.className = "col-3"
                    name.innerText = track["name"]

                    const buttonDiv = document.createElement("div")
                    buttonDiv.className = "col-3 offset-6"

                    const button = document.createElement("button")
                    button.onclick = function () {
                        removeTrack(track["track_id"])
                    }
                    button.className = "btn btn-danger"
                    button.innerText = "Remove"

                    buttonDiv.append(button)

                    row.append(name, buttonDiv)

                    container.append(row)
                }
            )
        } else {
        }
    }

    request.send();
}

function addTrack(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const track_name = data.get('name')

    const request = new XMLHttpRequest();
    request.open("POST", "/api/add_track/" + score_id);
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function () {
        listTracks()
    }

    request.send(JSON.stringify({
        "name": track_name
    }))
}

function removeTrack(track_id) {
    const request = new XMLHttpRequest();
    request.open("DELETE", "/api/delete_track/" + score_id + "/" + track_id);

    request.onload = function () {
        if (request.status === 200) {
            document.getElementById("track_" + track_id).remove();
        } else {
        }
    }
    request.send();
}

const barForm = document.getElementById('bar_form');
barForm.addEventListener('submit', handleSubmit);

const trackForm = document.getElementById('track_form');
trackForm.addEventListener('submit', addTrack)
listTracks()