# Gosbank WebSocket Protocol
The Gosbank WebSocket protocol

This protocol uses some parts of the [NOOB](https://github.com/luukk/noob) protocol

## Websocket server URL
Gosbank is live at: `wss://ws.gosbank.ml/`

## Gosbank codes
Gosbank uses the standard NOOB a.k.a. HTTP error codes:
- Success: **200**
- Broken message: **400**
- Authentication failed / pincode false: **401**
- Bank card had not enough balance: **402**
- Bank card is blocked: **403**
- Something don't exists: **404**

## Message format
Every websocket message is send in JSON to and from Gosbank, in the following container, the id is the Date time in ms, and the id is the same for a response message, for a callback meganism:
```json
{
    "id": 1586944886599,
    "type": "register",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "GOSB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {}
    }
}
```

When you send a broken message or when you try to send a message to a bank witch isn't connected the response is always:
```json
{
    "id": 1586944886599,
    "type": "register_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "GOSB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 400
        }
    }
}
```

## Register message
Send this message when you want to register to Gosbank

### Request
Send to Gosbank when connection is opened:
```json
{
    "id": 1586944886599,
    "type": "register",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "BANQ",
            "receiveCountry": "SO",
            "receiveBank": "GOSB"
        },
        "body": {}
    }
}
```

### Response
When successful and you are registered:
```json
{
    "id": 1586944886599,
    "type": "register_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "GOSB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 200
        }
    }
}
```

When some own else is already connected with your bankcode:
```json
{
    "id": 1586944886599,
    "type": "register_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "GOSB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 401
        }
    }
}
```

## Balance message
Send this message when you want to get the balance of some bank account

### Request
**BANQ** sends to the Gosbank, Gosbank sends to **DASB**:
```json
{
    "id": 1586944886599,
    "type": "balance",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "BANQ",
            "receiveCountry": "SO",
            "receiveBank": "DASB"
        },
        "body": {
            "account": "SO-BANQ-00000003",
            "pin": "1234"
        }
    }
}
```

### Response
**DASB** sends to Gosbank, Gosbank sends to **BANQ** when successfull:
```json
{
    "id": 1586944886599,
    "type": "balance_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "DASB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 200,
            "balance": 2.56
        }
    }
}
```

**DASB** sends to Gosbank, Gosbank sends to **BANQ** when pincode is false:
```json
{
    "id": 1586944886599,
    "type": "balance_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "GOSB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 401,
            "attempts": 2
        }
    }
}
```

**DASB** sends to Gosbank, Gosbank sends to **BANQ** when account is blocked:
```json
{
    "id": 1586944886599,
    "type": "balance_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "GOSB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 403
        }
    }
}
```

**DASB** sends to Gosbank, Gosbank sends to **BANQ** when account dont exists:
```json
{
    "id": 1586944886599,
    "type": "balance_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "GOSB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 404
        }
    }
}
```

## Payment message
Send a payment request to from a bank account to and bank account.

The bank can send a payment request when a bank is or of the from account or of the to account.

When you make a withdraw the users always pays to the first account (`00000001`) to the bank of the ATM.

### Request
**BANQ** sends to the Gosbank, Gosbank sends to **DASB**:
```json
{
    "id": 1586944886599,
    "type": "payment",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "BANQ",
            "receiveCountry": "SO",
            "receiveBank": "DASB"
        },
        "body": {
            "fromAccount": "SO-BANQ-00000010",
            "toAccount": "SO-DASB-00000001",
            "pin": "1234",
            "amount": 4.56
        }
    }
}
```

### Response
**DASB** sends to Gosbank, Gosbank sends to **BANQ** when succesfull:
```json
{
    "id": 1586944886599,
    "type": "payment_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "DASB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 200
        }
    }
}
```

**DASB** sends to Gosbank, Gosbank sends to **BANQ** when pincode false:
```json
{
    "id": 1586944886599,
    "type": "payment_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "DASB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 401,
            "attempts": 2
        }
    }
}
```

**DASB** sends to Gosbank, Gosbank sends to **BANQ** when not enough balance:
```json
{
    "id": 1586944886599,
    "type": "payment_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "DASB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 402
        }
    }
}
```

**DASB** sends to Gosbank, Gosbank sends to **BANQ** when card is blocked:
```json
{
    "id": 1586944886599,
    "type": "payment_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "DASB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 403
        }
    }
}
```

**DASB** sends to Gosbank, Gosbank sends to **BANQ** when account don't exists:
```json
{
    "id": 1586944886599,
    "type": "payment_response",
    "data": {
        "header": {
            "originCountry": "SO",
            "originBank": "DASB",
            "receiveCountry": "SO",
            "receiveBank": "BANQ"
        },
        "body": {
            "code": 404
        }
    }
}
```
