import { isValidRecipient, isValidMessage, isValidPost } from '../validation';

it(`isValidRecipient() validates a valid eCash address`, () => {
    expect(isValidRecipient('ecash:prfhcnyqnl5cgrnmlfmms675w93ld7mvvqd0y8lz07')).toEqual(true);
});
it(`isValidRecipient() validates a valid prefix-less eCash address`, () => {
    expect(isValidRecipient('prfhcnyqnl5cgrnmlfmms675w93ld7mvvqd0y8lz07')).toEqual(true);
});
it(`isValidRecipient() invalidates an invalid eCash address`, () => {
    expect(isValidRecipient('ecash:prfhcnyNOTVALIDvqd0y8lz07')).toEqual(false);
});
it(`isValidMessage() validates a message within byte limits`, () => {
    expect(isValidMessage(
        'this is a short message'),
    ).toEqual(true);
});
it(`isValidMessage() validates a message exactly cashtabMsgByteLimit long`, () => {
    expect(isValidMessage(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(true);
});
it(`isValidMessage() validates a valid message with symbols`, () => {
    expect(isValidMessage(
        'Use the ©☎ submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(true);
});
it(`isValidMessage() validates a valid message with non-english characters`, () => {
    expect(isValidMessage(
        'Use the 안녕하세요 submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(true);
});
it(`isValidMessage() invalidates a message longer than cashtabMsgByteLimit`, () => {
    expect(isValidMessage(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disable tddddd'),
    ).toEqual(false);
});
it(`isValidPost() validates a post within byte limits`, () => {
    expect(isValidPost(
        'this is a short message'),
    ).toEqual(true);
});
it(`isValidPost() validates a post exactly townhallPostByteLimit long`, () => {
    expect(isValidPost(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disab'),
    ).toEqual(true);
});
it(`isValidPost() validates a valid post with symbols`, () => {
    expect(isValidPost(
        'Use the ©☎ submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(true);
});
it(`isValidPost() validates a valid post with non-english characters`, () => {
    expect(isValidPost(
        'Use the 안녕하세요 submit button before all the form elements have been complete inside the form elements to disable td'),
    ).toEqual(true);
});
it(`isValidPost() invalidates a post longer than townhallPostByteLimit`, () => {
    expect(isValidPost(
        'Use the following styles to indicate a disabled button. This can be often used inside form elements to disable the submit button before all the form elements have been complete inside the form elements to disable tddddd'),
    ).toEqual(false);
});
