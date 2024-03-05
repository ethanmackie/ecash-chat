"use client";
import { useState, useEffect } from 'react';
import { getTxHistory } from '../chronik/chronik';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
import cashaddr from 'ecashaddrjs';

const chronik = new ChronikClientNode(chronikConfig.urls);

export default function TxHistory({ address }) {
    const [txHistory, setTxHistory] = useState('');
    const [loadingMsg, setLoadingMsg] = useState('');
    
    useEffect(() => {
        // Render the first page by default upon initial load
        (async () => {
            await getTxHistoryByPage(0);
        })();
    }, []);

    // Retrieves the tx history specific to OP_RETURN messages
    const getTxHistoryByPage = async (page) => {
        if (
            typeof page !== "number" ||
            chronik === undefined ||
            !cashaddr.isValidCashAddress(address, 'ecash')
        ) {
            return;
        }

        setLoadingMsg('Retrieving data from Chronik, please wait.');
        const txHistoryResp = await getTxHistory(chronik, address, page);
        if (Array.isArray(txHistoryResp.txs)) {
            setTxHistory(txHistoryResp);
        }
        setLoadingMsg('');
    };

    return (
        <div>
          {txHistory && txHistory !== '' ? (
              <>
              {/*Set up pagination menu*/}
              <br />
              Scan recent transactions:{'   '}
              {(() => {
                  let page = [];
                  for (let i = 0; i < txHistory.numPages; i += 1) {
                    page.push(<a href={"#"} onClick={() => getTxHistoryByPage(i)} key={i}>{i*chronikConfig.txHistoryPageSize}-{(i+1)*chronikConfig.txHistoryPageSize} | </a>);
                  }
                  return page;
                })()}
              {loadingMsg}
              {/*Render tx history*/}
              {txHistory &&
                txHistory.txs &&
                  txHistory.txs.length > 0
                  ? txHistory.txs.map(
                        (tx, index) => (
                            <li key={index}>{tx.incoming ? 'Received' : 'Sent'} {tx.opReturnMessage ? `msg: "${tx.opReturnMessage}"` : ' '} with {tx.xecAmount} XEC in value</li>
                        ),
                    )
                  : `No messages in this range of transactions.`}
              </>
            ) : <Skeleton count={10} />
          }
        </div>
    );
}
