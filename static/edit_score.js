VF = Vex.Flow;

let bars = []
let buttons = [];
const sheet_music = document.getElementById("sheet_music")

function createDeleteButton(barNum, col) {
    const button = document.createElement("button");
    button.className = "btn btn-sm btn-danger"
    button.innerHTML = "Remove";
    buttons.push(button)

    col.append(button)

    button.addEventListener("click", function () {
        removeStave(barNum)
    });
}

function timeSigString(bar) {
    return bar["top_sig"] + "/" + bar["bottom_sig"];
}

const barWidth = 200
const maxBarsPerLine = 4
const maxViewBoxWidth = maxBarsPerLine * barWidth + 1

function renderScore() {
    buttons = []
    sheet_music.innerHTML = ""

    let prevBarTimeSig = "";
    let prevMeasure = null;
    let viewBoxWidth = maxViewBoxWidth;
    let viewBoxHeight = 100;

    for (let firstOfLine = 0; firstOfLine < bars.length; firstOfLine += maxBarsPerLine) {
        const line = document.createElement("div")
        line.className = "row"

        const staveRow = document.createElement("div")
        staveRow.className = "row"

        const staveDiv = document.createElement("div")
        staveDiv.className = "col-12"
        staveDiv.style.padding = "0"

        staveRow.append(staveDiv)

        const buttonRow = document.createElement("div")
        buttonRow.className = "row"

        line.append(staveRow, buttonRow)

        sheet_music.append(line)

        const renderer = new VF.Renderer(staveDiv, VF.Renderer.Backends.SVG)
        const context = renderer.getContext()
        for (let i = firstOfLine; i < Math.min(firstOfLine + maxBarsPerLine, bars.length); i++) {
            const curBarTimeSig = timeSigString(bars[i])
            const buttonCol = document.createElement("div")
            buttonCol.className = "col-" + (12 / maxBarsPerLine)
            buttonCol.style.padding = "0"
            buttonRow.append(buttonCol)

            createDeleteButton(i, buttonCol)

            viewBoxWidth = viewBoxWidth >= maxViewBoxWidth ? maxViewBoxWidth : viewBoxWidth + barWidth
            staveDiv.firstChild.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`)

            if (i === 0) {
                const stave = new VF.Stave(0, 0, barWidth);

                stave.addClef("treble").addTimeSignature(curBarTimeSig).setContext(context).draw()
                prevMeasure = stave
                prevBarTimeSig = curBarTimeSig
            } else if (i === firstOfLine) {
                const stave = new VF.Stave(0, 0, barWidth);

                if (prevBarTimeSig !== curBarTimeSig) {
                    stave.addTimeSignature(curBarTimeSig)
                    prevBarTimeSig = curBarTimeSig
                }

                stave.setContext(context).draw()
                prevMeasure = stave
                prevBarTimeSig = curBarTimeSig
            } else {
                const stave = new VF.Stave(prevMeasure.width + prevMeasure.x, prevMeasure.y, barWidth)

                if (prevBarTimeSig !== curBarTimeSig) {
                    stave.addTimeSignature(curBarTimeSig)
                    prevBarTimeSig = curBarTimeSig
                }

                stave.setContext(context).draw()
                prevMeasure = stave
            }
        }
    }
}

function removeStave(barNum) {
    bars.splice(barNum, 1)
    renderAndUpload()
}

function loadBars() {
    const request = new XMLHttpRequest();
    request.open("GET", "/api/get_score/" + score_id);
    request.responseType = "json";
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function () {
        if (request.status === 200) {
            bars = request.response["bars"]
            renderScore()
        } else {
        }
    }
    request.send()
}

function renderAndUpload() {
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

function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    // Add new bars
    let num_bars = data.get('num_bars')

    for (num_bars; num_bars > 0; num_bars--) {
        const time_sig = data.get('time_sig').split("/")
        let bar = {"top_sig": time_sig[0], "bottom_sig": time_sig[1], "tempo": data.get('tempo')}
        bars.push(bar)
    }

    renderAndUpload()
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
                    row.style.marginBottom = "10px"
                    row.style.borderColor = "dimgrey"
                    row.style.border = "1px"
                    row.className = "row track"
                    row.id = "track_" + track["track_id"]

                    const name = document.createElement("div")
                    name.className = "col-2"
                    name.innerText = track["name"]

                    const buttonDiv = document.createElement("div")
                    buttonDiv.className = "col-2 offset-6"

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

loadBars()
listTracks()