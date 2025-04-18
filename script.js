let mediaStream;
let mediaRecorder;
let recordedChunks = [];
let tempoLimite = 180; // 3 minutos
let tempoRestante = tempoLimite;
let cronometroInterval;
let bloqueado = localStorage.getItem("demoBloqueada") === "true";

const videoPreview = document.getElementById('preview');
const startCaptureBtn = document.getElementById('startCapture');
const startRecordingBtn = document.getElementById('startRecording');
const stopRecordingBtn = document.getElementById('stopRecording');
const relogioEl = document.getElementById("relogio");
const copyright = document.getElementById("copyright");

// Cronômetro
const cronometroEl = document.createElement("div");
cronometroEl.id = "cronometro";
cronometroEl.style.fontSize = "18px";
cronometroEl.style.marginTop = "10px";
startRecordingBtn.parentElement.appendChild(cronometroEl);

// Função de formatação
function formatDate() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

copyright.textContent = `© ${formatDate()} Wilson - Todos os direitos reservados.`;

// Relógio
function atualizarRelogio() {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const segundos = agora.getSeconds().toString().padStart(2, '0');
    relogioEl.textContent = `🕒 ${horas}:${minutos}:${segundos}`;
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

// Bloqueio se já usou a demo
if (bloqueado) {
    bloquearDemo();
}

startCaptureBtn.addEventListener('click', async () => {
    if (bloqueado) {
        bloquearDemo();
        return;
    }

    try {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        videoPreview.srcObject = mediaStream;
        videoPreview.play();

        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        alert("⚠️ Para o áudio do jogo funcionar corretamente, clique na tela capturada e ative o modo de tela cheia.");
    } catch (err) {
        alert("Erro ao iniciar a captura: " + err);
    }
});

startRecordingBtn.addEventListener('click', () => {
    if (bloqueado) {
        bloquearDemo();
        return;
    }

    recordedChunks = [];
    tempoRestante = tempoLimite;

    mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
    });

    mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    mediaRecorder.onstop = function () {
        alert("⛔ Esta é a versão demo. A gravação não será salva. Adquira a versão completa para desbloquear.");
    };

    mediaRecorder.start();
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;

    iniciarCronometro();
});

stopRecordingBtn.addEventListener('click', () => {
    pararTudo();
});

function iniciarCronometro() {
    cronometroInterval = setInterval(() => {
        tempoRestante--;
        const min = Math.floor(tempoRestante / 60).toString().padStart(2, '0');
        const seg = (tempoRestante % 60).toString().padStart(2, '0');
        cronometroEl.textContent = `⏱️ Tempo restante: ${min}:${seg}`;

        if (tempoRestante === 60) {
            alert("⏳ Faltam 1 minuto. Adquira a versão completa para mais tempo.");
        }

        if (tempoRestante <= 0) {
            pararTudo(true);
        }
    }, 1000);
}

function pararTudo(bloquear = false) {
    clearInterval(cronometroInterval);
    mediaRecorder?.stop();
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;

    if (bloquear) {
        localStorage.setItem("demoBloqueada", "true");
        bloquearDemo();
    }
}

function bloquearDemo() {
    alert("🔒 Esta versão demo está bloqueada.\n\nPara obter a versão completa:\n📲 WhatsApp: (14) 99680-8574\n💳 PIX (CPF): 366.717.338-56\n💰 Valor: R$ 29,90");

    document.body.innerHTML = `
        <div style="text-align:center;margin-top:50px;">
            <h2>🔒 DEMO ENCERRADA</h2>
            <p>Entre em contato para adquirir a versão completa:</p>
            <p>📲 WhatsApp: <a href="https://wa.me/5514996808574" target="_blank">(14) 99680-8574</a></p>
            <p>💳 PIX (CPF): 366.717.338-56</p>
            <p><strong>Valor: R$ 29,90</strong></p>
        </div>
    `;
}
