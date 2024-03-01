// Chronik methods
import { chronik as chronikConfig } from '../config/config';

export const getTxHistoryPage = async (chronik, address, page = 0) => {
    let txHistoryPage;
    try {
        return await chronik.address(address).history(page, chronikConfig.txHistoryPageSize);
    } catch (err) {
        console.log(`Error in getTxHistoryPage(${address})`, err);
    }
};
