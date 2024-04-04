import * as utxolib from '@bitgo/utxo-lib';
import { opReturn as opreturnConfig } from '../config/opreturn';

// Encode the op_return message script
export const encodeBip21Message = message => {
    if (typeof message !== 'string') {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(message, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat message: ', err);
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
