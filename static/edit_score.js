VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
const div = document.getElementById("score");
const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

// Size our SVG:
renderer.resize(500, 200);

// And get a drawing context:
const context = renderer.getContext();

// Create a stave at position 10, 40 of width 400 on the canvas.
const stave = new VF.Stave(10, 40, 400);

// Add a clef and time signature.
//stave.addClef("treble").addTimeSignature("4/4");

// Connect it to the rendering context and draw!
stave.setContext(context).draw();

const bars = [];

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

    // Re-render score

    // Get bars as JSON
    const json = {
        "bars": bars
    }

    console.log(json)

    // Open POST request
    const url = window.location.href
    const score_id = url.substr(url.lastIndexOf('/') + 1);
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

