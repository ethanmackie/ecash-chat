/**
 * @jest-environment ./custom-environment
 */
import { parseChronikTx } from '../chronik';
import {
    mockXecSendTxWithOpReturn,
    mockXecSendTxWithOpReturnImage,
    mockXecSendTxWithOpReturnVideo,
    mockXecSendTxWithOpReturnEmoji,
    mockXecSendTxWithOpReturnTownhallPost,
    mockParsedXecSendTxWithOpReturn,
    mockParsedXecSendTxWithOpReturnImage,
    mockParsedXecSendTxWithOpReturnVideo,
    mockParsedXecSendTxWithOpReturnEmoji,
    mockParsedXecSendTxWithOpReturnTownhallPost,
    mockXecEncryptedSendTxWithOpReturn,
    mockParsedXecEncryptedSendTxWithOpReturn,
} from '../fixtures/mocks';

test('parseChronikTx() correctly parses a XEC send tx with OP_RETURN data retrieved from chronik', async () => {
    await expect(parseChronikTx(
        mockXecSendTxWithOpReturn,
        mockParsedXecSendTxWithOpReturn.replyAddress,
    )).toEqual(
        mockParsedXecSendTxWithOpReturn,
    );
});

test('parseChronikTx() correctly parses a XEC send tx with image embedded OP_RETURN data retrieved from chronik', async () => {
    await expect(parseChronikTx(
        mockXecSendTxWithOpReturnImage,
        mockParsedXecSendTxWithOpReturnImage.replyAddress,
    )).toEqual(
        mockParsedXecSendTxWithOpReturnImage,
    );
});

test('parseChronikTx() correctly parses a XEC send tx with youtube video embedded OP_RETURN data retrieved from chronik', async () => {
    await expect(parseChronikTx(
        mockXecSendTxWithOpReturnVideo,
        mockParsedXecSendTxWithOpReturnVideo.replyAddress,
    )).toEqual(
        mockParsedXecSendTxWithOpReturnVideo,
    );
});

test('parseChronikTx() correctly parses a XEC send tx with emoji embedded OP_RETURN data retrieved from chronik', async () => {
    await expect(parseChronikTx(
        mockXecSendTxWithOpReturnEmoji,
        mockParsedXecSendTxWithOpReturnEmoji.replyAddress,
    )).toEqual(
        mockParsedXecSendTxWithOpReturnEmoji,
    );
});

test('parseChronikTx() correctly parses a XEC send tx with a townhall post embedded OP_RETURN data retrieved from chronik', async () => {
    await expect(parseChronikTx(
        mockXecSendTxWithOpReturnTownhallPost,
        mockParsedXecSendTxWithOpReturnTownhallPost.replyAddress,
    )).toEqual(
        mockParsedXecSendTxWithOpReturnTownhallPost,
    );
});

test('parseChronikTx() correctly parses a XEC send tx with an encrypted OP_RETURN data retrieved from chronik', async () => {
    await expect(parseChronikTx(
        mockXecEncryptedSendTxWithOpReturn,
        mockParsedXecEncryptedSendTxWithOpReturn.replyAddress,
    )).toEqual(
        mockParsedXecEncryptedSendTxWithOpReturn,
    );
});
