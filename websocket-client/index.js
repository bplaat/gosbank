// ########### CLIENT CONFIG ###########

// Your country code always 'SU'
const COUNTRY_CODE = 'SU';

// Your bank code
const BANK_CODE = process.argv[2] || 'BANQ';

// When disconnect try to reconnect timeout (in ms)
const RECONNECT_TIMEOUT = 2 * 1000;

// ########### CLIENT CODE ###########
const WebSocket = require('ws');

function connectToGosbank() {
    const ws = new WebSocket('ws://localhost:8080');

    const pendingCallbacks = [];

    function requestMessage(type, data, callback) {
        const id = Date.now();
        pendingCallbacks.push({ id: id, type: type + '_response', callback: callback });
        ws.send(JSON.stringify({ id: id, type: type, data: data }));
    }

    function responseMessage(id, type, data) {
        ws.send(JSON.stringify({ id: id, type: type + '_response', data: data }));
    }

    function requestBalance(country, bank, account, pin, callback) {
        requestMessage('balance', {
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

    ws.on('open', function () {
        requestMessage('register', {
            header: {
                country: COUNTRY_CODE,
                bank: BANK_CODE
            }
        }, function (data) {
            if (data.body.success) {
                console.log('Connected with Gosbank with bank code: ' + BANK_CODE);

                var i = 0;
                setInterval(function () {
                    var q = i++;
                    requestBalance('SU', ['BANQ', 'DASB', 'GETB'][Math.floor(Math.random() * 3)], q, '1234', function (data) {
                        if (data.body.success) {
                            console.log('Balance account ' + q + ': ' + data.body.balance);
                        }
                        else {
                            console.log('Balance error: ' + data.body.message);
                        }
                    });
                }, 500);
            }
            else {
                console.log('Error with connecting to Gosbank, reason: ' + data.body.message);
            }
        });
    });

    ws.on('message', function (json_message) {
        const message = JSON.parse(json_message);
        const id = message.id;
        const type = message.type;
        const data = message.data;

        for (var i = 0; i < pendingCallbacks.length; i++) {
            if (pendingCallbacks[i].id === id && pendingCallbacks[i].type === type) {
                pendingCallbacks[i].callback(data);
                pendingCallbacks.splice(i--, 1);
            }
        }

        if (type === 'balance') {
            console.log('Balance request for: ' + data.body.account);

            setTimeout(function () {
                responseMessage(id, 'balance', {
                    header: {
                        originCountry: COUNTRY_CODE,
                        originBank: BANK_CODE,
                        receiveCountry: data.header.originCountry,
                        receiveBank: data.header.originBank
                    },
                    body: {
                        success: true,
                        message: 'The pincode is right, here is the balance!',
                        balance: parseFloat((Math.random() * 10000).toFixed(2))
                    }
                });
            }, Math.random() * 2000 + 500);
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
