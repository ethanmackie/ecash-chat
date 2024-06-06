import * as utxolib from '@bitgo/utxo-lib';
import { opReturn as opreturnConfig } from '../config/opreturn';
import { BN } from 'slp-mdm';
const SATOSHIS_PER_XEC = 100;

/**
 * Extracts a tweet ID from a twitter url
 * @param {string} the full twitter Url
 * @returns {string} tweet Id
 */
export const getTweetId = tweetUrl => {
    let updatedTweetId;
    let parsedMessage = tweetUrl;
    let tweetId = tweetUrl.substring(
        tweetUrl.indexOf('[twt]') + 5,
        tweetUrl.lastIndexOf('[/twt]')
    );
    // Check if video Id contains the full tweet url
    if (tweetId.includes('status/')) {
        // Extract the tweet Id after the 'status/' substring
        return tweetId.split('status/')[1];
    }
    return parsedMessage;
};

/**
 * Convert an amount in satoshis to XEC
 * @param {Integer} satoshis
 * @returns {Number}
 */
export const toXec = satoshis => {
    if (!Number.isInteger(satoshis)) {
        throw new Error('Input param satoshis must be an integer');
    }
    return new BN(satoshis).div(SATOSHIS_PER_XEC).toNumber();
};

// Encode the op_return message script
// encryptionFlag indicates whether to use the encrypted message prefix
export const encodeBip21Message = (message, encryptionFlag) => {
    if (typeof message !== 'string') {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        if (encryptionFlag) {
            script.push(Buffer.from(opreturnConfig.encryptedMessagePrefixHex, 'hex'));
        }

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(message, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat message: ', err);
    }
};

// Encodes the op_return script for an XEC tipping action
export const encodeBip2XecTip = () => {
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        // Push XEC tip identifier
        script.push(Buffer.from(opreturnConfig.xecTipPrefixHex, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(' ', 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat message: ', err);
    }
};

// Encodes the op_return script for an XEC paywall payment
export const encodeBip21PaywallPayment = replyTxid => {
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.paywallPaymentPrefixHex, 'hex'));

        // Push txid of paywalled article
        script.push(Buffer.from(replyTxid));

        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding paywall payement: ', err);
    }
};

// Encode the op_return post script
export const encodeBip21Post = post => {
    if (typeof post !== 'string') {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        // Push eCash Chat post identifier
        script.push(Buffer.from(opreturnConfig.townhallPostPrefixHex, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(post, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat post: ', err);
    }
};

// Encode the op_return article script
export const encodeBip21Article = article => {
    if (typeof article !== 'string') {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat blog identifier
        script.push(Buffer.from(opreturnConfig.articlePrefixHex, 'hex'));

        // eCash Chat Article metadata are utf8 encoded
        const eCashChatMsgScript = Buffer.from(article, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat article: ', err);
    }
};

// Encode the op_return reply article script
export const encodeBip21ReplyArticle = (articleReply, replyTxid) => {
    if (
        typeof articleReply !== 'string' ||
        typeof replyTxid !== 'string'
    ) {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.articlePrefixHex, 'hex'));

        // Push eCash Chat reply article identifier
        script.push(Buffer.from(opreturnConfig.articleReplyPrefixHex, 'hex'));

        // Push eCash Chat reply txid
        script.push(Buffer.from(replyTxid, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(articleReply, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat article reply: ', err);
    }
};

// Encode the op_return reply post script
export const encodeBip21ReplyPost = (post, replyTxid) => {
    if (
        typeof post !== 'string' ||
        typeof replyTxid !== 'string'
    ) {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        // Push eCash Chat reply post identifier
        script.push(Buffer.from(opreturnConfig.townhallReplyPostPrefixHex, 'hex'));

        // Push eCash Chat reply txid
        script.push(Buffer.from(replyTxid, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(post, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat post: ', err);
    }
};

// Encode the op_return NFT showcase script
export const encodeBip21NftShowcase = (showcaseMsg, nftId) => {
    if (
        typeof showcaseMsg !== 'string' ||
        typeof nftId !== 'string'
    ) {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        // Push eCash Chat NFT showcase identifier
        script.push(Buffer.from(opreturnConfig.nftShowcasePrefixHex, 'hex'));

        // Push eCash Chat nftId
        script.push(Buffer.from(nftId, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(showcaseMsg, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat nft showcase: ', err);
    }
};

// Formats a date value
export const formatDate = (dateString, userLocale = 'en') => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateFormattingError = 'Unable to format date.';
    try {
        if (dateString) {
            return new Date(dateString * 1000).toLocaleDateString(
                userLocale,
                options,
            );
        }
        return new Date().toLocaleDateString(userLocale, options);
    } catch (error) {
        return dateFormattingError;
    }
};