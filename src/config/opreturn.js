export const opReturn = {
    opReturnPrefixHex: '6a',
    opReturnPrefixDec: '106',
    opPushDataOne: '4c',
    appPrefixesHex: {
        eToken: '534c5000',
        cashtab: '00746162',
        cashtabEncrypted: '65746162', // Preserve here for use in tx processing
        airdrop: '64726f70',
        aliasRegistration: '2e786563',
        paybutton: '50415900',
        eCashChat: '63686174',
        paywallPaymentPrefixHex: '70617977',
        authPrefixHex: '61757468',
    },
    /* The max payload per spec is 220 bytes (or 223 bytes including +1 for OP_RETURN and +2 for pushdata opcodes)
       Within this 223 bytes, transaction building will take up 8 bytes, hence cashtabMsgByteLimit is set to 215 bytes
       i.e.
        6a
        04
        [prefix byte]
        [prefix byte]
        [prefix byte]
        [prefix byte]
        4c [next byte is pushdata byte]
        [pushdata byte] (d7 for 215 on a max-size Cashtab msg)
    */
    cashtabMsgByteLimit: 215,
    // townhallPostByteLimit = cashtabMsgByteLimit - pushdata byte (1 byte) - eCashChat prefix (4 bytes)
    townhallPostByteLimit: 210,
    // townhallPostByteLimit = cashtabMsgByteLimit - pushdata byte (1 byte)
    //      - eCashChat reply prefix (4 bytes) - pushdata byte (1 byte) - replyTxid (32 bytes)
    townhallReplyPostByteLimit: 177,
    townhallPostPrefixHex: '706f7374',
    townhallReplyPostPrefixHex: '68617368',
    articleByteLimit: 5000,
    articleReplyByteLimit: 177,
    articlePrefixHex: '626c6f67',
    articleReplyPrefixHex: '726c6f67',
    encryptedMessagePrefixHex: '70617373',
    encryptedMessageByteLimit: 95,
    xecTipPrefixHex: '74697073',
    townhallMvpPostPrefixHex: '6e667470',
    nftShowcasePrefixHex: '6e667473',
    nftShowcaseMessageByteLimit: 177,
    // Airdrop spec is <OP_RETURN> <Airdrop protocol identifier> <tokenId> <optionalMsg>
    // in bytes, = 1 + (1 + 4) + (1 + 32) + (1 or 2 + LIMIT)
    // airdropMsgByteLimit = 182 = 223 - 1 - 5 - 33 - 2
    airdropMsgByteLimit: 182,
    opreturnParamByteLimit: 222,
    townhallMvpTokenIds: ['9c5174f551fb7974f0fb140d862079800405b3a2d8064199b21be47f16ba465c', '6b5df2d33a356cf24dc034ed9ef266dd448a93555114a77e5fda22e25976c1d1'],
    articleMvpTokenIds: ['dc355e54901ed2cd258e858e84ed1062e71d61aae1e67762d4826920b0a7f7ee', 'b82f09f639db12d76cafe3af5641ec08961a9eef17763697fb864a7f51f62baf'],
};
