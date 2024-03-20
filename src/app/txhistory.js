"use client";
import { useState, useEffect } from 'react';
import { getTxHistory } from '../chronik/chronik';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
import cashaddr from 'ecashaddrjs';
import { isValidRecipient } from '../validation/validation';

const chronik = new ChronikClientNode(chronikConfig.urls);

export default function TxHistory({ address }) {
    const [txHistory, setTxHistory] = useState('');
    const [loadingMsg, setLoadingMsg] = useState('');
    const [txHistoryByAddress, setTxHistoryByAddress] = useState(false);
    const [addressToSearch, setAddressToSearch] = useState(null);
    const [addressToSearchError, setAddressToSearchError] = useState(false);
    
    useEffect(() => {
        // Render the first page by default upon initial load
        (async () => {
            await getTxHistoryByPage(0);
        })();
    }, []);

    // Filters txHistory for txs where the address matches either the sender or receiver outputs
    const getTxHistoryByAddress = () => {
        if (
            Array.isArray(txHistory.txs) &&
            txHistory.txs.length > 0
        ) {
            const filteredTxHistory = [];
            for (const tx of txHistory.txs) {
                // Add this tx if this address was the sender or receiver
                if (
                    tx.replyAddress === addressToSearch ||
                    tx.recipientAddress === addressToSearch
                ) {
                    filteredTxHistory.push(tx);
                }
            }
            setTxHistoryByAddress(filteredTxHistory);
        }
    };

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

    // Validates the address being filtered for
    const handleAddressChange = e => {
        const { value } = e.target;
        if (
            isValidRecipient(value) === true &&
            value.trim() !== ''
        ) {
            setAddressToSearch(value);
            setAddressToSearchError(false);
        } else {
            setAddressToSearchError('Invalid eCash address');
        }
    };

    // Renders the tx history based on whether a filter has been applied based on address
    const RenderTxHistory = () => {
      let latestTxHistory;

      if (
          Array.isArray(txHistoryByAddress) &&
          txHistoryByAddress.length > 0
      ) {
          latestTxHistory = { txs: txHistoryByAddress };
      } else {
          latestTxHistory = txHistory;
      }

       return (
         latestTxHistory &&
           latestTxHistory.txs &&
             latestTxHistory.txs.length > 0
             ? latestTxHistory.txs.map(
                   (tx, index) => (
                     <>
                     <div className="flex items-start gap-2.5">
                        <div className="flex flex-col w-full max-w-[550px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">

                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400">From: </span>
                           <span className="text-sm font-semibold text-gray-900 dark:text-white">{tx.replyAddress.substring(0,10)} ... {tx.replyAddress.substring(tx.replyAddress.length - 5)}</span>
                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400">To: </span>
                           <span className="text-sm font-semibold text-gray-900 dark:text-white">{tx.recipientAddress.substring(0,10)} ... {tx.recipientAddress.substring(tx.recipientAddress.length - 5)}</span>
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
             : `No messages in this range of transactions.`
       );
    }

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
             {/*Filter tx history by address*/}
             {txHistoryByAddress &&
                txHistoryByAddress.length > 0
                    && txHistoryByAddress.map(
                        (tx, index) => (
                            console.log(`tx for address ${addressToSearch}: `, tx),
                        ),
                    )}
             <form className="space-y-6" action="#" method="POST">
               <div>
                 <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                   Search By Address
                 </label>

                 <div className="mt-2">
                   <input
                     id="address"
                     name="address"
                     type="text"
                     required
                     className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                     onChange={e => handleAddressChange(e)}
                   />
                 </div>
                 <p className="mt-2 text-sm text-red-600 dark:text-red-500">{addressToSearchError !== false && addressToSearchError}</p>

                 <button
                   type="button"
                   disabled={addressToSearchError}
                   className="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                   onClick={e => {
                       getTxHistoryByAddress(e);
                   }}
                 >
                   Search
                 </button>

                 <button
                   type="button"
                   className="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                   onClick={() => {
                       setTxHistoryByAddress('');
                       getTxHistoryByPage(0);
                   }}
                 >
                   Reset
                 </button>

              </div>
             </form>

             <RenderTxHistory />
             </>
           ) : <Skeleton count={10} />
         }
      </>
    );
}
