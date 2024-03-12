/**
 * @jest-environment ./custom-environment
 */
 
import { encodeBip21Message } from '../utils';

it(`encodeBip21Message() correctly encodes a valid message for use in a BIP21 querystring`, () => {
    expect(encodeBip21Message('encode this')).toStrictEqual('0b656e636f64652074686973');
});
it(`encodeBip21Message() correctly returns undefined for no message inputs`, () => {
    expect(encodeBip21Message()).toStrictEqual(undefined);
});
