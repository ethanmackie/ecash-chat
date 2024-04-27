import cashaddr from 'ecashaddrjs';
import { opReturn as opreturnConfig } from '../config/opreturn';

// Validates the Recipient input for a valid eCash address
// TODO: add validation for alias inputs
export const isValidRecipient = value => {
    return cashaddr.isValidCashAddress(value, 'ecash');
};

// Validates the message contents
export const messageHasErrors = (message, encryptionFlag) => {
    let errorMessage = false;

    // Check validity of any img tags
    if (
        message.includes('[img]') &&
        message.includes('[/img]')
    ) {
        let imageLink = message.substring(
            message.indexOf('[img]') + 5,
            message.lastIndexOf('[/img]')
        );
        let dotIndex = imageLink.lastIndexOf('.');
        let extension = imageLink.substring(dotIndex);
        const validExtensions = ['.jpg', '.jpeg', 'png'];
        if (!validExtensions.some(substring => extension.includes(substring))) {
            errorMessage = "Image link needs to be a direct link to the image ending in .jpg, .jpeg or .png";
        }
    }

    if (encryptionFlag && Buffer.from(message, 'utf8').length > opreturnConfig.encryptedMessageByteLimit) {
        errorMessage = "Encrypted messages are limited to 95 bytes."
    } else if (!encryptionFlag && Buffer.from(message, 'utf8').length > opreturnConfig.cashtabMsgByteLimit) {
        errorMessage = "Unencrypted messages are limited to 215 bytes."
    }

    return errorMessage;
};

// Validates the length of the townhall post
export const postHasErrors = post => {
    let errorMessage = false;

    // Check validity of any img tags
    if (
        post.includes('[img]') &&
        post.includes('[/img]')
    ) {
        let imageLink = post.substring(
            post.indexOf('[img]') + 5,
            post.lastIndexOf('[/img]')
        );
        let dotIndex = imageLink.lastIndexOf('.');
        let extension = imageLink.substring(dotIndex);
        const validExtensions = ['.jpg', '.jpeg', 'png'];
        if (!validExtensions.some(substring => extension.includes(substring))) {
            errorMessage = "Image link needs to be a direct link to the image ending in .jpg, .jpeg or .png";
        }
    }

    if (Buffer.from(post, 'utf8').length > opreturnConfig.townhallPostByteLimit) {
        errorMessage = `Post must be between 0 - ${opreturnConfig.townhallPostByteLimit} bytes`;
    }
    return errorMessage;
};

// Validates the length of the townhall reply post
export const isValidReplyPost = post => {
    return opreturnConfig.townhallReplyPostByteLimit >= Buffer.from(post, 'utf8').length;
};
