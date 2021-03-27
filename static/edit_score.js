VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
const svg = document.getElementById("score");
const renderer = new VF.Renderer(svg, VF.Renderer.Backends.SVG);

// Size our SVG:
let currMaxHeight = 100;
renderer.resize(800, currMaxHeight);

// And get a drawing context:
const context = renderer.getContext();

const bars = [];

let prevTimeSig = null;
let prevMeasure = null;
let currWidth = 0;

function renderBar(barData) {
    const time_sig = barData.get('time_sig')

    if (prevMeasure == null) {
        const stave = new VF.Stave(10, 0, 200);
        stave.addClef("treble").addTimeSignature(time_sig).setContext(context).draw()
        prevMeasure = stave
        prevTimeSig = time_sig
        currWidth++
    } else {
        if (currWidth >= 4) {
            currMaxHeight += prevMeasure.height
            renderer.resize(800, currMaxHeight)
            const stave = new VF.Stave(10, prevMeasure.height + prevMeasure.y, 200)
            currWidth = 1

            if (prevTimeSig !== time_sig) {
                stave.addTimeSignature(time_sig)
                prevTimeSig = time_sig
            }

            stave.setContext(context).draw()
            prevMeasure = stave
        } else {
            const stave = new VF.Stave(prevMeasure.width + prevMeasure.x, prevMeasure.y, 200)
            currWidth++

            if (prevTimeSig !== time_sig) {
                stave.addTimeSignature(time_sig)
                prevTimeSig = time_sig
            }

            stave.setContext(context).draw()
            prevMeasure = stave
        }
    }

    console.log(currWidth)
}

function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const new_bars = []

    // Add new bars
    let num_bars = data.get('num_bars')

    for (num_bars; num_bars > 0; num_bars--) {
        renderBar(data)
        const time_sig = data.get('time_sig').split("/")
        let bar = {"top_sig": time_sig[0], "bottom_sig": time_sig[1], "tempo": data.get('tempo')}
        bars.push(bar)
    }

    // Get bars as JSON
    const json = {
        "bars": bars
    }

    console.log(json)

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

