// ########### CLIENT CONFIG ###########

// Your country code always 'SU'
const COUNTRY_CODE = 'SU';

// Your bank code
const BANK_CODE = 'BANQ';

// When disconnect try to reconnect timeout (in ms)
const RECONNECT_TIMEOUT = 10 * 1000;

// ########### CLIENT CODE ###########
const WebSocket = require('ws');

function connect() {
    const ws = new WebSocket('ws://localhost:8080');

    function send(type, data) {
        ws.send(JSON.stringify({ type: type, data: data }));
    }

    ws.on('open', function () {
        send('register', {
            header: {
                country: COUNTRY_CODE,
                bank: BANK_CODE
            }
        });
    });

    ws.on('message', function (message) {
        message = JSON.parse(message);
        const type = message.type;
        const data = message.data;
        console.log(type, data);

        if (type == 'register') {
            if (data.success) {
                console.log('Connected with Gosbank!');
            }
            else {
                console.log('Error with connecting to Gosbank, reason: ' + data.message);
            }
        }
    });

    ws.on('close', function () {
        console.log('Disconnected, try to reconnect in ' + (RECONNECT_TIMEOUT / 1000).toFixed(0) + ' seconds!');
        setTimeout(connect, RECONNECT_TIMEOUT);
    });

    ws.on('error', function (error) {
        // Ingnore connecting errors reconnect in the close handler
    });
}

connect();
