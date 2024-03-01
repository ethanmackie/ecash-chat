"use client";
import { useState, useEffect } from 'react';
import { getTxHistoryPage } from '../chronik/chronik';
import { chronik as chronikConfig } from '../config/config';
import { ChronikClientNode } from 'chronik-client';

const chronik = new ChronikClientNode(chronikConfig.urls);

export default function TxHistory({ address }) {
    const [txHistory, setTxHistory] = useState('');
    
    useEffect(() => {
        async function refreshTxHistory() {
            const txHistoryResp = await getTxHistoryPage(chronik, address);
            if (typeof txHistoryResp !== undefined) {
                setTxHistory(txHistoryResp);
            }
        };
        refreshTxHistory();
    }, []);

    return (
        <div>
          txHistory:
          {txHistory && txHistory !== '' && (
              <>
              {txHistory.numPages} pages of tx history. Displaying {chronikConfig.txHistoryCount} transactions below.
              <br />
              {txHistory &&
              txHistory.txs &&
              txHistory.txs.length > 0
                  ? txHistory.txs.map(
                        (tx, index) => (
                            <li key={index}>tx{index+1}: {tx.txid}</li>
                        ),
                    )
                  : ''}
              </>
              )
          }
        </div>
    );
}
