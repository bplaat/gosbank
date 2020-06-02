// The land node country code
const COUNTRY_CODE = 'SO';

// The land node bank code
const BANK_CODE = 'GOSB';

// The noob websocket address
const NOOB_ADDRESS = 'ws://145.24.222.206:8085';

// When disconnect try to reconnect timeout (in ms)
const RECONNECT_TIMEOUT = 2 * 1000;

// The error code messages
const codeMessages = {
    '200': 'Success',
    '400': 'Broken message',
    '401': 'Authentication failed / pincode false',
    '402': 'Bank card had not enough balance',
    '403': 'Bank card is blocked',
    '404': 'Something don\'t exists'
};

// Load the websocket library
const WebSocket = require('ws');

// Load the socket io client library
const io = require('socket.io-client');

// Create a new websocket server at port 8080
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

// Parse account parts
function parseAccountParts(account) {
    return {
        country: account.substring(0, 2),
        bank: account.substring(3, 7),
        account: parseInt(account.substring(8))
    };
}

// Bank connection holder
const connectedBanks = {};

// Connect to the NOOB
const socket = io(NOOB_ADDRESS);

// Register with the land code
socket.emit('register', {
    header: {
        country: COUNTRY_CODE
    }
});

// Print connected message
console.log('Connected to the NOOB');

// On a balance request
socket.on('balance', function (data) {
    // When bank is connected send through
    if (
        connectedBanks[data.header.receiveBank] !== undefined &&
        connectedBanks[data.header.receiveBank].readyState === WebSocket.OPEN
    ) {
        connectedBanks[data.header.receiveBank].send({
            id: Date.now(),
            type: 'balance',
            data: data
        });
    }
});

// On a withdraw request
socket.on('withdraw', function (data) {
    // When bank is connected send through
    if (
        connectedBanks[data.header.receiveBank] !== undefined &&
        connectedBanks[data.header.receiveBank].readyState === WebSocket.OPEN
    ) {
        connectedBanks[data.header.receiveBank].send({
            id: Date.now(),
            type: 'payment',
            data: {
                header: data.header,
                body: {
                    fromAccount: data.header.originCountry + '-' + data.header.originBank + '-' + data.body.account,
                    toAccount: data.header.receiveCountry + '-' + data.header.receiveBank + '-00000001',
                    pin: data.body.pin,
                    amount: data.body.amount
                }
            }
        });
    }
});

// NOOB connection error handler
socket.on('error', function (error) {
    console.log('Error with NOOB connection:', error);
});

// NOOB disconnect handler
socket.on('disconnect', function () {
    console.log('Disconnected from NOOB, try to reconnect in ' + (RECONNECT_TIMEOUT / 1000).toFixed(0) + ' seconds!');
    setTimeout(socket.open, RECONNECT_TIMEOUT);
});

// On websocket connect listener
wss.on('connection', function (ws) {
    // Bank code holder
    let bankCode;

    // Function witch sends a message back
    function responseMessage(id, type, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ id: id, type: type + '_response', data: data }));
        }
    }

    // On message listener
    ws.on('message', function (message) {
        try {
            // Parse the message
            const { id, type, data } = JSON.parse(message);

            // On register message
            if (type === 'register') {
                // Check if country the right one
                // And the bank is not already connected
                if (
                    data.header.originCountry === COUNTRY_CODE &&
                    connectedBanks[data.header.originBank] === undefined
                ) {
                    // Register bank
                    bankCode = data.header.originBank;
                    connectedBanks[bankCode] = ws;
                    console.log(bankCode + ' registered');

                    // Register on connection close listener
                    ws.on('close', function () {
                        connectedBanks[bankCode] = undefined;
                        console.log(bankCode + ' disconnected');
                    });

                    // Send sucess message response
                    responseMessage(id, 'register', {
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
                }

                else {
                    // Send auth failt message response
                    responseMessage(id, 'register', {
                        header: {
                            originCountry: COUNTRY_CODE,
                            originBank: BANK_CODE,
                            receiveCountry: data.header.originCountry,
                            receiveBank: data.header.originBank
                        },
                        body: {
                            code: 401
                        }
                    });

                    // Close the connection
                    ws.close();
                }
            }

            // Else check if the bank is connected
            else if (bankCode !== undefined) {
                console.log(data.header.originBank + ' -> ' + data.header.receiveBank + ': ' + type);

                // When the message is to another sovjet bank
                if (data.header.receiveCountry === COUNTRY_CODE) {
                    // When the bank is connected send message trough
                    if (
                        connectedBanks[data.header.receiveBank] !== undefined &&
                        connectedBanks[data.header.receiveBank].readyState === WebSocket.OPEN
                    ) {
                        connectedBanks[data.header.receiveBank].send(message);
                    }

                    // Or send broken message response
                    else {
                        responseMessage(id, type, {
                            header: {
                                originCountry: COUNTRY_CODE,
                                originBank: BANK_CODE,
                                receiveCountry: data.header.originCountry,
                                receiveBank: data.header.originBank
                            },
                            body: {
                                code: 400
                            }
                        });
                    }
                }

                // When message for foreign bank send to gosbank
                else {
                    // Check if connected to NOOB
                    if (socket.connected) {
                        // When balance message
                        if (type === 'balance') {
                            // Send to NOOB and send the response back
                            socket.emit('balance', data, function (response) {
                                responseMessage(id, 'balance', reponse);
                            });
                        }

                        // When balance response message
                        if (type === 'balance_response') {
                            socket.emit('balance', {
                                data: data.header,
                                body: {
                                    code: data.body.code,
                                    message: codeMessages[data.body.code],
                                    balance: data.body.balance
                                }
                            });
                        }

                        // When payment message
                        if (type === 'payment') {
                            // Check to account is 1
                            if (parseAccountParts(data.body.toAccount) === 1) {
                                // Send to NOOB and send the response back
                                socket.emit('withdraw', {
                                    header: data.header,
                                    body: {
                                        account: parseAccountParts(data.body.fromAccount).account.padStart(8, '0'),
                                        pin: data.body.pin,
                                        amount: data.body.amount
                                    }
                                }, function (response) {
                                    responseMessage(id, 'payment', reponse);
                                });
                            }

                            // Send broken message
                            else {
                                responseMessage(id, 'payment', {
                                    header: {
                                        originCountry: COUNTRY_CODE,
                                        originBank: BANK_CODE,
                                        receiveCountry: data.header.originCountry,
                                        receiveBank: data.header.originBank
                                    },
                                    body: {
                                        code: 400
                                    }
                                });
                            }
                        }

                        // When payment response message
                        if (type === 'payment_response') {
                            socket.emit('payment', {
                                data: data.header,
                                body: {
                                    code: data.body.code,
                                    message: codeMessages[data.body.code]
                                }
                            });
                        }
                    }

                    // Send broken message
                    else {
                        responseMessage(id, type, {
                            header: {
                                originCountry: COUNTRY_CODE,
                                originBank: BANK_CODE,
                                receiveCountry: data.header.originCountry,
                                receiveBank: data.header.originBank
                            },
                            body: {
                                code: 400
                            }
                        });
                    }
                }
            }
        }

        // When a error is thrown
        catch (exception) {
            // Log the exception
            console.log(exception);

            // Send broken message back
            responseMessage(id, type, {
                header: {
                    originCountry: COUNTRY_CODE,
                    originBank: BANK_CODE,
                    receiveCountry: data.header.originCountry,
                    receiveBank: data.header.originBank
                },
                body: {
                    code: 400
                }
            });

            // Close connection
            ws.close();
        }
    });
});
