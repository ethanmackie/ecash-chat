"use client";
import { useState, useEffect } from 'react';
import { getTxHistory } from '../chronik/chronik';
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
import cashaddr from 'ecashaddrjs';
import { isValidRecipient } from '../validation/validation';
import { Skeleton } from "@/components/ui/skeleton"
import { encodeBip21Message } from '../utils/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover } from "flowbite-react";
import { Avatar } from "flowbite-react";
import { Tweet } from 'react-tweet';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
const chronik = new ChronikClientNode(chronikConfig.urls);

export default function TxHistory({ address }) {
    const [txHistory, setTxHistory] = useState('');
    const [loadingMsg, setLoadingMsg] = useState('');
    const [txHistoryByAddress, setTxHistoryByAddress] = useState(false);
    const [addressToSearch, setAddressToSearch] = useState('');
    const [addressToSearchError, setAddressToSearchError] = useState(false);
    const [tipRecipient, setTipRecipient] = useState(false);
    const [tipRecipientAmount, setTipRecipientAmount] = useState(false);
    
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
        if (txHistoryResp && Array.isArray(txHistoryResp.txs)) {
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

    // Pass a message tx BIP21 query string to cashtab extensions
    const sendXecTip = (recipient, tipAmount) => {
        // Encode the op_return message script
        const opReturnRaw = encodeBip21Message(`XEC tip from ${address}`);

        window.postMessage(
            {
                type: 'FROM_PAGE',
                text: 'Cashtab',
                txInfo: {
                    bip21: `${recipient}?amount=${tipAmount}&op_return_raw=${opReturnRaw}`,
                },
            },
            '*',
        );
    };

    // Exports the message history of this wallet.
    // If the history is filtered on a specific address, then the
    // exported history will filtered accordingly.
    const exportMessageHistory = () => {
        let latestTxHistory;

        if (
            Array.isArray(txHistoryByAddress) &&
            txHistoryByAddress.length > 0
        ) {
            latestTxHistory = { txs: txHistoryByAddress };
        } else {
            latestTxHistory = txHistory;
        }

        // convert object array into csv data
        let csvContent =
            'data:text/csv;charset=utf-8,' +
            latestTxHistory.txs.map(
                element => '\n'
                    + element.txDate + '|'
                    + element.txTime + '|'
                    + element.opReturnMessage + '|'
                    + element.xecAmount + '|'
            );

        // encode csv
        var encodedUri = encodeURI(csvContent);

        // hidden DOM node to set the default file name
        var csvLink = document.createElement('a');
        csvLink.setAttribute('href', encodedUri);
        csvLink.setAttribute(
            'download',
            'eCash_Chat_History.csv',
        );
        document.body.appendChild(csvLink);
        csvLink.click();
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
                     <div className="flex items-start gap-2.5" key={"txHistory"+index}>
                        <div className="flex flex-col w-full max-w-[550px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">

                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400">From: </span>
                           <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {tx.replyAddress === address ? (
                                  <Avatar size="xs">This Wallet</Avatar>
                              ) :
                                (<>
                                  <span>
                                  <Avatar size="xs">{tx.replyAddress.substring(0,10)} ... {tx.replyAddress.substring(tx.replyAddress.length - 5)}
                                  &nbsp;
                                  <Popover
                                    aria-labelledby="default-popover"
                                    content={
                                      <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                                          <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Select Tipping Amount</h3>
                                        </div>
                                        <div className="px-3 py-2">
                                            <button
                                              type="button"
                                              className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                              onClick={e => {
                                                  sendXecTip(tx.replyAddress, 100);
                                              }}
                                            >
                                              100
                                            </button>
                                            &nbsp;
                                            <button
                                              type="button"
                                              className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                              onClick={e => {
                                                  sendXecTip(tx.replyAddress, 1000);
                                              }}
                                            >
                                              1k
                                            </button>
                                            &nbsp;
                                            <button
                                              type="button"
                                              className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                              onClick={e => {
                                                  sendXecTip(tx.replyAddress, 10000);
                                              }}
                                            >
                                              10k
                                            </button>
                                            &nbsp;
                                            <button
                                              type="button"
                                              className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                              onClick={e => {
                                                  sendXecTip(tx.replyAddress, 100000);
                                              }}
                                            >
                                              100k
                                            </button>
                                            &nbsp;
                                            <button
                                              type="button"
                                              className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                              onClick={e => {
                                                  sendXecTip(tx.replyAddress, 1000000);
                                              }}
                                            >
                                              1M
                                            </button>
                                        </div>
                                      </div>
                                    }
                                  >
                                    <button
                                        type="button"
                                        className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                    >
                                        Tip XEC
                                    </button>
                                  </Popover>
                                  </Avatar>
                                  </span>
                                </>)
                              }
                           </span>
                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400">To: </span>
                           <span className="text-sm font-semibold text-gray-900 dark:text-white">
                               {tx.recipientAddress === address ? (
                                   <Avatar size="xs">This Wallet</Avatar>
                               ) :
                                 (<>
                                   <span>
                                   <Avatar size="xs">{tx.recipientAddress.substring(0,10)} ... {tx.recipientAddress.substring(tx.recipientAddress.length - 5)}
                                   &nbsp;
                                   <Popover
                                     aria-labelledby="default-popover"
                                     content={
                                       <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
                                         <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                                           <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Select Tipping Amount</h3>
                                         </div>
                                         <div className="px-3 py-2">
                                             <button
                                               type="button"
                                               className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                               onClick={e => {
                                                   sendXecTip(tx.recipientAddress, 100);
                                               }}
                                             >
                                               100
                                             </button>
                                             &nbsp;
                                             <button
                                               type="button"
                                               className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                               onClick={e => {
                                                   sendXecTip(tx.recipientAddress, 1000);
                                               }}
                                             >
                                               1k
                                             </button>
                                             &nbsp;
                                             <button
                                               type="button"
                                               className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                               onClick={e => {
                                                   sendXecTip(tx.recipientAddress, 10000);
                                               }}
                                             >
                                               10k
                                             </button>
                                             &nbsp;
                                             <button
                                               type="button"
                                               className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                               onClick={e => {
                                                   sendXecTip(tx.recipientAddress, 100000);
                                               }}
                                             >
                                               100k
                                             </button>
                                             &nbsp;
                                             <button
                                               type="button"
                                               className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                               onClick={e => {
                                                   sendXecTip(tx.recipientAddress, 1000000);
                                               }}
                                             >
                                               1M
                                             </button>
                                         </div>
                                       </div>
                                     }
                                   >
                                     <button
                                         type="button"
                                         className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                     >
                                         Tip XEC
                                     </button>
                                   </Popover>
                                   </Avatar>
                                   </span>
                                 </>)
                               }
                           </span>
                        </div>
                        <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white" key={index}>{tx.opReturnMessage ? `${tx.opReturnMessage}` : ' '}</p>
                        {tx.imageSrc !== false && (<img src={tx.imageSrc} />)}
                        {tx.videoId !== false && (<LiteYouTubeEmbed id={tx.videoId} />)}
                        {tx.tweetId !== false && (<Tweet id={tx.tweetId} />)}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{tx.xecAmount} XEC</span>
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          {tx.isCashtabMessage ? 'Cashtab Message' :
                              tx.iseCashChatMessage ? 'eCash Chat Message' :
                                  'External Message'
                          }
                          &nbsp;|&nbsp;{tx.txDate}&nbsp;at&nbsp;{tx.txTime}
                      </span>
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
                           <li key={"Page"+i}>
                             <a href={"#"} onClick={() => getTxHistoryByPage(i)} className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
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
                     value={addressToSearch}
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
                       setAddressToSearch('');
                       getTxHistoryByPage(0);
                   }}
                 >
                   Reset
                 </button>

                 <button
                     type="button"
                     className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                     onClick={() => exportMessageHistory()}
                 >
                   Export Message History
                 </button>
              </div>
             </form>

             <RenderTxHistory />
             </>
           ) : 
           <div className="flex flex-col space-y-3">
           <div className="space-y-2">
             <Skeleton className="h-4 w-[400px]" />
             <Skeleton className="h-4 w-[350px]" />
             <Skeleton className="h-4 w-[300px]" />
           </div>
         </div>
         }
      </>
    );
}
