const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

const connectedBanks = {};

wss.on('connection', function (ws) {
    let bankCode;

    function responseMessage(id, type, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ id: id, type: type + '_response', data: data }));
        }
    }

    ws.on('message', function (message) {
        const { id, type, data } = JSON.parse(message);

        if (
            id == undefined ||
            type == undefined ||
            data == undefined ||
            data.header === undefined ||
            data.header.originCountry === undefined ||
            data.header.originBank === undefined ||
            data.header.receiveCountry === undefined ||
            data.header.receiveBank === undefined ||
            data.body === undefined
        ) {
            responseMessage(id, 'register', {
                header: {
                    originCountry: 'SU',
                    originBank: 'GOSB',
                    receiveCountry: data.header.originCountry,
                    receiveBank: data.header.originBank
                },
                body: {
                    success: false,
                    message: 'You have send a broken message!'
                }
            });
            ws.close();
        }

        if (type === 'register') {
            if (connectedBanks[data.header.originBank] === undefined) {
                bankCode = data.header.originBank;
                connectedBanks[bankCode] = ws;
                console.log(bankCode + ' registered');

                ws.on('close', function () {
                    connectedBanks[bankCode] = undefined;
                    console.log(bankCode + ' disconnected');
                });

                responseMessage(id, 'register', {
                    header: {
                        originCountry: 'SU',
                        originBank: 'GOSB',
                        receiveCountry: data.header.originCountry,
                        receiveBank: data.header.originBank
                    },
                    body: {
                        success: true,
                        message: 'You have successful registerd by Gosbank!'
                    }
                });
            }

            else {
                responseMessage(id, 'register', {
                    header: {
                        originCountry: 'SU',
                        originBank: 'GOSB',
                        receiveCountry: data.header.originCountry,
                        receiveBank: data.header.originBank
                    },
                    body: {
                        success: false,
                        message: 'There is already a bank with that bank code connected!'
                    }
                });
                ws.close();
            }
        }

        if (bankCode !== undefined) {
            if (data.header.receiveCountry === 'SU') {
                if (
                    connectedBanks[data.header.receiveBank] !== undefined &&
                    connectedBanks[data.header.receiveBank].readyState === WebSocket.OPEN
                ) {
                    connectedBanks[data.header.receiveBank].send(message);
                    console.log(data.header.originBank + ' -> ' + data.header.receiveBank + ': ' + type);
                }

                else {
                    responseMessage(id, type, {
                        header: {
                            originCountry: 'SU',
                            originBank: 'GOSB',
                            receiveCountry: data.header.originCountry,
                            receiveBank: data.header.originBank
                        },
                        body: {
                            success: false,
                            message: 'The Sovjet Bank you tried to message is not connected to Gosbank!'
                        }
                    });
                }
            }

            else {
                responseMessage(id, type, {
                    header: {
                        originCountry: 'SU',
                        originBank: 'GOSB',
                        receiveCountry: data.header.originCountry,
                        receiveBank: data.header.originBank
                    },
                    body: {
                        success: false,
                        message: 'Gosbank only supports Sovjet Banks for now!'
                    }
                });
            }
        }
    });
});
