"use client";
import "./globals.css";
import React, { useState, useEffect } from 'react';
import { appConfig } from '../config/app';
import { opReturn as opreturnConfig } from '../config/opreturn';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tooltip, Popover, Modal } from "flowbite-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MagnifyingGlassIcon, ResetIcon, Share1Icon, ReloadIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { ImDownload3 } from "react-icons/im";
import { RiSave3Fill } from "react-icons/ri";
import {
    SendIcon,
    LogoutIcon,
    EncryptionIcon,
    UnlockIcon,
} from "@/components/ui/social";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
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
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Label } from "@/components/ui/label";
import {
    getArticleHistory,
    getReplyTxDetails,
    parseChronikTx,
    getArticleListing,
    txListener,
    articleTxListener,
    paywallTxListener,
} from '../chronik/chronik';
import {
    encodeBip21Article,
    encodeBip2XecTip,
    encodeBip21ReplyArticle,
    encodeBip21PaywallPayment,
} from '../utils/utils';
import { CrossIcon, AnonAvatar, ShareIcon, ReplyIcon, EmojiIcon, YoutubeIcon, AlitacoffeeIcon, DefaultavatarIcon, ReplieduseravatarIcon } from "@/components/ui/social";
import { toast } from 'react-toastify';
import { BiSolidNews } from "react-icons/bi";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { isValidRecipient } from '../validation/validation';
import { Badge } from "@/components/ui/badge";
import { kv } from '@vercel/kv';
import localforage from 'localforage';
import copy from 'copy-to-clipboard';
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from 'dompurify';
import MarkdownEditor from '@uiw/react-markdown-editor';
import { getStackArray } from 'ecash-script';

export default function Article( { chronik, address, isMobile, sharedArticleTxid } ) {
    const [articleHistory, setArticleHistory] = useState('');
    const [articleTitle, setArticleTitle] = useState(''); // title of the article being drafted
    const [article, setArticle] = useState(''); // the article being drafted
    const [articleCategory, setArticleCategory] = useState(''); // category of the article being drafted
    const [disableArticleReplies, setDisableArticleReplies] = useState(false);
    const [currentArticleTxObj, setCurrentArticleTxObj] = useState(false); // the tx object containing the full article / tx being viewed
    const [articleError, setArticleError] = useState(false);
    const [replyArticle, setReplyArticle] = useState('');
    const [replyArticleError, setReplyArticleError] = useState(false);
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [showPaywallPaymentModal, setShowPaywallPaymentModal] = useState(false);
    const [paywallAmountXec, setPaywallAmountXec] = useState('');
    const [paywallAmountXecError, setPaywallAmountXecError] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [maxPagesToShow, setMaxPagesToShow] = useState(7);
    const [addressToSearch, setAddressToSearch] = useState('');
    const [addressToSearchError, setAddressToSearchError] = useState(false);
    const [txHistoryByAddress, setTxHistoryByAddress] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setMaxPagesToShow(window.innerWidth < 430 ? 3 : 7);
        };
  
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
  
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            // Render the first page by default upon initial load
            let localArticleHistoryResp = await getArticleHistoryByPage(0);

            // If this app was triggered by a shared article link
            if (sharedArticleTxid !== false) {
                let articleTx;
                let articleHash;

                // Retrieve article hash from txid
                try {
                    articleTx = await chronik.tx(sharedArticleTxid);
                    const stackArray = getStackArray(articleTx.outputs[0].outputScript);

                    if (
                        stackArray[0] === opreturnConfig.articlePrefixHex
                    ) {
                        articleHash = Buffer.from(stackArray[1], 'hex');
                    } else {
                        throw new Error('Invalid article txid');
                    }
                } catch (err) {
                    console.log(`Error retrieving tx details for ${sharedArticleTxid}`, err);
                    toast(err.message);
                }

                // Retrieve full artcle info via content hash
                const latestArticles = await getArticleListing();
                const sharedArticleObject = latestArticles.find((article) => { return article.hash == articleHash; });
                if (sharedArticleObject) {
                    // Update the article object for rendering modal
                    articleTx = parseChronikTx(articleTx, address);
                    articleTx.articleObject = sharedArticleObject;
                    setCurrentArticleTxObj(articleTx);

                    if (sharedArticleObject.paywallPrice > 0) {
                        // If this article exists, and is a paywalled article, check paywall payment and render accordingly
                        handlePaywallStatus(
                            sharedArticleTxid,
                            sharedArticleObject.paywallPrice,
                            localArticleHistoryResp,
                        );
                    } else {
                        // If this article exists as a non-paywalled article, render directly
                        setShowArticleModal(true);
                    }
                } else {
                    toast('No article found for this article txid');
                }
            }
            setIsLoading(false);
        })();
        initializeArticleRefresh();
    }, []);

    /**
     * Set an interval to trigger regular article list refresh
     * @returns callback function to cleanup interval
     */
    const initializeArticleRefresh = async () => {
        const intervalId = setInterval(async function () {
            await getArticleHistoryByPage(0);
        }, appConfig.articleRefreshInterval);
        // Clear the interval when page unmounts
        return () => clearInterval(intervalId);
    };

    // Retrieves the article listing
    const getArticleHistoryByPage = async (page) => {
        if (
            typeof page !== "number" ||
            chronik === undefined
        ) {
            return;
        }
        const txHistoryResp = await getArticleHistory(chronik, appConfig.townhallAddress, page);
        if (txHistoryResp && Array.isArray(txHistoryResp.txs)) {
            setArticleHistory(txHistoryResp);
        }
        return txHistoryResp;
    };

    // Pass an article tx BIP21 query string to cashtab extensions
    const sendArticle = async () => {
        const crypto = require('crypto');
        const articleHash = crypto.createHash('sha1').update(article).digest('hex');

        // Encode the op_return article script
        const opReturnRaw = encodeBip21Article(articleHash);
        const bip21Str = `${address}?amount=${appConfig.dustXec}&op_return_raw=${opReturnRaw}`;

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
                        bip21: `${bip21Str}`,
                    },
                },
                '*',
            );
        }

        const articleObject = {
            hash: articleHash,
            title: articleTitle,
            content: article,
            category: articleCategory,
            paywallPrice: paywallAmountXec,
            disbleReplies: disableArticleReplies,
            date: Date.now(),
        };

        // if this article hash already exists, return with error toast
        let updatedArticles = await localforage.getItem(appConfig.localArticlesParam);
        let isDuplicateArticle = updatedArticles.some(function(thisArticle) {
            return articleHash === thisArticle.hash;
        });
        if (isDuplicateArticle) {
            toast('This article already exists.');
            return;
        }
        updatedArticles.push(articleObject);

        setArticle('');
        setArticleTitle('');
        articleTxListener(chronik, address, kv, updatedArticles, getArticleHistoryByPage);
    };

    // Pass a reply to article tx BIP21 query string to cashtab extensions
    const replytoArticle = (replyTxid, replyMsg) => {
        // Encode the op_return message script
        const opReturnRaw = encodeBip21ReplyArticle(replyMsg, replyTxid);
        const bip21Str = `${address}?amount=${appConfig.dustXec}&op_return_raw=${opReturnRaw}`;

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
                        bip21: `${bip21Str}`,
                    },
                },
                '*',
            );
        }
        setReplyArticle('');
        txListener(chronik, address, "Article reply", appConfig.dustXec, address, getArticleHistoryByPage);
    };

    // Pass a XEC tip tx BIP21 query string to cashtab extensions
    const sendXecTip = (recipient, tipAmount) => {
        // Encode the op_return message script
        const opReturnRaw = encodeBip2XecTip();
        const bip21Str = `${recipient}?amount=${tipAmount}&op_return_raw=${opReturnRaw}`;

        if (isMobile) {
            window.open(
                `https://cashtab.com/#/send?bip21=${bip21Str}`,
                '_blank',
            );
        }

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

        txListener(chronik, address, "Article XEC tip", tipAmount, recipient, getArticleHistoryByPage);
    };

    // Pass a paywall payment tx BIP21 query string to cashtab extensions
    const sendPaywallPayment = (recipient, articleTxid, paywallPrice) => {
        // Encode the op_return message script
        const opReturnRaw = encodeBip21PaywallPayment(articleTxid);
        const bip21Str = `${recipient}?amount=${paywallPrice}&op_return_raw=${opReturnRaw}`;

        if (isMobile) {
            window.open(
                `https://cashtab.com/#/send?bip21=${bip21Str}`,
                '_blank',
            );
        }

        window.postMessage(
            {
                type: 'FROM_PAGE',
                text: 'Cashtab',
                txInfo: {
                    bip21: `${recipient}?amount=${paywallPrice}&op_return_raw=${opReturnRaw}`,
                },
            },
            '*',
        );
        paywallTxListener(
            chronik,
            address,
            "Paywall payment",
            paywallPrice,
            recipient,
            getArticleHistoryByPage,
            setShowArticleModal,
            setShowPaywallPaymentModal,
        );
    };

    // Lookup and render any corresponding replies
    const RenderReplies = ( { txid, replies } ) => {
        const foundReplies = replies.filter(replyTx => replyTx.articleTxid === txid);
        // If this article (i.e. txid) has no reply, don't bother rendering a reply component
        if (foundReplies.length === 0) {
            return;
        }

        return (
            foundReplies.map(
                (foundReply, index) => (
                    <>
                    <div className="flex flex-col break-words space-y-1.5 gap-2 mt-2 w-full leading-1.5 p-6 rounded-xl bg-card text-card-foreground shadow dark:bg-gray-700 transition-transform transform">
                        <div className="flex justify-between items-center w-full" key={"article"+index}>
                            <div className="flex items-center gap-2">
                                <ReplieduseravatarIcon/>
                                <div className="font-medium dark:text-white" onClick={() => {
                                    copy(foundReply.replyAddress);
                                    toast(`${foundReply.replyAddress} copied to clipboard`);
                                }}>
                                    <Badge className="leading-7 [&:not(:first-child)]:mt-6 py-3px" variant="outline">
                                        {foundReply.replyAddress.substring(0,10) + '...' + foundReply.replyAddress.substring(foundReply.replyAddress.length - 5)}
                                    </Badge>
                                </div>
                                <RenderTipping address={foundReply.replyAddress} />
                            </div>
                        </div>
                        <div className="py-2 leading-7">
                            {foundReply.opReturnMessage}
                        </div>
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            {foundReply.txDate}&nbsp;at&nbsp;{foundReply.txTime}
                        </span>
                    </div>
                    </>
                )
            )
        );
    };

    // Render the full article contents
    const RenderArticle = ({ content }) => {
        const renderedArticle = DOMPurify.sanitize(content);
        return (<MarkdownEditor.Markdown style={{ backgroundColor: 'transparent' }}  source={renderedArticle} />);
    };

    // Validate the paywall price input
    const handlePaywallAmountChange = e => {
        const { value } = e.target;
        if (value >= appConfig.dustXec || value === '') {
            setPaywallAmountXecError(false);
        } else {
            setPaywallAmountXecError(`Paywall amount must be at minimum ${appConfig.dustXec} XEC`);
        }
        setPaywallAmountXec(value);
    };

    // Validates the author address being filtered for
    const handleAddressChange = e => {
        const { value } = e.target;
        if (
            isValidRecipient(value) === true &&
            value.trim() !== ''
        ) {
            setAddressToSearchError(false);
        } else {
            setAddressToSearchError('Invalid eCash address');
        }
        setAddressToSearch(value);
    };

   // Filters articleHistory for txs where the author address matches
   const getTxHistoryByAddress = () => {
        if (
            Array.isArray(articleHistory.txs) &&
            articleHistory.txs.length > 0
        ) {
            const filteredArticleHistory = [];
            for (const tx of articleHistory.txs) {
                if (
                    tx.replyAddress === addressToSearch
                ) {
                    filteredArticleHistory.push(tx);
                }
            }
            setTxHistoryByAddress(filteredArticleHistory);
        }
    };

    // Saves the current article draft into local storage
    const savedDraftArticleToLocalStorage = async () => {
        try {
            await localforage.setItem('draftArticle', article);
            toast('Draft article saved');
        } catch (err) {
            toast('Failed to save draft article to local storage');
        }
    };

    // Loads the article draft from local storage
    const loadDraftArticleFromLocalStorage = async () => {
        try {
            const draftArticle = await localforage.getItem('draftArticle');
            if (draftArticle) {
                setArticle(draftArticle);
                toast('Draft article loaded');
            }
        } catch (err) {
            toast('Failed to load draft article from local storage');
        }
    };

    // Check whether the paywall price for the article has been paid by this address
    const checkPaywallPayment = (paywalledArticleTxId, paywallPrice, localArticleHistoryResp = false) => {
        let paywallPaid = false;
        let localArticleHistory = articleHistory;
        if (localArticleHistoryResp) {
            localArticleHistory = localArticleHistoryResp;
        }
    
        for (const thisPaywallPayment of localArticleHistory.paywallTxs) {
            if (
                thisPaywallPayment.paywallPaymentArticleTxid === paywalledArticleTxId &&
                thisPaywallPayment.replyAddress === address &&
                parseInt(thisPaywallPayment.paywallPayment) === parseInt(paywallPrice)
            ) {
                paywallPaid = true;
                break;
            }
        }

        return paywallPaid;
    };

    // Conditionally renders the appropriate modal based on paywall payment status
    const handlePaywallStatus = (paywalledArticleTxId, paywallPrice, localArticleHistoryResp = false) => {
        const paywallPaid = checkPaywallPayment(paywalledArticleTxId, paywallPrice, localArticleHistoryResp );
        console.log('Paid paywall fee? ', paywallPaid);
        if (paywallPaid) {
            setShowArticleModal(true);
        } else {
            setShowPaywallPaymentModal(true);
        }
    };

    // Render the tipping button popover
    const RenderTipping = ( { address } ) => {
        return (
            <>
            {/* Tip XEC options */}
            <Popover
              aria-labelledby="default-popover"
              content={
                <div className="w-50 text-sm text-gray-500 dark:text-gray-400">
                  <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                    <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Select Tipping Amount</h3>
                  </div>
                  <div className="px-3 py-4">
                      <Button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-300"
                        onClick={e => {
                            sendXecTip(address, 100);
                        }}
                      >
                        100
                      </Button>
                      &nbsp;
                      <Button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-300"
                        onClick={e => {
                            sendXecTip(address, 1000);
                        }}
                      >
                        1k
                      </Button>
                      &nbsp;
                      <Button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-300"
                        onClick={e => {
                            sendXecTip(address, 10000);
                        }}
                      >
                        10k
                      </Button>
                      &nbsp;
                      <Button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-300"
                        onClick={e => {
                            sendXecTip(address, 100000);
                        }}
                      >
                        100k
                      </Button>
                      &nbsp;
                      <Button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-300"
                        onClick={e => {
                            sendXecTip(address, 1000000);
                        }}
                      >
                        1M
                      </Button>
                  </div>
                </div>
              }
              >
                <Button
                    type="button"
                    variant="outline" 
                    size="icon"
                >
                   <AlitacoffeeIcon />
                </Button>
              </Popover>
            </>
        );
    };

    const PaywallPaymentModal = () => {
        return (
            <Modal show={showPaywallPaymentModal} onClose={() => setShowPaywallPaymentModal(false)}>
                <Modal.Header>{currentArticleTxObj.articleObject.title}</Modal.Header>
                <Modal.Body>
                    This article costs a one-off {currentArticleTxObj.articleObject.paywallPrice} XEC to access.<br />
                    <br />
                    <Button disabled>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Awaiting payment
                </Button>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex gap-5">
                        <Button onClick={() => sendPaywallPayment(
                            currentArticleTxObj.replyAddress,
                            currentArticleTxObj.txid,
                            currentArticleTxObj.articleObject.paywallPrice)
                        }>
                            Pay
                        </Button>
                        <Button onClick={() => setShowPaywallPaymentModal(false)}>
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    };

    const FullArticleModal = () => {
        return (
            <Modal show={showArticleModal} onClose={() => setShowArticleModal(false)}  className="bg-background/90">
                <div className="shadow-xl border rounded-lg">
                <Modal.Header>{currentArticleTxObj.articleObject.title}</Modal.Header>
                <Modal.Body>
                    {/* Article content */}
                    <div className="space-y-2 flex flex-col max-w-xl gap-2 break-words w-full leading-1.5 p-6">
                        <time dateTime={currentArticleTxObj.txTime} className="text-gray-500">
                            By: {currentArticleTxObj.replyAddress}<br />
                            {currentArticleTxObj.txDate}
                        </time>
                        <RenderArticle content={currentArticleTxObj.articleObject.content} />
                    </div>
                    {/* Render corresponding replies for this article, ignore if disablReplies is set to true */}
                    {currentArticleTxObj.articleObject.disbleReplies !== true && (
                        <div><RenderReplies txid={currentArticleTxObj.txid} replies={articleHistory.replies} /></div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex flex-col items-start space-x-0 space-y-2 rounded-b border-gray-200 p-6 dark:border-gray-600 border-t">
                    <div className="flex gap-2">
                        {/* Tipping action to an article */}
                        <RenderTipping address={currentArticleTxObj.replyAddress} />

                        {/* Sharing options */}
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
                                        url={`https://${window.location.host}/?sharedArticleTxid=${currentArticleTxObj.txid}`}
                                        title={`[Shared from eCashChat.com] - "${currentArticleTxObj.articleObject.title}"`}
                                    >
                                    <TwitterIcon size={25} round />
                                    </TwitterShareButton>
                                    &nbsp;
                                    <FacebookShareButton
                                        url={`https://${window.location.host}/?sharedArticleTxid=${currentArticleTxObj.txid}`}
                                        quote={`[Shared from eCashChat.com] - "${currentArticleTxObj.articleObject.title}"`}
                                    >
                                    <FacebookIcon  size={25} round />
                                    </FacebookShareButton>
                                    &nbsp;
                                    <RedditShareButton
                                        url={`https://${window.location.host}/?sharedArticleTxid=${currentArticleTxObj.txid}`}
                                        title={`[Shared from eCashChat.com] - "${currentArticleTxObj.articleObject.title}"`}
                                    >
                                    <RedditIcon size={25} round />
                                    </RedditShareButton>
                                    &nbsp;
                                    <TelegramShareButton
                                        url={`https://${window.location.host}/?sharedArticleTxid=${currentArticleTxObj.txid}`}
                                        title={`[Shared from eCashChat.com] - "${currentArticleTxObj.articleObject.title}"`}
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
                        </Popover>
                        {/* Reply action to an article, disable if disableReplies is set to true */}
                        {currentArticleTxObj.articleObject.disbleReplies !== true && (
                            <div className="w-120 text-sm text-gray-500 dark:text-gray-400">
                                <Badge className="leading-7 shadow-sm py-3px" variant="outline">Reply to article ...{currentArticleTxObj.txid.slice(-10)}</Badge>
                            </div>
                        )}
                       
                    </div>

                    {currentArticleTxObj.articleObject.disbleReplies !== true && (
                    <div className="w-full ml-0">
                                    {/* Reply input field */}
                                    <Textarea
                                        id="reply-post"
                                        defaultValue={replyArticle}
                                        placeholder="Post your reply..."
                                        className="bg-gray-50"
                                        onBlur={e => setReplyArticle(e.target.value)}
                                        maxLength={opreturnConfig.articleReplyByteLimit}
                                        rows={4}
                                    />
                                    <Button
                                        type="button"
                                        className="bg-blue-500 mt-2 hover:bg-blue-300"
                                        disabled={replyArticle === ''}
                                        onClick={e => {
                                            replytoArticle(currentArticleTxObj.txid, replyArticle)
                                        }}
                                    >
                                        Post Reply
                                    </Button>
                                    <Button 
                                    className="ml-2"
                                    variant="ghost" onClick={() => setShowArticleModal(false)}>
                                    Close
                                </Button>
                                </div>
                                )}
                </Modal.Footer>
                </div>
            </Modal>
        );
    };

    const RenderArticleListing = () => {
        let latestArticleHistory;

        if (
            Array.isArray(txHistoryByAddress) &&
            txHistoryByAddress.length > 0
        ) {
            latestArticleHistory = { txs: txHistoryByAddress };
        } else {
            latestArticleHistory = articleHistory;
        }

        if (isLoading) {
            return (
                <div className="max-w-xl w-full mx-auto">
                    <Skeleton className="h-4 mt-2 w-full" />
                    <Skeleton className="h-4 mt-2 w-2/3" />
                    <Skeleton className="h-4 mt-2 w-1/2" />
                </div>
            );
        }

        return (
                    <div className="max-w-xl w-full mx-auto">
                    {latestArticleHistory &&
                    latestArticleHistory.txs &&
                    latestArticleHistory.txs.length > 0 ? (
                    latestArticleHistory.txs.map((tx, index) => (
                        tx.articleObject && (
                        <a
                            key={index}
                            href="#"
                            onClick={(e) => {
                            e.preventDefault();
                            setCurrentArticleTxObj(tx);
                            if (tx.articleObject.paywallPrice > 0) {
                                handlePaywallStatus(tx.txid, tx.articleObject.paywallPrice);
                            } else {
                                setShowArticleModal(true);
                            }
                            }}
                        >
                            <Card className="max-w-xl w-full mt-2">
                            <CardHeader>
                                <div className="flex items-center gap-x-4 text-xs">
                                <time dateTime={tx.txTime} className="text-gray-500">
                                    {tx.txDate}
                                </time>
                                <Badge variant="secondary">
                                    {tx.articleObject.category || 'General'}
                                </Badge>
                                </div>
                                <CardTitle>
                                {tx.articleObject.title}
                                </CardTitle>
                                <CardDescription></CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                        {tx.articleObject.paywallPrice > 0 && !checkPaywallPayment(tx.txid, tx.articleObject.paywallPrice) && (
                            <Alert
                            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-auto z-10 flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/5"
                            >
                            <AlertDescription className="flex items-center justify-center">
                                <EncryptionIcon />
                                This article costs {tx.articleObject.paywallPrice} XEC to view
                            </AlertDescription>
                            </Alert>
                        )}
                        <p
                            className={`mt-0 line-clamp-3 text-sm leading-6 text-gray-600 break-words max-h-80 ${
                            tx.articleObject.paywallPrice > 0 && !checkPaywallPayment(tx.txid, tx.articleObject.paywallPrice) ? 'blur-sm pt-6' : ''
                            }`}
                        >
                            {tx.articleObject.paywallPrice > 0 && !checkPaywallPayment(tx.txid, tx.articleObject.paywallPrice) ? (
                            <>
                                <Skeleton className="h-4 mt-2 w-full" />
                                <Skeleton className="h-4 mt-2 w-2/3" />
                                <Skeleton className="h-4 mt-2 w-1/2" />
                            </>
                            ) : (
                            <RenderArticle content={tx.articleObject.content} />
                            )}
                        </p>
                        </CardContent>
                            <CardFooter>
                                <div className="relative mt-2 flex items-center gap-x-4">
                                <DefaultavatarIcon className="h-10 w-10 rounded-full bg-gray-50" />
                                <div className="text-sm leading-6">
                                    <p className="font-semibold text-gray-900">
                                    <Badge variant="outline" className="py-3px">
                                        <div
                                        className="leading-7 [&:not(:first-child)]:mt-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copy(tx.replyAddress);
                                            toast(`${tx.replyAddress} copied to clipboard`);
                                        }}
                                        >
                                        {tx.replyAddress.substring(0, 10)}...
                                        {tx.replyAddress.substring(tx.replyAddress.length - 5)}
                                        </div>
                                    </Badge>
                                    </p>
                                </div>
                                  {tx.articleObject.paywallPrice > 0 && checkPaywallPayment(tx.txid, tx.articleObject.paywallPrice) && (
                                     <UnlockIcon />
                                  )}
                                </div>
                            </CardFooter>
                            </Card>
                        </a>
                        )
                    ))
                    ) : (
                    ''
                    )}
                </div>
                        );
                    };

    return (
        <>
         <div className="flex min-h-full flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:min-w-[576px]">
            {showArticleModal && (
                <FullArticleModal />
            )}

            {showPaywallPaymentModal && (
                <PaywallPaymentModal />
            )}

            <div>
                {/* Dropdown to render article editor */}
                <Accordion type="single"  collapsible>
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="flex-none hover:no-underline  mx-auto inline-flex mb-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-primary-foreground shadow h-9 px-4 py-2 bg-blue-500 hover:bg-blue-300">
                           <Pencil1Icon className="mr-1"/> Write an article
                    </AccordionTrigger>
                    <AccordionContent className="border-b-0">
                        <div className="max-w-xl w-full mt-2 mx-auto">
                            {/* article input fields */}
                            <Input
                                className="bg-white"
                                type="text"
                                id="article-title"
                                value={articleTitle}
                                placeholder="Title..."
                                onChange={e => setArticleTitle(e.target.value)}
                                maxLength={150}
                            />

                            {/* Article category dropdown */}
                <div className="flex flex-col mt-2 sm:flex-row sm:gap-4">
                    <div className="flex flex-col gap-1.5 mt-2 sm:mt-0 ">
                        <Label htmlFor="article-category">Categories</Label>
                        <Select
                        id="article-category"
                        name="article-category"
                        value={articleCategory}
                        onValueChange={setArticleCategory}
                        >
                        <SelectTrigger className="bg-white w-[180px]">
                            <SelectValue placeholder="General" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="News">News</SelectItem>
                            <SelectItem value="Opinion">Opinion</SelectItem>
                            <SelectItem value="Technical">Technical</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2 sm:mt-0">
                        <Label htmlFor="value-input">Pay-to-read price in XEC - optional:</Label>
                        <Input
                        type="number"
                        id="value-input"
                        aria-describedby="helper-text-explanation"
                        className="bg-white w-[240px]"
                        value={paywallAmountXec}
                        onChange={e => handlePaywallAmountChange(e)}
                        />
                    </div>
                    </div>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                        {paywallAmountXecError !== false && paywallAmountXecError}
                    </p>

                            {/* Option to disable comments */}
                        <fieldset>
                                <div className="space-y-5 py-2">
                                    
                                </div>
                        </fieldset>
                   
                            <MarkdownEditor
                                value={article}
                                onChange={(value, viewUpdate) => {
                                    setArticle(value)
                                }}
                                height="400px"
                                className=" px-2 py-2 rounded-xl mx-auto border max-w-3xl max-h-85vh my-auto bg-card text-card-foreground break-words shadow"
                            /> 
                            <p className="text-sm text-red-600 dark:text-red-500">{articleError !== false && articleError}</p>
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-2">
                                {/* Write article button*/}
                                <Button
                                type="button"
                                disabled={article === '' || articleError || articleTitle === '' || paywallAmountXecError}
                                className="bg-blue-500 hover:bg-blue-300"
                                onClick={() => sendArticle()}
                                >
                                <BiSolidNews />&nbsp;Post Article
                                </Button>
                                <br />
                                <div className="sm:flex">
                                <Button
                                type="button"
                                variant="outline" size="icon"
                                onClick={() => savedDraftArticleToLocalStorage()}
                                >
                                <RiSave3Fill />
                                </Button>
                                &nbsp;
                                <Button
                                type="button"
                                variant="outline" size="icon"
                                onClick={() => loadDraftArticleFromLocalStorage()}
                                >
                                <ImDownload3 />
                                </Button>
                                </div>
                                <div className="relative flex items-start mt-2">
                                    <div className="flex h-6 items-center py-2">
                                        <Checkbox
                                        id="comments"
                                        checked={disableArticleReplies}
                                        onCheckedChange={() => setDisableArticleReplies(!disableArticleReplies)}
                                        className="rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <Label htmlFor="comments" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Disable replies to this article
                                        </Label>
                                    </div>
                                    </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>

                {/*Set up pagination menu*/}
                <span>
                    <Pagination>
                        <PaginationContent>
                            {/* Previous button */}
                            <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(old => Math.max(0, old - 1));
                                getArticleHistoryByPage(Math.max(0, currentPage - 1));
                                }}
                                disabled={currentPage === 0}
                            />
                            </PaginationItem>

                            {/* Numbered page links with dynamic display logic */}
                            {Array.from({ length: articleHistory.numPages }, (_, i) => i)
                            .filter(i => {
                                if (articleHistory.numPages <= maxPagesToShow) return true;
                                if (currentPage <= halfMaxPages) return i < maxPagesToShow;
                                if (currentPage >= articleHistory.numPages - halfMaxPages) return i >= articleHistory.numPages - maxPagesToShow;
                                return i >= currentPage - halfMaxPages && i <= currentPage + halfMaxPages;
                            })
                            .map(i => (
                                <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                    e.preventDefault();
                                    getArticleHistoryByPage(i);
                                    setCurrentPage(i);
                                    }}
                                    isActive={currentPage === i}
                                    key={"pagination"+i}
                                >
                                    {i + 1}
                                </PaginationLink>
                                </PaginationItem>
                            ))}

                            {/* Optional ellipsis for overflow, modifying to appear conditionally */}
                            {(articleHistory.numPages > maxPagesToShow && currentPage < articleHistory.numPages - halfMaxPages) && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            )}

                            {/* Next button */}
                            <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(old => Math.min(articleHistory.numPages - 1, old + 1));
                                getArticleHistoryByPage(Math.min(articleHistory.numPages - 1, currentPage + 1));
                                }}
                                disabled={currentPage === articleHistory.numPages - 1}
                            />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </span>
                
                {/* Filter by article author */}
                <form className="space-y-6" action="#" method="POST">
                    <div>
                        <div className="max-w-xl mt-2 w-full mx-auto">
                            <div className="flex items-center space-x-2">
                                <Input
                                id="address"
                                name="address"
                                type="text"
                                value={addressToSearch}
                                required
                                className="bg-gray-50"
                                placeholder='Search By Author Address'
                                onChange={e => handleAddressChange(e)}
                                />

                                <Button
                                type="button"
                                variant="outline"
                                disabled={addressToSearchError}
                                onClick={e => {
                                    getTxHistoryByAddress(e);
                                }}
                                >
                                <MagnifyingGlassIcon className="h-4 w-4" />
                                </Button>

                                <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setTxHistoryByAddress('');
                                    setAddressToSearch('');
                                }}
                                >
                                <ResetIcon />
                                </Button>
                            </div>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                                {addressToSearchError !== false && addressToSearchError}
                            </p>
                        </div>
                    </div>
                </form>

                {/* Render article listings */}
                <RenderArticleListing />
            </div>
            </div>
        </>
    );
};
