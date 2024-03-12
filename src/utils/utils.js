import * as utxolib from '@bitgo/utxo-lib';

// Encode the op_return message script
export const encodeBip21Message = message => {
    if (typeof message !== 'string') {
        return;
    }
    try {
        return utxolib.script.compile(
            [Buffer.from(message, 'utf8')],
        ).toString('hex');
    } catch (err) {
        console.log('Error in encodeBip21Message(): ', err);
    }
};
