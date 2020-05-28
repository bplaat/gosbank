// The land node constants
const COUNTRY_CODE = 'SO';
const BANK_CODE = 'GOSB';

// Load the websocket library
const WebSocket = require('ws');

// Create a new websocket server at port 8080
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

// Bank connection holder
const connectedBanks = {};

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
                    data.header.originCountry == COUNTRY_CODE &&
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

            // Check if the bank is connected
            if (bankCode !== undefined) {
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

                // Gosbank supports only Sovjet banks for now!
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
