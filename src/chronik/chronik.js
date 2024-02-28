// Chronik methods
import { chronik as chronikConfig } from '../config/config';

export const getTxHistoryPage = async (chronik, hash160, page = 0) => {
    let txHistoryPage;
    try {
        txHistoryPage = await chronik
            .script('p2pkh', hash160)
            .history(page, chronikConfig.txHistoryPageSize);
        return txHistoryPage;
    } catch (err) {
        console.log(`Error in getTxHistoryPage(${hash160})`, err);
    }
};
