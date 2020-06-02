if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.min.js');
}

const logo = document.getElementById('logo');
let anthemAudio;
if (logo != null) {
    logo.addEventListener('click', function (event) {
        event.preventDefault();
        if (anthemAudio == undefined) {
            anthemAudio = new Audio('/anthem.m4a');
            anthemAudio.loop = true;
            anthemAudio.play();
        }
    });
}
