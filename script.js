const startButton=document.getElementById('start');
const languageSelect=document.getElementById('lang');
const outputDiv=document.getElementById('output');
const copyButton=document.getElementById('copy');
const clearButton=document.getElementById('clear');
const savePdfButton = document.getElementById('savePdf');

if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert("Sorry, speech recognition is not supported on your device. Please use Google Chrome on a desktop for full functionality.");
    startButton.disabled = true;
}

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
recognition.continuous=true;
recognition.interimResults=true;
let isListening=false;
let listeningInterval;
let finalTranscript="";
document.getElementById("listeningIndicator").style.display = "none";

function startListeningAnimation() {
    document.getElementById("listeningIndicator").style.display = "block";
}

function stopListeningAnimation() {
    document.getElementById("listeningIndicator").style.display = "none";
}
recognition.onstart=()=>{
startButton.textContent='Stop Speaking';
startListeningAnimation();
isListening=true;//check
};


recognition.onresult = (event) => {
    let finalTranscriptPart = '';
    let interimTranscriptPart = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        let result = event.results[i];

        if (result.isFinal) {
            finalTranscriptPart += result[0].transcript + " ";
        } else {
            interimTranscriptPart += result[0].transcript + " ";
        }
    }

    finalTranscript += finalTranscriptPart;

    outputDiv.innerHTML = `
        <span style="color: #000;">${finalTranscript}</span>
        <span style="color: #999;">${interimTranscriptPart}</span>
    `;
};




recognition.onerror=(event)=>{
outputDiv.textContent='Error : '+event.error;
startButton.textContent='Speak Now';
isListening=false;
stopListeningAnimation();
};

recognition.onend = () => {
    if (isListening) {
        recognition.start(); 
    } else {
        startButton.textContent = "Speak Now";
        stopListeningAnimation();
    }
};


async function requestMicAccess() {
    if(!isListening){
    try{
    await navigator.mediaDevices.getUserMedia({audio:true});
    recognition.lang=languageSelect.value;
    recognition.start();
}
catch(error){
    outputDiv.textContent='Microphone access denied or unavailable';
    stopListeningAnimation();
  }
 }
 else{
    recognition.stop();
    isListening=false;
    startButton.textContent='Speak Now';
    stopListeningAnimation();
 }
}
startButton.addEventListener('click',()=>{
requestMicAccess();
});

copyButton.addEventListener('click',()=>{
const text=finalTranscript;
if(text){
    navigator.clipboard.writeText(text).then(()=>{
        alert ('Copied to clipboard!');
    }).catch(err=>{
        alert('Failed to copy : '+err);
    });
}
});

savePdfButton.addEventListener("click", () => {
if(!finalTranscript.trim()){
    alert("No text to save!");
    return;
}
const {jsPDF}=window.jspdf;
const doc=new jsPDF();

doc.setFont("helvetica","normal");
doc.setFontSize(14);
doc.text(finalTranscript,10,10,{maxWidth:180,align:"left"});

let filename=prompt("Enter a name for your PDF: ","MyNotes");
filename=filename?filename+".pdf":"MyNotes.pdf";
doc.save(filename);
alert(filename+" saved successfully.");
});

clearButton.addEventListener('click',()=>{
    finalTranscript = "";
    outputDiv.textContent=' ';
});
