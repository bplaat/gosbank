const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: process.env.PORT || 8080
});

const connectedBanks = {};

wss.on('connection', function (ws) {
    let bankCode;

    function send(type, data) {
        ws.send(JSON.stringify({ type: type, data: data }));
    }

    ws.on('message', function (message) {
        message = JSON.parse(message);
        const type = message.type;
        const data = message.data;
        console.log(type, data);

        if (type == 'register') {
            if (data.header.country === undefined || data.header.bank === undefined) {
                send('register', {
                    success: false,
                    message: 'You don\t have given a country and/or bank code!'
                });
                ws.close();
            }
            else {
                bankCode = data.header.bank;

                if (connectedBanks[bankCode] === undefined) {
                    connectedBanks[bankCode] = ws;
                    send('register', {
                        success: true,
                        message: 'You have successful registerd by Gosbank!'
                    });
                }

                else {
                    send('register', {
                        success: false,
                        message: 'There is already a bank with that bank code connected!'
                    });
                    ws.close();
                }
            }
        }

        if (bankCode !== undefined) {
            if (type == 'balance') {
                if (data.header.receiveCountry == 'SU') {
                    if (connectedBanks[data.header.receiveBank] !== undefined) {
                        connectedBanks[data.header.receiveBank].send(JSON.stringify(message));
                    }
                    else {
                        send('withdraw', {
                            success: false,
                            message: 'The Sovjet Bank you tried to message is not connected to Gosbank!'
                        });
                    }
                }
                else {
                    send('withdraw', {
                        success: false,
                        message: 'Gosbank only supports Sovjet Banks!'
                    });
                }
            }

            if (type == 'withdraw') {
                if (data.header.receiveCountry == 'SU') {
                    if (connectedBanks[data.header.receiveBank] !== undefined) {
                        connectedBanks[data.header.receiveBank].send(JSON.stringify(message));
                    }
                    else {
                        send('withdraw', {
                            success: false,
                            message: 'The Sovjet Bank you tried to message is not connected to Gosbank!'
                        });
                    }
                }
                else {
                    send('withdraw', {
                        success: false,
                        message: 'Gosbank only supports Sovjet Banks!'
                    });
                }
            }
        }
    });

    ws.on('close', function () {
        if (bankCode !== undefined) {
            console.log(bankCode + ' disconnected');
            connectedBanks[bankCode] = undefined;
        }
    });
});
