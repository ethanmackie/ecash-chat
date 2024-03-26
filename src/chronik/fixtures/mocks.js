export const mockXecSendTxWithOpReturnEmoji = {
    "txid": "68f55677b4fcacff6a47a78976aa11238dab1f323e002416b26f3335cb387ee2",
    "version": 2,
    "inputs": [
        {
            "prevOut": {
                "txid": "11be4139a5e76835708aa8495b4fab9db906c15bf6dea07fb63b1f223a97b2e1",
                "outIdx": 2
            },
            "inputScript": "473044022048280c076240bea5d1f385846473ab3818149beb7b3e2724dcb3f6909be87cea02205e90bc76c1b35a28a8d465848c2a254c2635ea009e89062e90e479a095697e58412102394542bf928bc707dcc156acf72e87c9d2fef77eaefc5f6b836d9ceeb0fc6a3e",
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac",
            "value": 81080,
            "sequenceNo": 4294967295
        }
    ],
    "outputs": [
        {
            "value": 0,
            "outputScript": "6a04636861744af09f988368656c6c6f20776f726c642077697468206865617073206f6620656d6f6a697320f09f9887f09fa7b1f09f8f96efb88ff09f8f96efb88ff09f8c8fefb88ff09f8c90f09f8d90"
        },
        {
            "value": 550,
            "outputScript": "76a914f627e51001a51a1a92d8927808701373cf29267f88ac"
        },
        {
            "value": 79894,
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac"
        }
    ],
    "lockTime": 0,
    "timeFirstSeen": 1711415298,
    "size": 315,
    "isCoinbase": false,
    "tokenEntries": [],
    "tokenFailedParsings": [],
    "tokenStatus": "TOKEN_STATUS_NON_TOKEN"
};

export const mockParsedXecSendTxWithOpReturnEmoji = {
    "incoming": false,
    "xecAmount": "5.5",
    "isEtokenTx": false,
    "airdropFlag": false,
    "airdropTokenId": "",
    "opReturnMessage": "😃hello world with heaps of emojis 😇🧱🏖️🏖️🌏️🌐🍐",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": true,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "imageSrc": false,
    "videoSrc": false,
    "videoId": false,
    "txDate": "Mar 26, 2024",
    "txTime": "12:08:18 pm"
};

export const mockXecSendTxWithOpReturnVideo = {
    "txid": "11be4139a5e76835708aa8495b4fab9db906c15bf6dea07fb63b1f223a97b2e1",
    "version": 2,
    "inputs": [
        {
            "prevOut": {
                "txid": "6276cc29dfd8d2cb7a75309e95d41a023c7a1b5ae0aa656d6788eb79e104af13",
                "outIdx": 2
            },
            "inputScript": "47304402207f2a5d9267929ca53800a72aff060f4676a4de410e6372070547515f425d999d022072391a34ea847bee125fc4835b1533b5cd06c0767c1dfe934d82e1e53bedf5e6412102394542bf928bc707dcc156acf72e87c9d2fef77eaefc5f6b836d9ceeb0fc6a3e",
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac",
            "value": 82225,
            "sequenceNo": 4294967295
        }
    ],
    "outputs": [
        {
            "value": 0,
            "outputScript": "6a04636861743668656c6c6f20776f726c642077697468206120796f757475626520766964656f3a205b79745d355275594b784b43414f415b2f79745d"
        },
        {
            "value": 550,
            "outputScript": "76a914f627e51001a51a1a92d8927808701373cf29267f88ac"
        },
        {
            "value": 81080,
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac"
        }
    ],
    "lockTime": 0,
    "timeFirstSeen": 1711415207,
    "size": 295,
    "isCoinbase": false,
    "tokenEntries": [],
    "tokenFailedParsings": [],
    "tokenStatus": "TOKEN_STATUS_NON_TOKEN"
};

export const mockParsedXecSendTxWithOpReturnVideo = {
    "incoming": false,
    "xecAmount": "5.5",
    "isEtokenTx": false,
    "airdropFlag": false,
    "airdropTokenId": "",
    "opReturnMessage": "hello world with a youtube video: ",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": true,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "imageSrc": false,
    "videoSrc": "https://www.youtube.com/watch?v=5RuYKxKCAOA",
    "videoId": "5RuYKxKCAOA",
    "txDate": "Mar 26, 2024",
    "txTime": "12:06:47 pm"
};

export const mockXecSendTxWithOpReturnImage = {
    "txid": "6276cc29dfd8d2cb7a75309e95d41a023c7a1b5ae0aa656d6788eb79e104af13",
    "version": 2,
    "inputs": [
        {
            "prevOut": {
                "txid": "e78a0053cc4914c5b114f8d45b08afb738bca2acfc6644fefc262f043eb03cb2",
                "outIdx": 2
            },
            "inputScript": "483045022100d9517d1c6ea0d431a88987d5d7d38154c7e03137606ca7ff6cc01b1048bd97ac02205a4de1c087771e11b1ec30b13389129cf3677954549b12dbb0a303a0e498df2e412102394542bf928bc707dcc156acf72e87c9d2fef77eaefc5f6b836d9ceeb0fc6a3e",
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac",
            "value": 83423,
            "sequenceNo": 4294967295
        }
    ],
    "outputs": [
        {
            "value": 0,
            "outputScript": "6a04636861744c4f68656c6c6f20776f726c64207769746820616e20656d62656464656420696d6167653a205b696d675d68747470733a2f2f692e696d6775722e636f6d2f7449717464674a2e6a7065675b2f696d675d"
        },
        {
            "value": 550,
            "outputScript": "76a914f627e51001a51a1a92d8927808701373cf29267f88ac"
        },
        {
            "value": 82225,
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac"
        }
    ],
    "lockTime": 0,
    "timeFirstSeen": 1711415040,
    "size": 322,
    "isCoinbase": false,
    "tokenEntries": [],
    "tokenFailedParsings": [],
    "tokenStatus": "TOKEN_STATUS_NON_TOKEN"
};

export const mockParsedXecSendTxWithOpReturnImage = {
    "incoming": false,
    "xecAmount": "5.5",
    "isEtokenTx": false,
    "airdropFlag": false,
    "airdropTokenId": "",
    "opReturnMessage": "hello world with an embedded image: ",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": true,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "imageSrc": "https://i.imgur.com/tIqtdgJ.jpeg",
    "videoSrc": false,
    "videoId": false,
    "txDate": "Mar 26, 2024",
    "txTime": "12:04:00 pm"
};

export const mockXecSendTxWithOpReturn = {
    "txid": "e78a0053cc4914c5b114f8d45b08afb738bca2acfc6644fefc262f043eb03cb2",
    "version": 2,
    "inputs": [
        {
            "prevOut": {
                "txid": "5bba967d9723d8b147895ab948a0108269b8a2e6a3c6272bb633729d6a0e719b",
                "outIdx": 2
            },
            "inputScript": "483045022100f0af6cb130e2014c368b34604ccbc9078c5c1102c0168d673c11995fe1981173022008b40e713aca6d98122770360788b2c6aed5622bf9885b700faf0854f5010019412102394542bf928bc707dcc156acf72e87c9d2fef77eaefc5f6b836d9ceeb0fc6a3e",
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac",
            "value": 84482,
            "sequenceNo": 4294967295
        }
    ],
    "outputs": [
        {
            "value": 0,
            "outputScript": "6a04636861740b68656c6c6f20776f726c64"
        },
        {
            "value": 550,
            "outputScript": "76a914f627e51001a51a1a92d8927808701373cf29267f88ac"
        },
        {
            "value": 83423,
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac"
        }
    ],
    "lockTime": 0,
    "timeFirstSeen": 1711414909,
    "size": 253,
    "isCoinbase": false,
    "tokenEntries": [],
    "tokenFailedParsings": [],
    "tokenStatus": "TOKEN_STATUS_NON_TOKEN"
};

export const mockParsedXecSendTxWithOpReturn = {
    "incoming": false,
    "xecAmount": "5.5",
    "isEtokenTx": false,
    "airdropFlag": false,
    "airdropTokenId": "",
    "opReturnMessage": "hello world",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": true,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "imageSrc": false,
    "videoSrc": false,
    "videoId": false,
    "txDate": "Mar 26, 2024",
    "txTime": "12:01:49 pm"
};
