// ########### CLIENT CONFIG ###########

// Your country code always 'SU'
const COUNTRY_CODE = 'SU';

// Your bank code
const BANK_CODE = process.argv[2] || 'BANQ';

// When disconnect try to reconnect timeout (in ms)
const RECONNECT_TIMEOUT = 2 * 1000;

// ########### CLIENT CODE ###########
const WebSocket = require('ws');

function parseAccountParts(account) {
    return {
        country: account.substring(0, 2),
        bank: account.substring(3, 7),
        account: parseInt(account.substring(8))
    };
}

function connectToGosbank() {
    const ws = new WebSocket('ws://localhost:8080');

    const pendingCallbacks = [];

    function requestMessage(type, data, callback) {
        const id = Date.now();
        if (callback !== undefined) {
            pendingCallbacks.push({ id: id, type: type + '_response', callback: callback });
        }
        ws.send(JSON.stringify({ id: id, type: type, data: data }));
    }

    function responseMessage(id, type, data) {
        ws.send(JSON.stringify({ id: id, type: type + '_response', data: data }));
    }

    function requestBalance(account, pin, callback) {
        const to_account_parts = parseAccountParts(account);

        requestMessage('balance', {
            header: {
                originCountry: COUNTRY_CODE,
                originBank: BANK_CODE,
                receiveCountry: to_account_parts.country,
                receiveBank: to_account_parts.bank
            },
            body: {
                account: account,
                pin: pin
            }
        }, callback);
    }

    function requestPayment(from_account, to_account, pin, amount, callback) {
        const form_account_parts = parseAccountParts(from_account);
        const to_account_parts = parseAccountParts(to_account);

        let fromSuccess = false;
        let toSuccess = false;

        function paymentCallback(data) {
            if (
                data.header.originCountry == form_account_parts.country &&
                data.header.originBank == form_account_parts.bank &&
                data.body.success
            ) {
                fromSuccess = true;
            }

            if (
                data.header.originCountry == to_account_parts.country &&
                data.header.originBank == to_account_parts.bank &&
                data.body.success
            ) {
                toSuccess = true;
            }

            if (fromSuccess && toSuccess) {
                callback(data);
            }
        }

        requestMessage('payment', {
            header: {
                originCountry: COUNTRY_CODE,
                originBank: BANK_CODE,
                receiveCountry: form_account_parts.country,
                receiveBank: form_account_parts.bank
            },
            body: {
                from_account: from_account,
                to_account: to_account,
                pin: pin,
                amount: amount
            }
        }, paymentCallback);

        requestMessage('payment', {
            header: {
                originCountry: COUNTRY_CODE,
                originBank: BANK_CODE,
                receiveCountry: to_account_parts.country,
                receiveBank: to_account_parts.bank
            },
            body: {
                from_account: from_account,
                to_account: to_account,
                pin: pin,
                amount: amount
            }
        }, paymentCallback);
    }

    ws.on('open', function () {
        requestMessage('register', {
            header: {
                originCountry: COUNTRY_CODE,
                originBank: BANK_CODE
            }
        }, function (data) {
            if (data.body.success) {
                console.log('Connected with Gosbank with bank code: ' + BANK_CODE);

                var i = 0;
                setInterval(function () {
                    var q = i++;

                    requestBalance('SU-' + ['BANQ', 'DASB', 'GETB'][Math.floor(Math.random() * 3)] + '-' + q.toString().padStart(8, '0'), '1234', function (data) {
                        if (data.body.success) {
                            console.log('Balance account ' + q + ': ' + data.body.balance);
                        }
                        else {
                            console.log('Balance error: ' + data.body.message);
                        }
                    });

                    requestPayment(
                        'SU-' + ['BANQ', 'DASB', 'GETB'][Math.floor(Math.random() * 3)] + '-' + q.toString().padStart(8, '0'),
                        'SU-' + ['BANQ', 'DASB', 'GETB'][Math.floor(Math.random() * 3)] + '-' + (q + 1).toString().padStart(8, '0'),
                        '1234', Math.random() * 100, function (data) {
                        if (data.body.success) {
                            console.log('Payment accepted');
                        }
                        else {
                            console.log('Payment failed');
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

            // Fetch balance info from database

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

        if (type === 'payment') {
            console.log('Payment request for: ' + data.body.to_account);

            // Add payment to database

            setTimeout(function () {
                responseMessage(id, 'payment', {
                    header: {
                        originCountry: COUNTRY_CODE,
                        originBank: BANK_CODE,
                        receiveCountry: data.header.originCountry,
                        receiveBank: data.header.originBank
                    },
                    body: {
                        success: true,
                        message: 'The payment is processed!'
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
