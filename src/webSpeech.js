// speech recognition logic
import { decideAction } from "./services/groqService.js";
import { dataToAction } from "./services/actions.js";

var recognizing = false;
var final_transcript = '';
var transcript = '';
let speech_to_text;
let answer_box;

// detect if user was redirected to a full tab for mic access
const urlParams = new URLSearchParams(window.location.search);
const micRedirected = urlParams.get('mic') === '1';

if (!('webkitSpeechRecognition' in window)) {
    alert('This browser does not support speech recognition. Try Chrome.');
} else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;

    document.addEventListener("DOMContentLoaded", () => {
        const startBtn = document.getElementById("start-btn");
        speech_to_text = document.getElementById("speech-to-text");
        answer_box = document.getElementById("answer-container");

        startBtn.addEventListener("click", startButton);

        // Optional: clean up URL after redirect
        if (micRedirected) {
            history.replaceState(null, '', window.location.pathname);
        }
    });

    recognition.onerror = function (event) {
        showInfo("Error: " + event.error);
    };

    recognition.onend = function () {
        recognizing = false;
        if (!transcript) {
            showInfo('Empty transcript');
        }
    };

    recognition.onresult = async function (event) {
        final_transcript = '';
        answer_box.textContent = linebreak(" Your summary or response will appear here.");

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
                const { action, data } = await decideAction(final_transcript);
                if (!action || !data) {
                    console.warn("Invalid LLM response");
                    return;
                }
                const result = await dataToAction(action, data);
                if (result) {
                    console.log("Page Summary to update", linebreak(result));
                    answer_box.textContent = linebreak(result);
                }
            }
        }
        final_transcript = capitalize(final_transcript);
        speech_to_text.innerHTML = linebreak(final_transcript);

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
    if (recognizing) {
        //stop recognizing
        recognition.stop();
        final_transcript = '';
    }
    else {
        const allowed = await ensureMicPermissionOrRedirect(event);
        if (!allowed) return;

        final_transcript = '';
        recognition.lang = "en-US";
        recognition.start();
        speech_to_text.innerHTML = '';
        showInfo('info_allow');
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
