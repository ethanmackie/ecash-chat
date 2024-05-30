/**
 * @jest-environment ./custom-environment
 */
 
import {
    encodeBip21Message,
    encodeBip21Post,
    formatDate,
    encodeBip21ReplyPost,
    toXec,
    getTweetId,
    encodeBip2XecTip,
    encodeBip21Article,
    encodeBip21ReplyArticle,
    encodeBip21PaywallPayment,
} from '../utils';

it(`getTweetId() correctly extracts the tweet ID from a valid tweet url`, () => {
    const tweetUrl = '[twt]https://twitter.com/CashtabWallet/status/1784451748028944549[/twt]';
    expect(getTweetId(tweetUrl)).toStrictEqual('1784451748028944549');
});
it(`getTweetId() correctly returns the input an invalid valid tweet url`, () => {
    expect(getTweetId('[twt]https://www.youtube.com/watch?v=tAl6sPRFQgk[/twt]')).toStrictEqual('[twt]https://www.youtube.com/watch?v=tAl6sPRFQgk[/twt]');
});
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
it(`encodeBip21Article() correctly encodes a valid article for use in a BIP21 querystring`, () => {
    expect(encodeBip21Article(
        'This is a test article',
    )).toStrictEqual('04746573311654686973206973206120746573742061727469636c65');
});
it(`encodeBip21ReplyArticle() correctly encodes a valid article reply for use in a BIP21 querystring`, () => {
    expect(encodeBip21ReplyArticle(
        'This is a test reply to an existing article',
        '0729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d4',
    )).toStrictEqual('04746573310474657332200729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d42b5468697320697320612074657374207265706c7920746f20616e206578697374696e672061727469636c65');
});
it(`encodeBip2XecTip() correctly encodes a valid XEC tip for use in a BIP21 querystring`, () => {
    expect(encodeBip2XecTip()).toStrictEqual('046368617404746970730120');
});
it(`encodeBip21PaywallPayment() correctly encodes a valid article paywall payment for use in a BIP21 querystring`, () => {
    expect(encodeBip21PaywallPayment(
        '0729318a128ee8f11d18b28237c8ae7ffa4e95c88ec69ebce716758e1973c5d4',
    )).toStrictEqual('04706179774030373239333138613132386565386631316431386232383233376338616537666661346539356338386563363965626365373136373538653139373363356434');
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
it(`toXec returns the correct XEC balance`, () => {
    expect(toXec(parseInt(37150))).toBe(371.5);
});
it(`toXec returns the correct XEC balance for larger numbers`, () => {
    expect(toXec(parseInt(137151110))).toBe(1371511.1);
});
