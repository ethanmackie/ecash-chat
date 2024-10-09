"use client";
import React, { useState, useEffect, useRef } from 'react';
import { appConfig } from '../config/app';
import { getTxHistory, txListener } from '../chronik/chronik';
import { chronik as chronikConfig } from '../config/chronik';
import { Search, UserRoundSearch } from "lucide-react"
import { ChronikClientNode } from 'chronik-client';
import cashaddr from 'ecashaddrjs';
import { isValidRecipient } from '../validation/validation';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { MagnifyingGlassIcon, ResetIcon, Link2Icon, Share1Icon, EyeNoneIcon } from "@radix-ui/react-icons";
import {
    DecryptionIcon,
    MoneyIcon,
    DefaultavatarIcon, 
    ReplieduseravatarIcon,
    Arrowright2Icon,
    IdCardIcon,
} from "@/components/ui/social";
import {
  encodeBip2XecTip,
  getPaginatedHistoryPage,
  getContactNameIfExist,
  RenderTipping,
  muteNewContact,
} from '../utils/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { HiInformationCircle } from "react-icons/hi";
import { Input } from "@/components/ui/input"
import { Popover, Alert, Modal } from "flowbite-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tweet } from 'react-tweet';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import {
    TwitterShareButton,
    TwitterIcon,
    FacebookShareButton,
    FacebookIcon,
    RedditShareButton,
    RedditIcon,
    TelegramShareButton,
    TelegramIcon,
} from 'next-share';
const crypto = require('crypto');
import copy from 'copy-to-clipboard';
import { toast } from 'react-toastify';
import { addNewContact } from '../utils/utils';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
const chronik = new ChronikClientNode(chronikConfig.urls);
import localforage from 'localforage';

export default function TxHistory({ address, isMobile }) {
    const [txHistory, setTxHistory] = useState(''); // current inbox history page
    const [fullTxHistory, setFullTxHistory] = useState(''); // full inbox history
    const [loadingMsg, setLoadingMsg] = useState('');
    const [txHistoryByAddress, setTxHistoryByAddress] = useState(false);
    const [addressToSearch, setAddressToSearch] = useState('');
    const [addressToSearchError, setAddressToSearchError] = useState(false);
    const [tipRecipient, setTipRecipient] = useState(false);
    const [tipRecipientAmount, setTipRecipientAmount] = useState(false);
    const [openDecryptionModal, setOpenDecryptionModal] = useState(false);
    const [decryptionInput, setDecryptionInput] = useState('');
    const [encryptedMessage, setEncryptedMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [maxPagesToShow, setMaxPagesToShow] = useState(7); // default 7 here
    const [contactList, setContactList] = useState('');
    const newContactNameInput = useRef('');
    const newReplierContactNameInput = useRef('');
    const [curateByContacts, setCurateByContacts] = useState(false);
    const [muteList, setMuteList] = useState('');

    useEffect(() => {
      const handleResize = () => {
          setMaxPagesToShow(window.innerWidth < 576 ? 5 : 7);
      };

      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
  }, []);

    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    useEffect(() => {
        // Render the first page by default upon initial load
        (async () => {
            await refreshContactList();
            await getTxHistoryByPage(0);
        })();
    }, [muteList]);

    const refreshContactList = async () => {
        let contactList = await localforage.getItem(appConfig.localContactsParam);
        setContactList(contactList);
    };

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
    const getTxHistoryByPage = async (
      pageNum = 0,
      localLookup = false,
      curateByContacts = false,
    ) => {
      if (
          typeof pageNum !== "number" ||
          chronik === undefined ||
          !cashaddr.isValidCashAddress(address, 'ecash')
      ) {
          return;
      }

      // Retrieve muted addresses
      let mutedList = await localforage.getItem(appConfig.localMuteParam);
      if (!Array.isArray(mutedList)) {
          mutedList = [];
      }

      if (localLookup) {
        // If the user opts to curate content by contacts only
        if (curateByContacts === true) {
          const contactOnlyInboxHistoryTxs = [];
          for (const tx of fullTxHistory.txs) {
              let txByContact = contactList.find(
                  contact => contact.address === tx.replyAddress,
              );
              // if a match was found
              if (typeof txByContact !== 'undefined') {
                contactOnlyInboxHistoryTxs.push(tx);
              }
          }
          fullTxHistory.txs = contactOnlyInboxHistoryTxs;
        }

        // Remove messages from muted users
        const totalTxlHistoryTxsInclMuted = [];
        for (const tx of fullTxHistory.txs) {
            let txByContact = mutedList.find(
                contact => contact.address === tx.replyAddress,
            );
            // if a match was not found
            if (typeof txByContact === 'undefined') {
                totalTxlHistoryTxsInclMuted.push(tx);
            }
        }
        fullTxHistory.txs = totalTxlHistoryTxsInclMuted;

        const selectedPageHistory = getPaginatedHistoryPage(
            fullTxHistory.txs,
            pageNum,
        );

        setTxHistory({
            txs: selectedPageHistory,
            numPages: fullTxHistory.numPages,
            replies: fullTxHistory.replies,
        });
      } else {
        const txHistoryResp = await getTxHistory(chronik, address, pageNum);
        if (txHistoryResp && Array.isArray(txHistoryResp.txs)) {
            const firstPageHistory = getPaginatedHistoryPage(
                txHistoryResp.txs,
                pageNum,
            );

            setTxHistory({
                txs: firstPageHistory,
                numPages: txHistoryResp.numPages,
                replies: txHistoryResp.replies,
            });
            setFullTxHistory(txHistoryResp);
        }
      }
    };

    // Handle the checkbox to curate posts from contacts only
    const handleCurateByContactsChange = async (newState) => {
      setCurateByContacts(newState);
      if (newState === true) {
          await refreshContactList();
          setCurrentPage(0);
          await getTxHistoryByPage(
              0,
              true, // filter on local cache only
              true, // flag for contact filter
          );
      } else {
          setCurrentPage(0);
          await getTxHistoryByPage(
              0,
              false, // filter on local cache only
              false,
          );
      }
    };

    // Validates the address being filtered for
    const handleAddressChange = e => {
      const { value } = e.target;
      setAddressToSearch(value);
  
      if (value.trim() === '') {
          setAddressToSearchError(false); 
      } else if (isValidRecipient(value) === true) {
          setAddressToSearchError(false); 
      } else if (value.length >= 10) { 
          setAddressToSearchError('Invalid eCash address');
      }
  };

    // Handles the input of the decryption key
    const handleDecryptionInput = e => {
        const { value } = e.target;
        // Future encryption algo selection checks here
        setDecryptionInput(value);
    };

    // Pass a message tx BIP21 query string to cashtab extensions
    const sendXecTip = (recipient, tipAmount) => {
        // Encode the op_return message script
        const opReturnRaw = encodeBip2XecTip();
        const bip21Str = `${recipient}?amount=${tipAmount}&op_return_raw=${opReturnRaw}`;

        if (isMobile) {
          window.open(
              `https://cashtab.com/#/send?bip21=${bip21Str}`,
              '_blank',
          );
        } else {
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
        }

        txListener(chronik, address, "XEC tip", getTxHistoryByPage);
    };

    // Decrypts the message using the provided key
    const decryptMessage = (messageToDecrypt) => {
        if (encryptedMessage === '') {
            return;
        }

        try {
            const decipher = crypto.createDecipher('aes-256-cbc', decryptionInput);
            let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
            decryptedMessage += decipher.final('utf8');
            toast(`Decrypted message: ${decryptedMessage}`);
        } catch (err) {
            toast(`Decryption error: ${err.message}`);
        }
        setEncryptedMessage('');
        setDecryptionInput('');
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
                     <div className="flex flex-col items-center mt-2" key={"txHistory"+index}>
                        <div className="flex flex-col w-full gap-2 max-w-xl break-words leading-1.5 p-5 sm:p-6 rounded-xl border bg-card text-card-foreground shadow dark:bg-gray-700 transition-transform transform">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-semibold text-gray-900 dark:text-white break-words">
                           <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {tx.replyAddress === address ? (
                                  <>
                                  <div className="flex items-center gap-2">
                                      {tx.senderAvatarLink === false ? (
                                        <DefaultavatarIcon/>
                                      ) : (
                                        <Avatar className="h-9 w-9">
                                        <AvatarImage src={tx.senderAvatarLink} alt="User Avatar" />
                                        <AvatarFallback>CN</AvatarFallback>
                                       </Avatar>
                                      )}
                                      <div className="font-medium dark:text-white">
                                          <div onClick={() => {
                                              copy(tx.replyAddress);
                                              toast(`${tx.replyAddress} copied to clipboard`);
                                          }}
                                          ><Badge className="leading-7 shadow-sm hover:bg-accent py-3px" variant="outline">
                                                 <span className="hidden sm:block">Your wallet</span>
                                                <span className="block sm:hidden">You</span>
                                            </Badge></div>
                                      </div>
                                  </div>
                                  </>
                              ) :
                                (<>
                                  <span>
                                  <div className="flex items-center gap-2">
                                      {tx.senderAvatarLink === false ? (
                                        <ReplieduseravatarIcon/>
                                      ) : (
                                        <Avatar className="h-9 w-9">
                                        <AvatarImage src={tx.senderAvatarLink} alt="User Avatar" />
                                        <AvatarFallback>CN</AvatarFallback>
                                       </Avatar>
                                      )}
                                      <div className="font-medium dark:text-white">
                                          <div onClick={() => {
                                              copy(tx.replyAddress);
                                              toast(`${tx.replyAddress} copied to clipboard`);
                                          }}>
                                        <Badge className="leading-7 shadow-sm hover:bg-accent py-3px" variant="outline">
                                             {getContactNameIfExist(tx.replyAddress, contactList)}
                                        </Badge>
                                          </div>

                                       
                                      </div>
                                     
                                    </div>
                                  </span>
                                </>)
                              }
                           </span>
                           <span className="sm:min-w-12"><Arrowright2Icon /> </span>
                           <span className="text-sm font-semibold text-gray-900 dark:text-white">
                               {tx.recipientAddress === address ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            {tx.receiverAvatarLink === false ? (
                                              <DefaultavatarIcon/>
                                            ) : (
                                              <Avatar className="h-9 w-9">
                                              <AvatarImage src={tx.receiverAvatarLink} alt="User Avatar" />
                                              <AvatarFallback>CN</AvatarFallback>
                                             </Avatar>
                                            )}
                                            <div className="font-medium dark:text-white"
                                                onClick={() => {
                                                   copy(tx.recipientAddress);
                                                   toast(`${tx.recipientAddress} copied to clipboard`);
                                                }}
                                            >
                                                <div>
                                                <Badge className="leading-7 shadow-sm hover:bg-accent py-3px" variant="outline">
                                                <span className="hidden sm:block">Your wallet</span>
                                                <span className="block sm:hidden">You</span>
                                              </Badge>
                                                  </div>
                                            </div>
                                        </div>
                                    </>
                               ) : tx.iseCashChatPost === true ? <Badge className="leading-7 shadow-sm hover:bg-accent py-3px" variant="outline">eCash Chat Townhall</Badge> :
                                   tx.authenticationTx === true ? <Badge className="leading-7 shadow-sm hover:bg-accent py-3px" variant="outline">eCash Chat Authenticator</Badge> :
                                 (<>
                                   <span>
                                   <div className="flex items-center gap-2">
                                       {tx.receiverAvatarLink === false ? (
                                          <ReplieduseravatarIcon/>
                                        ) : (
                                          <Avatar className="h-9 w-9">
                                          <AvatarImage src={tx.receiverAvatarLink} alt="User Avatar" />
                                          <AvatarFallback>CN</AvatarFallback>
                                         </Avatar>
                                        )}
                                       <div className="font-medium dark:text-white">
                                           <div onClick={() => {
                                               copy(tx.recipientAddress);
                                               toast(`${tx.recipientAddress} copied to clipboard`);
                                           }}>
                                            <Badge className="leading-7 shadow-sm hover:bg-accent py-3px" variant="outline">
                                            {getContactNameIfExist(tx.recipientAddress, contactList)}
                                           </Badge>
                                              
                                          </div>
                                       </div>
                                    
                                    </div>
                                   </span>
                                 </>)
                               }
                           </span>
                        </div>

                        {/* Render the op_return message */}
                        {tx.isEcashChatEncrypted ? (
                            <>
                                <Alert className="leading-7 my-4" color="failure" icon={HiInformationCircle}>
                                    &nbsp;&nbsp;<b>Encrypted Message</b><br />
                                    &nbsp;&nbsp;{tx.opReturnMessage ? `${tx.opReturnMessage}`.substring(0,40)+'...' : ' '}
                                </Alert>
                            </>
                            ) : (
                              <>
                              <div className={(tx.opReturnMessage.trim() && tx.opReturnMessage !== '\0') ? "my-2" : "hidden"}>
                              <p className="leading-7" key={index}>
                                  {(tx.opReturnMessage.trim() && tx.opReturnMessage !== '\0') ? tx.opReturnMessage : ' '}
                              </p>
                          </div>
                               
                                </>
                            )
                        }

                        {/* XEC Tip rendering */}
                        {tx.isXecTip && (
                          <Alert className="leading-7 my-2" color="success">
                              <div className="flex items-center space-x-2">
                                  <MoneyIcon className="h-5 w-5 text-blue-500" />
                                  <span>
                                      {tx.recipientAddress === address ? 
                                          `Received ${tx.xecAmount} XEC tip from eCash Chat` :
                                          `Sent ${tx.xecAmount} XEC tip via eCash Chat`
                                      }
                                  </span>
                              </div>
                          </Alert>
                      )}

                        {/* Render any media content within the message */}
                         {tx.nftShowcaseId !== false && tx.nftShowcaseId !== undefined && (
                                <Card className="max-w-md w-full mx-auto transition-shadow duration-300 ease-in-out hover:shadow-lg hover:bg-slate-50">
                                <CardHeader>
                                  <CardTitle>NFT Showcase</CardTitle>
                                  <CardDescription>
                               <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                                        <span onClick={() => {
                                            copy(tx.nftShowcaseId);
                                            toast(`${tx.nftShowcaseId} copied to clipboard`);
                                        }}>
                                            ID: {tx.nftShowcaseId.substring(0,15)}...{tx.nftShowcaseId.substring(tx.nftShowcaseId.length - 10)}
                                        </span>
                                        <a 
                                            href={`${appConfig.blockExplorerUrl}/tx/${tx.nftShowcaseId}`} 
                                            target="_blank" 
                                            className="ml-2 dark:text-white font-medium" 
                                        >
                                            <Link2Icon />
                                        </a>
                                    </div>
                                            Last sale price: N/A
                                        </CardDescription>
                                </CardHeader>
                                <CardContent>
                                <img src={`${appConfig.tokenIconsUrl}/256/${tx.nftShowcaseId}.png`} className="rounded-lg w-full object-cover"/>
                                </CardContent>
                                <CardFooter>
                                </CardFooter>
                              </Card>   
                )}
                        {tx.imageSrc !== false && (<img src={tx.imageSrc} className="rounded-lg w-full object-cover"/>)}
                        {tx.videoId !== false && (<LiteYouTubeEmbed id={tx.videoId} />)}
                        {tx.tweetId !== false && (<Tweet id={tx.tweetId} />)}
                        {tx.url !== false && (<Alert color="info"><a href={tx.url} target="_blank" >{tx.url}</a></Alert>)}

                        <div className="flex my-2 h-5 items-center space-x-4 text-sm text-muted-foreground">
                        <div>{tx.isCashtabMessage ? 'Cashtab Message' :
                                tx.iseCashChatMessage ? 'eCash Chat Message' :
                                    tx.iseCashChatPost ? 'eCash Townhall Post' :
                                        'External Message'
                            }</div>
                            <Separator orientation="vertical" />
                            <div>{tx.txDate}&nbsp;at&nbsp;{tx.txTime}</div>
                            <Separator orientation="vertical" />
                            <div>{tx.xecAmount} XEC</div>
                            </div>
                      
        

                        <div className="flex">
                            {/* Decryption and share buttons */}
                            <br />
                            {tx.isEcashChatEncrypted && (
                                <>
                                    {/* Decryption modal */}
                                    <Modal show={openDecryptionModal} onClose={() => {
                                            setOpenDecryptionModal(false)
                                            setDecryptionInput('')
                                        }}
                                    >
                                        <Modal.Header><div className="flex"><DecryptionIcon />&nbsp;Decrypt Message</div></Modal.Header>
                                        <Modal.Body>
                                            <div className="space-y-6">
                                              <p className="leading-7">
                                                  Please input the password used by the sender to decrypt this message.
                                              </p>
                                              <p>
                                                  <Alert>{tx.opReturnMessage}</Alert>
                                              </p>
                                              <p className="leading-7 ">
                                                  {/* Decryption input */}
                                                  <Input
                                                    id="decryptionKey"
                                                    name="decryptionKey"
                                                    type="text"
                                                    defaultValue={decryptionInput}
                                                    onBlur={e => handleDecryptionInput(e)}
                                                  />
                                                  <br />
                                                  <Button disabled={decryptionInput === ''} onClick={() => {
                                                      decryptMessage(tx.opReturnMessage)
                                                      setOpenDecryptionModal(false)
                                                  }} >
                                                      Decrypt
                                                  </Button>
                                              </p>
                                            </div>
                                        </Modal.Body>
                                    </Modal>
                                    <button type="button" onClick={() => {
                                        setEncryptedMessage(tx.opReturnMessage);
                                        setOpenDecryptionModal(true)
                                    }}>
                                        <DecryptionIcon />
                                    </button>
                                </>
                            )}

                            &nbsp;

                            <Popover
                              aria-labelledby="default-popover"
                              placement="top"
                              content={
                                <div className="w-30 text-sm text-gray-500 dark:text-gray-400">
                                  <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                                    <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Select Platform</h3>
                                  </div>
                                  <div className="px-3 py-2">
                                      <TwitterShareButton
                                        url={
                                            tx.imageSrc !== false ? tx.imageSrc
                                                : tx.videoId !== false ? `https://www.youtube.com/watch?v=${tx.videoId}`
                                                : tx.tweetId !== false ? `https://twitter.com/i/web/status/${tx.tweetId}`
                                                : 'https://ecashchat.com'
                                        }
                                        title={`[Shared from eCashChat.com] - ${tx.opReturnMessage}`}
                                      >
                                        <TwitterIcon size={25} round />
                                      </TwitterShareButton>
                                      &nbsp;
                                      <FacebookShareButton
                                        url={
                                            tx.imageSrc !== false ? tx.imageSrc
                                                : tx.videoId !== false ? `https://www.youtube.com/watch?v=${tx.videoId}`
                                                : tx.tweetId !== false ? `https://twitter.com/i/web/status/${tx.tweetId}`
                                                : 'https://ecashchat.com'
                                        }
                                        quote={`[Shared from eCashChat.com] - ${tx.opReturnMessage}`}
                                      >
                                        <FacebookIcon  size={25} round />
                                      </FacebookShareButton>
                                      &nbsp;
                                      <RedditShareButton
                                        url={
                                            tx.imageSrc !== false ? tx.imageSrc
                                                : tx.videoId !== false ? `https://www.youtube.com/watch?v=${tx.videoId}`
                                                : tx.tweetId !== false ? `https://twitter.com/i/web/status/${tx.tweetId}`
                                                : 'https://ecashchat.com'
                                        }
                                        title={`[Shared from eCashChat.com] - ${tx.opReturnMessage}`}
                                      >
                                        <RedditIcon size={25} round />
                                      </RedditShareButton>
                                      &nbsp;
                                      <TelegramShareButton
                                        url={
                                            tx.imageSrc !== false ? tx.imageSrc
                                                : tx.videoId !== false ? `https://www.youtube.com/watch?v=${tx.videoId}`
                                                : tx.tweetId !== false ? `https://twitter.com/i/web/status/${tx.tweetId}`
                                                : 'https://ecashchat.com'
                                        }
                                        title={`[Shared from eCashChat.com] - ${tx.opReturnMessage}`}
                                      >
                                        <TelegramIcon  size={25} round />
                                      </TelegramShareButton>
                                  </div>
                                </div>
                              }
                            >
                               <Button variant="outline" size="icon">
                               <Share1Icon className="h-4 w-4" />
                              </Button>
                           {/* one popover here only so the layout is cleaner */}
                            </Popover>
                            {(tx.replyAddress !== address || tx.recipientAddress !== address) && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Popover
                                aria-labelledby="default-popover"
                                placement="top"
                                content={
                                  <div className="w-120 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                                      <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">
                                        Input contact name for <br />
                                        {tx.replyAddress !== address ? tx.replyAddress : tx.recipientAddress}
                                      </h3>
                                    </div>
                                    <div className="px-3 py-2">
                                      <Input
                                        id="addContactName"
                                        name="addContactName"
                                        type="text"
                                        ref={newContactNameInput}
                                        placeholder="New contact name"
                                        className="bg-white"
                                        maxLength="30"
                                      />
                                      <Button
                                        type="button"
                                        disabled={newContactNameInput?.current?.value === ''}
                                        className="mt-2"
                                        onClick={async (e) => {
                                          const addressToAdd = tx.replyAddress !== address ? tx.replyAddress : tx.recipientAddress;
                                          await addNewContact(newContactNameInput?.current?.value, addressToAdd, refreshContactList);
                                        }}
                                      >
                                        Add Contact
                                      </Button>
                                    </div>
                                  </div>
                                }
                              >
                                <Button variant="outline" size="icon" className="ml-2">
                                  <IdCardIcon className="h-4 w-4" />
                                </Button>
                              </Popover>
                            </div>
                            
                          )}
                              <Button
                             variant="outline"
                             size="icon"
                             className="ml-2"
                             onClick={e => {
                              muteNewContact('Muted user', tx.replyAddress, setMuteList);
                                            }}
                              >
                             <EyeNoneIcon className="h-4 w-4" />
                            </Button>
                           <div className='ml-2'>
                              <RenderTipping
                              address={tx.recipientAddress === address ? tx.replyAddress : tx.recipientAddress}
                              sendXecTip={sendXecTip}
                            />
                              </div>
                        </div>
                     </div>
                    </div>
                    </>
                   ),
               )
             : `No messages in this range of transactions.`
       );
    }

    return (
         <>
         <div className="flex min-h-full flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:min-w-[576px] min-w-96">
         {txHistory && txHistory !== '' ? (
            <>

            {/*Set up pagination menu*/}
            <span>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          setCurrentPage((old) => Math.max(0, old - 1));
                          getTxHistoryByPage(Math.max(0, currentPage - 1), true, curateByContacts);
                        }}
                        disabled={currentPage === 0}
                      />
                    </PaginationItem>

                    {Array.from({ length: txHistory.numPages }, (_, i) => i)
                      .filter(i => {
                        if (txHistory.numPages <= maxPagesToShow) return true;
                        if (currentPage <= halfMaxPages) return i < maxPagesToShow;
                        if (currentPage >= txHistory.numPages - halfMaxPages) return i >= txHistory.numPages - maxPagesToShow;
                        return i >= currentPage - halfMaxPages && i <= currentPage + halfMaxPages;
                      })
                      .map(i => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              getTxHistoryByPage(i, true, curateByContacts);
                              setCurrentPage(i);
                            }}
                            isActive={currentPage === i}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((old) => Math.min(txHistory.numPages - 1, old + 1));
                          getTxHistoryByPage(Math.min(txHistory.numPages - 1, currentPage + 1), true, curateByContacts);
                        }}
                        disabled={currentPage === txHistory.numPages - 1}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
            </span>

              <div>
                <div className="max-w-xl mt-2 w-full mx-auto">
                  <div className="flex items-center space-x-2">

                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
                    <Input
                        id="address"
                        name="address"
                        type="search"
                        value={addressToSearch}
                        required
                        className="pl-8 bg-white"
                        placeholder="Search By Address"
                        onChange={handleAddressChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault(); 
                            getTxHistoryByAddress(); 
                          }
                        }}
                        onBlur={getTxHistoryByAddress} 
                      />
                  </div>

                  <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setTxHistoryByAddress('');
                        setAddressToSearch('');
                        setCurateByContacts(false); 
                        setAddressToSearchError(false);
                      }}
                    >
                      <ResetIcon className="h-4 w-4"/>
                    </Button>

                    <Toggle
                    variant="outline"
                    className="bg-white"
                    aria-label="Only show messages by your contacts"
                    pressed={curateByContacts}
                    onPressedChange={(state) => handleCurateByContactsChange(state)}
                  >
                    <UserRoundSearch className="h-4 w-4"/>
                  </Toggle>

                  
                  </div>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                      {addressToSearchError !== false && addressToSearchError}
                    </p>
                  </div>
              </div>
  
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
         </div>    
      </>
    );
}
