# Gosbank WebSocket Protocol
The Gosbank WebSocket protocol

This protocol uses some parts of the [NOOB](https://github.com/luukk/noob) protocol

## Message format
Every websocket message is send in JSON to and from Gosbank, in the following container, the id is the Date time in ms, and the id is the same for a response message:
```json
{
    "id": 1586944886599,
    "type": "register",
    "data": {
        "header": {},
        "body": {}
    }
}
```

## Register

### Request
Send to Gosbank when connection is opened
```json
register {
    "header": {
        "originCountry": "SU",
        "originBank": "BANQ",
        "receiveCountry": "SU",
        "receiveBank": "GOSB"
    }
}
```

### Response
When broken message
```json
register_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": false,
        "message": "You have send a broken message!"
    }
}
```

When successful
```json
register_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": true,
        "message": "You have successful registerd by Gosbank!"
    }
}
```

When already connected
```json
register_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": false,
        "message": "There is already a bank with that bank code connected!"
    }
}
```

## Balance

### Request
**BANQ** sends to the Gosbank, Gosbank sends to **DASB**
```json
withdraw {
    "header": {
        "originCountry": "SU",
        "originBank": "BANQ",
        "receiveCountry": "SU",
        "receiveBank": "DASB"
    },
    "body": {
        "account": "SU-BANQ-00000003",
        "pin": "1234"
    }
}
```

### Response
**DASB** sends to Gosbank, Gosbank sends to **BANQ**
```json
balance_response {
    "header": {
        "originCountry": "SU",
        "originBank": "DASB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": true,
        "message": "Succesful",
        "balance": 2.56
    }
}
```

When broken message
```json
balance_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": false,
        "message": "You have send a broken message!"
    }
}
```

When country is not SU
```json
balance_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": false,
        "message": "Gosbank only supports Sovjet Banks for now!"
    }
}
```

When country is SU and no bank with that name
```json
balance_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": false,
        "message": "There is already a bank with that bank code connected!"
    }
}
```

## Pay
The bank can send a payment request when a bank is or of the from account or of the to account.

### Request
**BANQ** sends to the Gosbank, Gosbank sends to **DASB**
```json
payment {
    "header": {
        "originCountry": "SU",
        "originBank": "BANQ",
        "receiveCountry": "SU",
        "receiveBank": "DASB"
    },
    "body": {
        "from_account": "SU-DASB-00000010",
        "to_account": "SU-BANQ-00000001",
        "pin": "1234",
        "amount": 4.56
    }
}
```

### Response
**DASB** sends to Gosbank, Gosbank sends to **BANQ**
```json
payment_response {
    "header": {
        "originCountry": "SU",
        "originBank": "DASB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": true,
        "message": "Succesful"
    }
}
```

When broken message
```json
payment_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": false,
        "message": "You have send a broken message!"
    }
}
```

When country is not SU
```json
payment_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": false,
        "message": "Gosbank only supports Sovjet Banks for now!"
    }
}
```

When country is SU and no bank with that name
```json
payment_response {
    "header": {
        "originCountry": "SU",
        "originBank": "GOSB",
        "receiveCountry": "SU",
        "receiveBank": "BANQ"
    },
    "body": {
        "success": false,
        "message": "There is already a bank with that bank code connected!"
    }
}
```
