import { isValidRecipient, messageHasErrors, postHasErrors, replyHasErrors } from '../validation';
import { opReturn as opreturnConfig } from '../../config/opreturn';

it(`isValidRecipient() validates a valid eCash address`, () => {
    expect(isValidRecipient('ecash:prfhcnyqnl5cgrnmlfmms675w93ld7mvvqd0y8lz07')).toEqual(true);
});
it(`isValidRecipient() validates a valid prefix-less eCash address`, () => {
    expect(isValidRecipient('prfhcnyqnl5cgrnmlfmms675w93ld7mvvqd0y8lz07')).toEqual(true);
});
it(`isValidRecipient() invalidates an invalid eCash address`, () => {
    expect(isValidRecipient('ecash:prfhcnyNOTVALIDvqd0y8lz07')).toEqual(false);
});
it(`messageHasErrors() validates a message within byte limits`, () => {
    expect(messageHasErrors(
        'this is a short message'),
    ).toEqual(false);
});
it(`messageHasErrors() invalidates a message with an invalid img tag`, () => {
    expect(messageHasErrors(
        'this is a short message[img]https://imgur.com/gallery/nv9jLg7[/img]'),
    ).toEqual("Image link needs to be a direct link to the image ending in .jpg, .jpeg, .png or .gif");
});
it(`messageHasErrors() validates a message with a valid img tag`, () => {
    expect(messageHasErrors(
        'this is a short message[img]https://i.imgur.com/qdcJiTJ.jpeg[/img]'),
    ).toEqual(false);
});
it(`messageHasErrors() validates a message exactly cashtabMsgByteLimit long`, () => {
    expect(messageHasErrors(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(false);
});
it(`messageHasErrors() validates a valid message with symbols`, () => {
    expect(messageHasErrors(
        'Use the ©☎ submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(false);
});
it(`messageHasErrors() validates a valid message with non-english characters`, () => {
    expect(messageHasErrors(
        'Use the 안녕하세요 submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(false);
});
it(`messageHasErrors() invalidates a message longer than cashtabMsgByteLimit`, () => {
    expect(messageHasErrors(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disable tddddd'),
    ).toEqual('Unencrypted messages are limited to 215 bytes.');
});
it(`messageHasErrors() validates a message within encryptedMessageByteLimit`, () => {
    expect(messageHasErrors(
        'this is a short message',
        true,
        ),
    ).toEqual(false);
});
it(`messageHasErrors() validates a message exactly encryptedMessageByteLimit long`, () => {
    expect(messageHasErrors(
        'Use the following styles to indicate a disabled button. This can be often used inside form elem',
        true,
        ),
    ).toEqual(false);
});
it(`messageHasErrors() invalidates a message longer than encryptedMessageByteLimit`, () => {
    expect(messageHasErrors(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disable tddddd',
        true,
        ),
    ).toEqual("Encrypted messages are limited to 95 bytes.");
});
it(`postHasErrors() validates a post within byte limits`, () => {
    expect(postHasErrors(
        'this is a short message'),
    ).toEqual(false);
});
it(`postHasErrors() validates a post exactly townhallPostByteLimit long`, () => {
    expect(postHasErrors(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disab'),
    ).toEqual(false);
});
it(`postHasErrors() validates a valid post with symbols`, () => {
    expect(postHasErrors(
        'Use the ©☎ submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(false);
});
it(`postHasErrors() validates a valid post with non-english characters`, () => {
    expect(postHasErrors(
        'Use the 안녕하세요 submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(false);
});
it(`postHasErrors() invalidates a post with an invalid img tag`, () => {
    expect(postHasErrors(
        'this is a short message[img]https://imgur.com/gallery/nv9jLg7[/img]'),
    ).toEqual("Image link needs to be a direct link to the image ending in .jpg, .jpeg, .png or .gif");
});
it(`postHasErrors() validates a message with a valid img tag`, () => {
    expect(postHasErrors(
        'this is a short message[img]https://i.imgur.com/qdcJiTJ.jpeg[/img]'),
    ).toEqual(false);
});
it(`postHasErrors() invalidates a post longer than townhallPostByteLimit`, () => {
    expect(postHasErrors(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disable tddddd'),
    ).toEqual("Post must be between 0 - 210 bytes");
});
it(`replyHasErrors() validates a post within byte limits`, () => {
    expect(replyHasErrors(
        'this is a short message'),
    ).toEqual(false);
});
it(`replyHasErrors() validates a post exactly townhallReplyPostByteLimit long`, () => {
    expect(replyHasErrors(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete '),
    ).toEqual(false);
});
it(`replyHasErrors() validates a valid post with symbols`, () => {
    expect(replyHasErrors(
        'Use the ©☎ submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(false);
});
it(`replyHasErrors() validates a valid post with non-english characters`, () => {
    expect(replyHasErrors(
        'Use the 안녕하세요 submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(false);
});
it(`replyHasErrors() invalidates a post longer than townhallReplyPostByteLimit`, () => {
    expect(replyHasErrors(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disable tddddd'),
    ).toEqual(`Post must be between 0 - ${opreturnConfig.townhallReplyPostByteLimit} bytes`);
});
