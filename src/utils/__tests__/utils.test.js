/**
 * @jest-environment ./custom-environment
 */
 
import { encodeBip21Message, encodeBip21Post, formatDate, encodeBip21ReplyPost } from '../utils';

it(`encodeBip21Message() correctly encodes a valid message for use in a BIP21 querystring`, () => {
    expect(encodeBip21Message('encode this')).toStrictEqual('04636861740b656e636f64652074686973');
});
it(`encodeBip21Message() correctly encodes a valid message containing emojis for use in a BIP21 querystring`, () => {
    expect(encodeBip21Message('encode this😃')).toStrictEqual('04636861740f656e636f64652074686973f09f9883');
});
it(`encodeBip21Message() correctly returns empty string for no message inputs`, () => {
    expect(encodeBip21Message()).toStrictEqual('');
});
it(`encodeBip21Post() correctly encodes a valid message for use in a BIP21 querystring`, () => {
    expect(encodeBip21Post('encode this')).toStrictEqual('046368617404706f73740b656e636f64652074686973');
});
it(`encodeBip21Post() correctly encodes a valid message containing emojis for use in a BIP21 querystring`, () => {
    expect(encodeBip21Post('encode this😃')).toStrictEqual('046368617404706f73740f656e636f64652074686973f09f9883');
});
it(`encodeBip21Post() correctly returns empty string for no message inputs`, () => {
    expect(encodeBip21Post()).toStrictEqual('');
});
it(`encodeBip21ReplyPost() correctly encodes a valid message for use in a BIP21 querystring`, () => {
    expect(encodeBip21ReplyPost(
        'encode this',
        '0729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d4',
    )).toStrictEqual('04636861740468617368200729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d40b656e636f64652074686973');
});
it(`encodeBip21ReplyPost() correctly encodes a valid message containing emojis for use in a BIP21 querystring`, () => {
    expect(encodeBip21ReplyPost(
        'encode this😃',
        '0729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d4',
    )).toStrictEqual('04636861740468617368200729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d40f656e636f64652074686973f09f9883');
});
it(`encodeBip21ReplyPost() correctly returns empty string for no message inputs`, () => {
    expect(encodeBip21ReplyPost()).toStrictEqual('');
});
it(`Accepts a valid unix timestamp`, () => {
    expect(formatDate('1639679649', 'fr')).toBe('17 déc. 2021');
});
it(`Accepts an empty string and generates a new timestamp`, () => {
    expect(formatDate('', 'en-US')).toBe(
        new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
    );
});
it(`Accepts no parameter and generates a new timestamp`, () => {
    expect(formatDate(null, 'en-US')).toBe(
        new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
    );
});
it(`Accepts 'undefined' as a parameter and generates a new date`, () => {
    expect(formatDate(undefined, 'en-US')).toBe(
        new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }),
    );
});
it(`Rejects an invalid string containing letters.`, () => {
    expect(formatDate('f', 'en-US')).toBe('Invalid Date');
});
it(`Rejects an invalid string containing numbers.`, () => {
    expect(formatDate('10000000000000000', 'en-US')).toBe('Invalid Date');
});
