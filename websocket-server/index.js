const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: process.env.PORT || 8080
});

const connectedBanks = {};

wss.on('connection', function (ws) {
    let bankCode;

    function responseMessage(id, type, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ id: id, type: type + '_response', data: data }));
        }
    }

    ws.on('message', function (json_message) {
        const message = JSON.parse(json_message);
        const id = message.id;
        const type = message.type;
        const data = message.data;

        if (type === 'register') {
            if (data.header === undefined || data.header.originCountry === undefined || data.header.originBank === undefined) {
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
            else {
                bankCode = data.header.originBank;

                if (connectedBanks[bankCode] === undefined) {
                    connectedBanks[bankCode] = ws;
                    console.log(bankCode + ' registered');

                    ws.addEventListener('close', function () {
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
        }

        if (bankCode !== undefined) {
            if (type === 'balance') {
                if (data.header.receiveCountry === 'SU') {
                    if (connectedBanks[data.header.receiveBank] !== undefined) {
                        if (
                            connectedBanks[data.header.receiveBank] !== undefined &&
                            connectedBanks[data.header.receiveBank].readyState === WebSocket.OPEN
                        ) {
                            connectedBanks[data.header.receiveBank].send(json_message);
                            console.log(data.header.originBank + ' -> ' + data.header.receiveBank + ': balance');
                        }
                    }
                    else {
                        responseMessage(id, 'balance', {
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
                    responseMessage(id, 'balance', {
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

            if (type === 'balance_response') {
                if (
                    connectedBanks[data.header.receiveBank] !== undefined &&
                    connectedBanks[data.header.receiveBank].readyState === WebSocket.OPEN
                ) {
                    connectedBanks[data.header.receiveBank].send(json_message);
                    console.log(data.header.originBank + ' -> ' + data.header.receiveBank + ': balance_response');
                }
            }

            if (type === 'payment') {
                if (data.header.receiveCountry === 'SU') {
                    if (connectedBanks[data.header.receiveBank] !== undefined) {
                        if (
                            connectedBanks[data.header.receiveBank] !== undefined &&
                            connectedBanks[data.header.receiveBank].readyState === WebSocket.OPEN
                        ) {
                            connectedBanks[data.header.receiveBank].send(json_message);
                            console.log(data.header.originBank + ' -> ' + data.header.receiveBank + ': payment');
                        }
                    }
                    else {
                        responseMessage(id, 'payment', {
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
                    responseMessage(id, 'payment', {
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

            if (type === 'payment_response') {
                if (
                    connectedBanks[data.header.receiveBank] !== undefined &&
                    connectedBanks[data.header.receiveBank].readyState === WebSocket.OPEN
                ) {
                    connectedBanks[data.header.receiveBank].send(json_message);
                    console.log(data.header.originBank + ' -> ' + data.header.receiveBank + ': payment_response');
                }
            }
        }
    });
});
