import cashaddr from 'ecashaddrjs';
import { opReturn as opreturnConfig } from '../config/opreturn';

// Validates the Recipient input for a valid eCash address
// TODO: add validation for alias inputs
export const isValidRecipient = value => {
    return cashaddr.isValidCashAddress(value, 'ecash');
};

// Validates the length of the message
export const isValidMessage = message => {
    return opreturnConfig.cashtabMsgByteLimit >= Buffer.from(message, 'utf8').length;
};

// Validates the length of the townhall post
export const isValidPost = post => {
    return opreturnConfig.townhallPostByteLimit >= Buffer.from(post, 'utf8').length;
};
