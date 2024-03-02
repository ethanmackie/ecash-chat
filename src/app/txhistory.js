"use client";
import { useState, useEffect } from 'react';
import { getTxHistoryPage } from '../chronik/chronik';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { chronik as chronikConfig } from '../config/config';
import { ChronikClientNode } from 'chronik-client';

const chronik = new ChronikClientNode(chronikConfig.urls);

export default function TxHistory({ address }) {
    const [txHistory, setTxHistory] = useState('');
    const [currentTxHistoryPage, setCurrentTxHistoryPage] = useState(0);
    const [loadingMsg, setLoadingMsg] = useState('');
    
    useEffect(() => {
        // Render the first page by default upon initial load
        getTxHistoryByPage(currentTxHistoryPage);
    }, []);

    const getTxHistoryByPage = async (page) => {
        setLoadingMsg('Retrieving data from Chronik, please wait.');
        const txHistoryResp = await getTxHistoryPage(chronik, address, page);
        if (typeof txHistoryResp !== undefined) {
            setTxHistory(txHistoryResp);
        }
        setLoadingMsg('');
    };

    return (
        <div>
          {txHistory && txHistory !== '' ? (
              <>
              <br />
              {/*Set up pagination menu*/}
              {(() => {
                  let page = [];
                  for (let i = 0; i < txHistory.numPages; i += 1) {
                    page.push(<a href={"#"} onClick={() => getTxHistoryByPage(i)} key={i}>{i+1} | </a>);
                  }
                  return page;
                })()}
              <br />
              {/*Render tx history*/}
              <div>{loadingMsg}</div>
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
            ) : <Skeleton count={10} />
          }
        </div>
    );
}
