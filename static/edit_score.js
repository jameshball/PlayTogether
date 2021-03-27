VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
const svg = document.getElementById("score");


const bars = [];
const barTimeSigs = [];
let buttons = [];

function createDeleteButton(barNum) {
    const button = document.createElement("button");
    button.innerHTML = "do something";

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

let renderer = new VF.Renderer(svg, VF.Renderer.Backends.SVG);

function renderScore() {
    removeDeleteButtons()
    svg.removeChild(svg.firstChild)
    renderer = new VF.Renderer(svg, VF.Renderer.Backends.SVG);

    // Size our SVG:
    let currMaxHeight = 100;
    renderer.resize(800, currMaxHeight);

    // And get a drawing context:
    const context = renderer.getContext();

    let prevTimeSig = null;
    let prevMeasure = null;
    let currWidth = 0;
    currMaxHeight = 100;
    renderer.resize(800, currMaxHeight);

    for (let i = 0; i < barTimeSigs.length; i++) {
        console.log(currWidth)
        if (prevMeasure == null) {
            const stave = new VF.Stave(10, 0, 200);
            createDeleteButton(i)
            stave.addClef("treble").addTimeSignature(barTimeSigs[i]).setContext(context).draw()
            prevMeasure = stave
            prevTimeSig = barTimeSigs[i]
            currWidth++
        } else {
            if (currWidth >= 4) {
                currMaxHeight += prevMeasure.height
                renderer.resize(800, currMaxHeight)
                const stave = new VF.Stave(10, prevMeasure.height + prevMeasure.y, 200)
                createDeleteButton(i)
                currWidth = 1

                if (prevTimeSig !== barTimeSigs[i]) {
                    stave.addTimeSignature(barTimeSigs[i])
                    prevTimeSig = barTimeSigs[i]
                }

                stave.setContext(context).draw()
                prevMeasure = stave
            } else {
                const stave = new VF.Stave(prevMeasure.width + prevMeasure.x, prevMeasure.y, 200)
                createDeleteButton(i)
                currWidth++

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

const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

