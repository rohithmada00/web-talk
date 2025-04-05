// functions for speech recognition 

var recognizing = false;
var final_transcript = '';
var transcript = '';
var start_timestamp;
let speech_to_text;

async function requestMicAccessFirst() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Mic permission granted");
        recognition.start(); // start only after permission is granted
    } catch (err) {
        console.error("Mic access error:", err.name);
        alert("Please allow mic access in Chrome settings.");
    }
}


if (!('webkitSpeechRecognition' in window)) {
    alert('This browser does not support speech recognition. Try Chrome.');
}
else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    document.addEventListener("DOMContentLoaded", () => {
        const startBtn = document.getElementById("start-btn");
        const stopBtn = document.getElementById("stop-btn");
        speech_to_text = document.getElementById("speech-to-text");

        startBtn.addEventListener("click", startButton);
        stopBtn.addEventListener("click", () => recognition.stop());
    });

    recognition.onerror = function (event) {
        console.error("Speech error:", event.error, "Trusted:", event.isTrusted, "Timestamp:", event.timeStamp);
        showInfo("Error: " + event.error);
    };


    recognition.onend = function () {
        recognizing = false;
        if (!transcript) {
            showInfo('Empty transcript');
            return;
        }

    };

    recognition.onresult = function (event) {
        var interim_transcript = '';
        var final_transcript = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        speech_to_text.innerHTML = linebreak(final_transcript);
        showInfo(interim_transcript)
        if (final_transcript || interim_transcript) {
            showInfo('inline-block');
        }
    };


    recognition.onstart = function () {
        recognizing = true;
        showInfo('User is speeking now');
    };

}
function startButton(event) {
    final_transcript = '';
    recognition.lang = "en-US";
    requestMicAccessFirst();
    speech_to_text.innerHTML = '';
    showInfo('info_allow');
    start_timestamp = event.timeStamp;
}

function stopButton(event) {
    if (recognizing) {
        recognition.stop();
        return;
    }
}

function showInfo(info) {
    console.log(info);
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function (m) { return m.toUpperCase(); });
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}