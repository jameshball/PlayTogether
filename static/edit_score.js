VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
const svg = document.getElementById("score");
svg.setAttribute('width', '100%');
svg.setAttribute('height', '100%');
svg.setAttribute('viewBox', '0 0 500 500'); // or whatever your defaults were
svg.setAttribute('preserveAspectRatio', 'xMidYMid');

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

const staves = []

function renderScore(staves) {
    for (let i = 0; i < staves.length; i++) {
        staves[i].draw()
    }
}

function addStave(barData) {
    const time_sig = barData.get('time_sig')
    let res

    if (prevMeasure == null) {
        const stave = new VF.Stave(10, 0, 200);
        res = stave.addClef("treble").addTimeSignature(time_sig).setContext(context)
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

            res = stave.setContext(context)
            prevMeasure = stave
        } else {
            const stave = new VF.Stave(prevMeasure.width + prevMeasure.x, prevMeasure.y, 200)
            currWidth++

            if (prevTimeSig !== time_sig) {
                stave.addTimeSignature(time_sig)
                prevTimeSig = time_sig
            }

            res = stave.setContext(context)
            prevMeasure = stave
        }
    }

    staves.push(res)
}

function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);

    // Add new bars
    let num_bars = data.get('num_bars')

    for (num_bars; num_bars > 0; num_bars--) {
        addStave(data)
        const time_sig = data.get('time_sig').split("/")
        let bar = {"top_sig": time_sig[0], "bottom_sig": time_sig[1], "tempo": data.get('tempo')}
        bars.push(bar)
    }

    renderScore(staves)

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

