// ########### CLIENT CONFIG ###########

// Connect to local running Gosbank server
const LOCAL_DEBUG_MODE = true;

// Your country code always 'SO'
const COUNTRY_CODE = 'SO';

// Your bank code
const BANK_CODE = process.argv[2] || 'BANQ';

// When disconnect try to reconnect timeout (in ms)
const RECONNECT_TIMEOUT = 2 * 1000;

// ########### CLIENT CODE ###########
const WebSocket = require('ws');

// Function that parses account parts
function parseAccountParts(account) {
    const parts = account.split('-');
    return {
        country: parts[0],
        bank: parts[1],
        account: parseInt(parts[2])
    };
}

function connectToGosbank() {
    const ws = new WebSocket(LOCAL_DEBUG_MODE ? 'ws://localhost:8080' : 'wss://ws.gosbank.ml/');

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
        const toAccountParts = parseAccountParts(account);

        requestMessage('balance', {
            header: {
                originCountry: COUNTRY_CODE,
                originBank: BANK_CODE,
                receiveCountry: toAccountParts.country,
                receiveBank: toAccountParts.bank
            },
            body: {
                account: account,
                pin: pin
            }
        }, callback);
    }

    function requestPayment(fromAccount, toAccount, pin, amount, callback) {
        const formAccountParts = parseAccountParts(fromAccount);
        const toAccountParts = parseAccountParts(toAccount);

        if (formAccountParts.bank !== BANK_CODE) {
            requestMessage('payment', {
                header: {
                    originCountry: COUNTRY_CODE,
                    originBank: BANK_CODE,
                    receiveCountry: formAccountParts.country,
                    receiveBank: formAccountParts.bank
                },
                body: {
                    fromAccount: fromAccount,
                    toAccount: toAccount,
                    pin: pin,
                    amount: amount
                }
            }, callback);
        }

        if (toAccountParts.bank !== BANK_CODE) {
            requestMessage('payment', {
                header: {
                    originCountry: COUNTRY_CODE,
                    originBank: BANK_CODE,
                    receiveCountry: toAccountParts.country,
                    receiveBank: toAccountParts.bank
                },
                body: {
                    fromAccount: fromAccount,
                    toAccount: toAccount,
                    pin: pin,
                    amount: amount
                }
            }, callback);
        }
    }

    ws.on('open', function () {
        requestMessage('register', {
            header: {
                originCountry: COUNTRY_CODE,
                originBank: BANK_CODE,
                receiveCountry: 'SO',
                receiveBank: 'GOSB'
            },
            body: {}
        }, function (data) {
            if (data.body.code === 200) {
                console.log('Connected with Gosbank with bank code: ' + BANK_CODE);

                var i = 0;
                setInterval(function () {
                    var q = i++;

                    requestBalance('SO-' + ['BANQ', 'DASB', 'GETB'][Math.floor(Math.random() * 3)] + '-' + q.toString().padStart(8, '0'), '1234', function (data) {
                        if (data.body.code === 200) {
                            console.log('Balance account ' + q + ': ' + data.body.balance);
                        }
                        else {
                            console.log('Balance error: ' + data.body.code);
                        }
                    });

                    requestPayment(
                        'SO-' + ['BANQ', 'DASB', 'GETB'][Math.floor(Math.random() * 3)] + '-' + q.toString().padStart(8, '0'),
                        'SO-' + ['BANQ', 'DASB', 'GETB'][Math.floor(Math.random() * 3)] + '-' + (q + 1).toString().padStart(8, '0'),
                        '1234', Math.random() * 100, function (data) {
                        if (data.body.code === 200) {
                            console.log('Payment accepted');
                        }
                        else {
                            console.log('Payment error: ' + data.body.code);
                        }
                    });
                }, 500);
            }
            else {
                console.log('Error with connecting to Gosbank, reason: ' + data.body.code);
            }
        });
    });

    ws.on('message', function (message) {
        const { id, type, data } = JSON.parse(message);

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
                        code: 200,
                        balance: parseFloat((Math.random() * 10000).toFixed(2))
                    }
                });
            }, Math.random() * 2000 + 500);
        }

        if (type === 'payment') {
            console.log('Payment request for: ' + data.body.toAccount);

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
                        code: 200
                    }
                });
            }, Math.random() * 2000 + 500);
        }
    });

    ws.on('close', function () {
        console.log('Disconnected, try to reconnect in ' + (RECONNECT_TIMEOUT / 1000).toFixed(0) + ' seconds!');
        setTimeout(connectToGosbank, RECONNECT_TIMEOUT);
    });

    // Ingnore connecting errors reconnect in the close handler
    ws.on('error', function (error) {});
}

connectToGosbank();
