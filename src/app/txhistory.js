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
         <>
         {txHistory && txHistory !== '' ? (
             <>
             {/*Set up pagination menu*/}
             <br />
             Scan recent transactions{'   '}<br />
  
             <span>Page: 
             <nav aria-label="Page navigation example">
                <ul className="inline-flex -space-x-px text-base h-10">           
                   {(() => {
                       let page = [];
                       for (let i = 0; i < txHistory.numPages; i += 1) {
                         page.push(
                           <li key={i}>
                             <a href={"#"} onClick={() => getTxHistoryByPage(i)} key={i} className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                 {(i+1)}
                             </a>
                           </li>
                        );
                       }
                       return page;
                     })()}
               </ul>
               </nav>
               </span>

             {loadingMsg}
             <br />
             {/*Render tx history*/}
             {txHistory &&
               txHistory.txs &&
                 txHistory.txs.length > 0
                 ? txHistory.txs.map(
                       (tx, index) => (
                         <>
                         <div className="flex items-start gap-2.5">
                            <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                               
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                               <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{tx.incoming ? 'Received from: ' : 'Sent to: '} </span>
                               <span className="text-sm font-semibold text-gray-900 dark:text-white">{tx.replyAddress.substring(0,10)} ... {tx.replyAddress.substring(tx.replyAddress.length - 5)}</span>
                            </div>
                            <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white" key={index}>{tx.opReturnMessage ? `${tx.opReturnMessage}` : ' '}</p>
                            {tx.imageSrc !== false && (<img src={tx.imageSrc} />)}
                            {tx.videoId !== false && (
                                <a href={tx.videoSrc} target="_blank"><img src={`https://img.youtube.com/vi/${tx.videoId}/hqdefault.jpg`} /></a>
                            )}
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{tx.xecAmount} XEC</span>
                         </div>
                        </div>
                        <br />
                        </>
                       ),
                   )
                 : `No messages in this range of transactions.`}
             </>
           ) : <Skeleton count={10} />
         }
      </>
    );
}
