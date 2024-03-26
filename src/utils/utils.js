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
