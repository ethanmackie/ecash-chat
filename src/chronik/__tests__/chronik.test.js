import { parseChronikTx } from '../chronik';
import {
    mockXecSendTxWithOpReturn,
    mockParsedXecSendTxWithOpReturn,
} from '../fixtures/mocks';

test('parseChronikTx() correctly parses a XEC send tx with OP_RETURN data retrieved from chronik', async () => {
    await expect(parseChronikTx(
        mockXecSendTxWithOpReturn,
        mockParsedXecSendTxWithOpReturn.replyAddress,
    )).toEqual(
        mockParsedXecSendTxWithOpReturn,
    );
});
