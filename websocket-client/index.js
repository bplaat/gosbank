// ########### CLIENT CONFIG ###########

// Your country code always 'SU'
const COUNTRY_CODE = 'SU';

// Your bank code
const BANK_CODE = 'BANQ';

// When disconnect try to reconnect timeout (in ms)
const RECONNECT_TIMEOUT = 10 * 1000;

// ########### CLIENT CODE ###########
const WebSocket = require('ws');

function connectToGosbank() {
    const ws = new WebSocket('ws://localhost:8080');

    const pendingCallbacks = [];

    function sendMessage(type, data, callback) {
        pendingCallbacks.push({ type: type, callback: callback });
        ws.send(JSON.stringify({ type: type, data: data }));
    }

    function requestRegister(callback) {
        sendMessage('register', {
            header: {
                country: COUNTRY_CODE,
                bank: BANK_CODE
            }
        }, callback);
    }

    function requestBalance(country, bank, account, pin, callback) {
        sendMessage('balance', {
            header: {
                originCountry: COUNTRY_CODE,
                originBank: BANK_CODE,
                receiveCountry: country,
                receiveBank: bank
            },
            body: {
                account: account,
                pin: pin
            }
        }, callback);
    }

    function requestWithdraw(country, bank, account, pin, amount, callback) {
        sendMessage('withdraw', {
            header: {
                originCountry: COUNTRY_CODE,
                originBank: BANK_CODE,
                receiveCountry: country,
                receiveBank: bank
            },
            body: {
                account: account,
                pin: pin,
                amount: amount
            }
        }, callback);
    }

    ws.on('open', function () {
        requestRegister(function (response) {
            if (response.success) {
                console.log('Connected with Gosbank!');

                requestBalance('SU', 'DASB', '00000001', '1234', function (response) {
                    console.log('Balance: ' + response.data.balance);
                });
            }
            else {
                console.log('Error with connecting to Gosbank, reason: ' + data.message);
            }
        });
    });

    ws.on('message', function (message) {
        message = JSON.parse(message);
        const type = message.type;
        const data = message.data;

        for (var i = 0; i < pendingCallbacks.length; i++) {
            if (pendingCallbacks[i].type == type) {
                pendingCallbacks[i].callback(data);
                pendingCallbacks.splice(i--);
            }
        }

        if (type == 'balance') {
            console.log('Balance request:', data);
        }

        if (type == 'withdraw') {
            console.log('Withdraw request:', data);
        }
    });

    ws.on('close', function () {
        console.log('Disconnected, try to reconnect in ' + (RECONNECT_TIMEOUT / 1000).toFixed(0) + ' seconds!');
        setTimeout(connectToGosbank, RECONNECT_TIMEOUT);
    });

    ws.on('error', function (error) {
        // Ingnore connecting errors reconnect in the close handler
    });
}

connectToGosbank();
