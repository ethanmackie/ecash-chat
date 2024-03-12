import { isValidRecipient, isValidMessage } from '../validation';

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
