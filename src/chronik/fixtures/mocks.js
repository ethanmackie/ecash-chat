export const mockXecSendTxWithOpReturn = {
    "txid": "83882c67c220b34ae811d629b3dddf40d5ede5d6334c0bb38420454ae466f48a",
    "version": 2,
    "inputs": [
        {
            "prevOut": {
                "txid": "c0df05003b2011e91a4d7809ba13199dc66b3562dbb79490ad3536f4ca3a3c5e",
                "outIdx": 1
            },
            "inputScript": "47304402206a491f1719abf2dbf5b51aff3b5c9375b83c1dc118ba1b312286e60e4421807902203734a6dcdb2c61c9cf7d2edc879f1194809472502a80ea7a6e042db7afd09c7d41210260dbd59a80d14b548c68772328fa7afc8f2ea25f6c2a9cce13f9cba77199e0de",
            "outputScript": "76a914f627e51001a51a1a92d8927808701373cf29267f88ac",
            "value": 550,
            "sequenceNo": 4294967295
        },
        {
            "prevOut": {
                "txid": "c0df05003b2011e91a4d7809ba13199dc66b3562dbb79490ad3536f4ca3a3c5e",
                "outIdx": 2
            },
            "inputScript": "4830450221008c14bf14633584e1c3a47bc8f5819dfc62f866fbebe3ca360b8c6093a9a5416402202278e66735ef18dbae3194ed692fcbec9f0d8a860181b3f9283f7cee64dc175541210260dbd59a80d14b548c68772328fa7afc8f2ea25f6c2a9cce13f9cba77199e0de",
            "outputScript": "76a914f627e51001a51a1a92d8927808701373cf29267f88ac",
            "value": 13661700,
            "sequenceNo": 4294967295
        }
    ],
    "outputs": [
        {
            "value": 0,
            "outputScript": "6a1166726f6d20656361736820736f6369616c"
        },
        {
            "value": 550,
            "outputScript": "76a914b366ef7c1ffd4ef452d72556634720cc8741e1dc88ac"
        },
        {
            "value": 13660891,
            "outputScript": "76a914f627e51001a51a1a92d8927808701373cf29267f88ac"
        }
    ],
    "lockTime": 0,
    "timeFirstSeen": 1710249084,
    "size": 401,
    "isCoinbase": false,
    "tokenEntries": [],
    "tokenFailedParsings": [],
    "tokenStatus": "TOKEN_STATUS_NON_TOKEN"
};

export const mockParsedXecSendTxWithOpReturn = {
    "incoming": false,
    "xecAmount": "5.5",
    "isEtokenTx": false,
    "aliasFlag": false,
    "airdropFlag": false,
    "airdropTokenId": "",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "opReturnMessage": "jfrom ecash social",
    "replyAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48"
};
