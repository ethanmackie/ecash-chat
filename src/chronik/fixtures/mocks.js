export const mockXecSendTxWithOpReturnTweet = {
    "txid": "a98252b4230d4961011d6069012c8f0e0e1f93a0fe3693a376984dbae8243da7",
    "version": 2,
    "inputs": [
        {
            "prevOut": {
                "txid": "73d104e3146b3492e54d4d56ffaf819f2b65238aecd9ace220fbba3dc0c25552",
                "outIdx": 2
            },
            "inputScript": "473044022070e578bbfc43494bb79819b9147121fa3ccda587f7cfe80d8065a56afc7f50eb0220282aae5c2663c6ad17fd4d7cc0f6964a1e35d942cbe8db5488c8e782f4335807412102394542bf928bc707dcc156acf72e87c9d2fef77eaefc5f6b836d9ceeb0fc6a3e",
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac",
            "value": 41831,
            "sequenceNo": 4294967295
        }
    ],
    "outputs": [
        {
            "value": 0,
            "outputScript": "6a046368617432636865636b6f75742074686973207477656574205b7477745d313736363330343433303432333531353137305b2f7477745d"
        },
        {
            "value": 550,
            "outputScript": "76a914f627e51001a51a1a92d8927808701373cf29267f88ac"
        },
        {
            "value": 40694,
            "outputScript": "76a9140b7d35fda03544a08e65464d54cfae4257eb6db788ac"
        }
    ],
    "lockTime": 0,
    "block": {
        "height": 837771,
        "hash": "000000000000000001d6ffdfbde7c791c4cce109de88f64c809d33331e5d1193",
        "timestamp": 1711543010
    },
    "timeFirstSeen": 1711543000,
    "size": 291,
    "isCoinbase": false,
    "tokenEntries": [],
    "tokenFailedParsings": [],
    "tokenStatus": "TOKEN_STATUS_NON_TOKEN"
};

export const mockParsedXecSendTxWithOpReturnTweet = {
    "incoming": false,
    "xecAmount": "5.5",
    "isEtokenTx": false,
    "airdropFlag": false,
    "airdropTokenId": "",
    "opReturnMessage": "checkout this tweet ",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": true,
    "iseCashChatPost": false,
    "replyTxid": false,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "imageSrc": false,
    "videoId": false,
    "url": false,
    "txDate": "27 Mar 2024",
    "txTime": "23:36:40",
    "tweetId": "1766304430423515170"
};

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
    "iseCashChatPost": false,
    "replyTxid": false,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "imageSrc": false,
    "videoId": false,
    "tweetId": false,
    "url": false,
    "txid": "68f55677b4fcacff6a47a78976aa11238dab1f323e002416b26f3335cb387ee2",
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
    "replyTxid": false,
    "opReturnMessage": "hello world with a youtube video:  ",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": true,
    "iseCashChatPost": false,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "imageSrc": false,
    "tweetId": false,
    "url": false,
    "txid": "11be4139a5e76835708aa8495b4fab9db906c15bf6dea07fb63b1f223a97b2e1",
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
    "replyTxid": false,
    "opReturnMessage": "hello world with an embedded image:  ",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": true,
    "iseCashChatPost": false,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "txid": "6276cc29dfd8d2cb7a75309e95d41a023c7a1b5ae0aa656d6788eb79e104af13",
    "imageSrc": "https://i.imgur.com/tIqtdgJ.jpeg",
    "videoId": false,
    "tweetId": false,
    "url": false,
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
    "replyTxid": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": true,
    "iseCashChatPost": false,
    "replyAddress": "ecash:qq9h6d0a5q65fgywv4ry64x04ep906mdku8f0gxfgx",
    "recipientAddress": "ecash:qrmz0egsqxj35x5jmzf8szrszdeu72fx0uxgwk3r48",
    "aliasFlag": false,
    "imageSrc": false,
    "videoId": false,
    "tweetId": false,
    "url": false,
    "txid": "e78a0053cc4914c5b114f8d45b08afb738bca2acfc6644fefc262f043eb03cb2",
    "txDate": "Mar 26, 2024",
    "txTime": "12:01:49 pm"
};

export const mockXecSendTxWithOpReturnTownhallPost = {
    "txid": "748e17c310772beacca8341d143e730b7c82de336e370c272c362618cc0db0c2",
    "version": 2,
    "inputs": [
        {
            "prevOut": {
                "txid": "8aa22a1f3fcdd442792c6e9a710e9fc049ec1db95c9d4f10cc1c7973ce1da75a",
                "outIdx": 2
            },
            "inputScript": "47304402202d5f879395aec72f0504c384d46cf63452cd5a066adc31e2ec14b26aacd1f63c02201c99188524312192947d8e9f3233b23284d3768439a3678b1ed01587dd58e245412102e14ed9fa680df4088485ad5712abb22fbfee91145cf350d0ea4abd51625fe319",
            "outputScript": "76a914f2395e2350e634e4afe31eb495c3a1e2bd1f362288ac",
            "value": 48943,
            "sequenceNo": 4294967295
        }
    ],
    "outputs": [
        {
            "value": 0,
            "outputScript": "6a046368617404706f73740c796f6f6f6f6f6f20f09f9881"
        },
        {
            "value": 550,
            "outputScript": "76a91470a784633e942b7e1c9947255910c8132623225c88ac"
        },
        {
            "value": 47872,
            "outputScript": "76a914f2395e2350e634e4afe31eb495c3a1e2bd1f362288ac"
        }
    ],
    "lockTime": 0,
    "block": {
        "height": 838888,
        "hash": "00000000000000000ec1f309f37989a4e02d0d58ab1c846214749046bea30b35",
        "timestamp": 1712201369
    },
    "timeFirstSeen": 1712200804,
    "size": 258,
    "isCoinbase": false,
    "tokenEntries": [],
    "tokenFailedParsings": [],
    "tokenStatus": "TOKEN_STATUS_NON_TOKEN"
};

export const mockParsedXecSendTxWithOpReturnTownhallPost = {
    "incoming": false,
    "xecAmount": "5.5",
    "isEtokenTx": false,
    "airdropFlag": false,
    "airdropTokenId": "",
    "opReturnMessage": "yoooooo 😁",
    "isCashtabMessage": false,
    "replyTxid": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": false,
    "iseCashChatPost": true,
    "replyAddress": "ecash:qrerjh3r2rnrfe90uv0tf9wr583t68ekyggulcgp55",
    "recipientAddress": "ecash:qpc20prr862zklsun9rj2kgseqfjvgezts4ah8wh7h",
    "aliasFlag": false,
    "imageSrc": false,
    "videoId": false,
    "url": false,
    "txid": "748e17c310772beacca8341d143e730b7c82de336e370c272c362618cc0db0c2",
    "txDate": "Apr 4, 2024",
    "txTime": "2:20:04 pm",
    "tweetId": false
};

export const mockXecSendTxWithOpReturnTownhallReplyPost = {
    "txid": "071c8be74448569bc4c0524e4478b4fcc1d9a97dc7f299c2eb03fddeeefee8fd",
    "version": 2,
    "inputs": [
        {
            "prevOut": {
                "txid": "0729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d4",
                "outIdx": 2
            },
            "inputScript": "483045022100db5ece9b28af37ec5f7af706a4bea14418b423eaf0b20036ff3f50db03359b43022029451aaf2f03c64c7c310d58b7ea585cfa5adaacc102a485f4c8a79a19152b2a412102e14ed9fa680df4088485ad5712abb22fbfee91145cf350d0ea4abd51625fe319",
            "outputScript": "76a914f2395e2350e634e4afe31eb495c3a1e2bd1f362288ac",
            "value": 44560,
            "sequenceNo": 4294967295
        }
    ],
    "outputs": [
        {
            "value": 0,
            "outputScript": "6a04636861740468617368200729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d41a746869732069732061207265706c79206f662061207265706c79"
        },
        {
            "value": 550,
            "outputScript": "76a91470a784633e942b7e1c9947255910c8132623225c88ac"
        },
        {
            "value": 43394,
            "outputScript": "76a914f2395e2350e634e4afe31eb495c3a1e2bd1f362288ac"
        }
    ],
    "lockTime": 0,
    "block": {
        "height": 839087,
        "hash": "000000000000000007e0653b954a817de3901205b0e6c9ff96914185ff3eb176",
        "timestamp": 1712291772
    },
    "timeFirstSeen": 1712291386,
    "size": 306,
    "isCoinbase": false,
    "tokenEntries": [],
    "tokenFailedParsings": [],
    "tokenStatus": "TOKEN_STATUS_NON_TOKEN"
};

export const mockParsedXecSendTxWithOpReturnTownhallReplyPost = {
    "txid": "071c8be74448569bc4c0524e4478b4fcc1d9a97dc7f299c2eb03fddeeefee8fd",
    "incoming": true,
    "xecAmount": "5.5",
    "isEtokenTx": false,
    "airdropFlag": false,
    "airdropTokenId": "",
    "opReturnMessage": "this is a reply of a reply",
    "isCashtabMessage": false,
    "isEncryptedMessage": false,
    "iseCashChatMessage": false,
    "iseCashChatPost": false,
    "replyAddress": "ecash:qrerjh3r2rnrfe90uv0tf9wr583t68ekyggulcgp55",
    "recipientAddress": "ecash:qpc20prr862zklsun9rj2kgseqfjvgezts4ah8wh7h",
    "aliasFlag": false,
    "imageSrc": false,
    "videoId": false,
    "txDate": "5 Apr 2024",
    "txTime": "15:29:46",
    "tweetId": false,
    "url": false,
    "replyTxid": "0729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d4"
};
