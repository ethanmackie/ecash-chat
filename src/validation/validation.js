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
        const validExtensions = ['.jpg', '.jpeg', 'png', 'gif'];
        if (!validExtensions.some(substring => extension.includes(substring))) {
            errorMessage = "Image link needs to be a direct link to the image ending in .jpg, .jpeg, .png or .gif";
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
        const validExtensions = ['.jpg', '.jpeg', 'png', 'gif'];
        if (!validExtensions.some(substring => extension.includes(substring))) {
            errorMessage = "Image link needs to be a direct link to the image ending in .jpg, .jpeg, .png or .gif";
        }
    }

    if (Buffer.from(post, 'utf8').length > opreturnConfig.townhallPostByteLimit) {
        errorMessage = `Post must be between 0 - ${opreturnConfig.townhallPostByteLimit} bytes`;
    }
    return errorMessage;
};

// Validates the article
export const articleHasErrors = article => {
    let errorMessage = false;

    // Check validity of any img tags
    if (
        article.includes('[img]') &&
        article.includes('[/img]')
    ) {
        let imageLink = article.substring(
            article.indexOf('[img]') + 5,
            article.lastIndexOf('[/img]')
        );
        let dotIndex = imageLink.lastIndexOf('.');
        let extension = imageLink.substring(dotIndex);
        const validExtensions = ['.jpg', '.jpeg', 'png', 'gif'];
        if (!validExtensions.some(substring => extension.includes(substring))) {
            errorMessage = "Image link needs to be a direct link to the image ending in .jpg, .jpeg, .png or .gif";
        }
    }

    if (Buffer.from(article, 'utf8').length > opreturnConfig.articleByteLimit) {
        errorMessage = `article must be between 0 - ${opreturnConfig.articleByteLimit} bytes`;
    }
    return errorMessage;
};

// Validates the article reply
export const articleReplyHasErrors = articleReply => {
    let errorMessage = false;

    // Check validity of any img tags
    if (
        articleReply.includes('[img]') &&
        articleReply.includes('[/img]')
    ) {
        let imageLink = articleReply.substring(
            articleReply.indexOf('[img]') + 5,
            articleReply.lastIndexOf('[/img]')
        );
        let dotIndex = imageLink.lastIndexOf('.');
        let extension = imageLink.substring(dotIndex);
        const validExtensions = ['.jpg', '.jpeg', 'png', 'gif'];
        if (!validExtensions.some(substring => extension.includes(substring))) {
            errorMessage = "Image link needs to be a direct link to the image ending in .jpg, .jpeg, .png or .gif";
        }
    }

    if (Buffer.from(articleReply, 'utf8').length > opreturnConfig.articleReplyByteLimit) {
        errorMessage = `articleReply must be between 0 - ${opreturnConfig.articleReplyByteLimit} bytes`;
    }
    return errorMessage;
};

// Validates the townhall reply post
export const replyHasErrors = post => {
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
        const validExtensions = ['.jpg', '.jpeg', 'png', 'gif'];
        if (!validExtensions.some(substring => extension.includes(substring))) {
            errorMessage = "Image link needs to be a direct link to the image ending in .jpg, .jpeg, .png or .gif";
        }
    }

    if (Buffer.from(post, 'utf8').length > opreturnConfig.townhallReplyPostByteLimit) {
        errorMessage = `Post must be between 0 - ${opreturnConfig.townhallReplyPostByteLimit} bytes`;
    }
    return errorMessage;
};
