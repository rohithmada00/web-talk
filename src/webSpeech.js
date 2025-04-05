// speech recognition logic

var recognizing = false;
var final_transcript = '';
var transcript = '';
var start_timestamp;
let speech_to_text;

// detect if user was redirected to a full tab for mic access
const urlParams = new URLSearchParams(window.location.search);
const micRedirected = urlParams.get('mic') === '1';

if (!('webkitSpeechRecognition' in window)) {
    alert('This browser does not support speech recognition. Try Chrome.');
} else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    document.addEventListener("DOMContentLoaded", () => {
        const startBtn = document.getElementById("start-btn");
        const stopBtn = document.getElementById("stop-btn");
        speech_to_text = document.getElementById("speech-to-text");

        startBtn.addEventListener("click", startButton);
        stopBtn.addEventListener("click", stopButton);

        // Optional: clean up URL after redirect
        if (micRedirected) {
            history.replaceState(null, '', window.location.pathname);
        }
    });

    recognition.onerror = function (event) {
        console.error("Speech error:", event.error, "Trusted:", event.isTrusted, "Timestamp:", event.timeStamp);
        showInfo("Error: " + event.error);
    };

    recognition.onend = function () {
        recognizing = false;
        if (!transcript) {
            showInfo('Empty transcript');
        }
    };

    recognition.onresult = function (event) {
        var interim_transcript = '';
        final_transcript = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        speech_to_text.innerHTML = linebreak(final_transcript);
        showInfo(interim_transcript);
    };

    recognition.onstart = function () {
        recognizing = true;
        showInfo('User is speaking now');
    };
}

// mic permission + redirect handler
async function ensureMicPermissionOrRedirect(event) {
    const permission = await navigator.permissions.query({ name: 'microphone' });

    if (permission.state === 'granted') {
        return true;
    }

    if (micRedirected) {
        return true; // already redirected, don't prompt again
    }

    const url = chrome.runtime.getURL('src/ui/pages/panel.html') + '?mic=1';
    const confirmRedirect = confirm("Microphone access is needed. Open this panel in a new tab to allow permission?");
    if (confirmRedirect) {
        window.open(url, '_blank');
    }

    return false;
}

// start Speech Recognition
async function startButton(event) {
    const allowed = await ensureMicPermissionOrRedirect(event);
    if (!allowed) return;

    final_transcript = '';
    recognition.lang = "en-US";
    recognition.start();
    speech_to_text.innerHTML = '';
    showInfo('info_allow');
    start_timestamp = event.timeStamp;
}

// stop recognition
function stopButton(event) {
    if (recognizing) {
        recognition.stop();
    }
}

// for debugging
function showInfo(info) {
    console.log(info);
}

// helpers

const first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, (m) => m.toUpperCase());
}
const two_line = /\n\n/g;
const one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
