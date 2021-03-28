// MIT License
//
// Copyright (c) 2017 Adam Hill
// Modified by James Ball 2021
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

$(document).ready(function () {
    const bpbMin = 1;
    const bpbMax = 16;
    let beat = 1; // the current beat in the bar
    let beatsPerBar = bars[0].top_sig;
    let clicksPerBeat = 1;
    let tempo = bars[0].tempo; // in beats per minute
    let isPlaying = false;
    let barIndex = 0;
    let interval; // used to hold the setInterval data so it can be cleared when the metronome stops

    document.getElementById('tempo').innerText = tempo;
    document.getElementById('top_sig').innerText = beatsPerBar;
    document.getElementById('bottom_sig').innerText = bars[0].bottom_sig;

    const record = $("#record");

    // Create the sound effects
    // Howler.js was used to enable overlapping sound effects
    let highBlockSound = new Howl({
        src: ["../../static/metro_up.mp3"]
    });

    let lowBlockSound = new Howl({
        src: ["../../static/metro_down.mp3"]
    });

    let subdivisionLowBlockSound = new Howl({
        src: ["../../static/metro_down.mp3"]
    });

    // Function to handle starting and stopping the metronome
    record.click(function () {
        tempo = bars[0].tempo
        beatsPerBar = bars[0].top_sig
        if (!isPlaying) {
            isPlaying = true;
            startRecording().then(playClick);
        } else {
            clearInterval(interval); // this stops the sound effects from playing
            beat = 1; // reset the beat to the down beat
            barIndex = 0;
            isPlaying = false;
            finishRecording();
        }
    });

    // This function handles playing the click sound
    // Each time playClick() is called, the beat variable is incremented so we know what beat we're on
    function playClick() {
        if ((beat % (beatsPerBar * clicksPerBeat)) === 1) {
            clearInterval(interval);
            if (barIndex >= bars.length) {
                isPlaying = false;
                barIndex = 0;
                finishRecording();
                return;
            }
            tempo = bars[barIndex].tempo;
            document.getElementById('tempo').innerText = tempo;
            beatsPerBar = bars[barIndex].top_sig;
            document.getElementById('top_sig').innerText = beatsPerBar;
            document.getElementById('bottom_sig').innerText = bars[barIndex].bottom_sig;
            const secs = beatsPerBar / (tempo/60.0)
            group.style.transition = 'transform ' + secs + 's linear';
            group.style.transform = 'translate(-' + (200 * (barIndex + 1)) + 'px, 0)';
            beat = 1;
            interval = setInterval(playClick, (60000 / tempo) / clicksPerBeat);
            // We're on the down beat of the bar
            highBlockSound.play();
            barIndex++;
        } else if (((beat % clicksPerBeat) === 1) || (clicksPerBeat === 1)) {
            // We're on a strong beat (aside from the down beat)
            lowBlockSound.play();
        } else {
            // We're on a subdivision of the beat
            subdivisionLowBlockSound.play();
        }
        beat++;
    }
});