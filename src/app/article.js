"use client";
import "./globals.css";
import React, { useState, useEffect, useRef } from 'react';
import { appConfig } from '../config/app';
import { opReturn as opreturnConfig } from '../config/opreturn';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Modal } from "flowbite-react";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { MagnifyingGlassIcon, ResetIcon, Share1Icon, ReloadIcon, Pencil1Icon, ChatBubbleIcon, DotsHorizontalIcon, EyeNoneIcon} from "@radix-ui/react-icons";
import { ImDownload3 } from "react-icons/im";
import { RiSave3Fill } from "react-icons/ri";
import {
    EncryptionIcon,
    UnlockIcon,
    IdCardIcon,
    MuteIcon,
} from "@/components/ui/social";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar";
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
    ipfsArticleTxListener,
    paywallTxListener,
    refreshUtxos,
} from '../chronik/chronik';
import {
    encodeBip21Article,
    encodeBip2XecTip,
    encodeBip21ReplyArticle,
    encodeBip21PaywallPayment,
    getPaginatedHistoryPage,
    getUserLocale,
    formatBalance,
    addNewContact,
    getContactNameIfExist,
    RenderTipping,
    isExistingContact,
    muteNewContact,
} from '../utils/utils';
import { AlitacoffeeIcon, DefaultavatarIcon, ReplieduseravatarIcon, GraphchartIcon, Stats2Icon } from "@/components/ui/social";
import { toast } from 'react-toastify';
import { Toggle } from "@/components/ui/toggle";
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
import { FileUpload } from "@/components/ui/fileupload";
import { isValidRecipient } from '../validation/validation';
import { Badge } from "@/components/ui/badge";
import localforage from 'localforage';
import copy from 'copy-to-clipboard';
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from 'dompurify';
import MarkdownEditor from '@uiw/react-markdown-editor';
import { PinataSDK } from "pinata";
import { getStackArray } from 'ecash-script';
import { BN } from 'slp-mdm';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

export default function Article( { chronik, address, isMobile, sharedArticleTxid, setXecBalance, setOpenSharedArticleLoader } ) {
    const [articleHistory, setArticleHistory] = useState('');  // current article history page
    const [fullArticleHistory, setFullArticleHistory] = useState('');  // current article history page
    const [articleTitle, setArticleTitle] = useState(''); // title of the article being drafted
    const [article, setArticle] = useState(''); // the article being drafted
    const [articleCategory, setArticleCategory] = useState(''); // category of the article being drafted
    const [disableArticleReplies, setDisableArticleReplies] = useState(false);
    const [currentArticleTxObj, setCurrentArticleTxObj] = useState(false); // the tx object containing the full article / tx being viewed
    const [articleError, setArticleError] = useState(false);
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
    const [showEditor, setshowEditor] = useState(false);
    const [showSearchBar, setshowSearchBar] = useState(false);
    const newContactNameInput = useRef('');
    const [contactList, setContactList] = useState('');
    const [muteList, setMuteList] = useState('');
    const [curateByContacts, setCurateByContacts] = useState(false);
    const articleReplyInput = useRef('');
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [fileSelected, setFileSelected] = useState(false);
    const pinata = new PinataSDK({
        pinataJwt: process.env.IPFS_API_KEY,
        pinataGateway: process.env.IPFS_API,
    });

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

            await refreshContactList();

            // If cache exists, set initial render to cached history
            const articleCache = await localforage.getItem(appConfig.localArticleCacheParam);
            if (articleCache && articleCache.txs && Array.isArray(articleCache.txs) && articleCache.txs.length > 0) {
                setFullArticleHistory(articleCache);
                getArticleHistoryByPage(0, true, articleCache, curateByContacts);
            }

            // Use cached paywall data if applicable
            let localArticleHistoryResp = articleCache ? articleCache : await getArticleHistoryByPage(0);
            localforage.setItem(appConfig.localpaywallTxsParam, localArticleHistoryResp.paywallTxs);

            setIsLoading(false);

            // On-chain refresh of article history
            await getArticleHistoryByPage(0);

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

                    setOpenSharedArticleLoader(false);
                    if (sharedArticleObject.paywallPrice > 0) {
                        // If this article exists, and is a paywalled article, check paywall payment and render accordingly
                        handlePaywallStatus(
                            sharedArticleTxid,
                            sharedArticleObject.paywallPrice,
                            localArticleHistoryResp,
                            articleTx.replyAddress,
                        );
                    } else {
                        // If this article exists as a non-paywalled article, render directly
                        setShowArticleModal(true);
                    }
                }
            }

        })();

        (async () => {
            const updatedCache = await refreshUtxos(chronik, address);
            setXecBalance(updatedCache.xecBalance);
        })();
    }, [muteList]);

    const refreshContactList = async () => {
        setContactList(
            await localforage.getItem(appConfig.localContactsParam),
        );
    };

    // Retrieves the article listing
    // Set localLookup to true to retrieve paginated data locally
    const getArticleHistoryByPage = async (
        pageNum = 0,
        localLookup = false,
        articleCache = false,
        curateByContacts = false,
    ) => {
        if (
            typeof pageNum !== "number" ||
            chronik === undefined
        ) {
            return;
        }

        // Retrieve muted addresses
        let mutedList = await localforage.getItem(appConfig.localMuteParam);
        if (!Array.isArray(mutedList)) {
            mutedList = [];
        }

        if (localLookup) {
            // if articleCache was passed in from useEffect, use it as the source of truth for local lookup
            let localArticleHistory = articleCache ? articleCache : fullArticleHistory;

            // If the user opts to curate content by contacts only
            if (curateByContacts === true) {
                const contactOnlyArticleHistoryTxs = [];
                for (const tx of localArticleHistory.txs) {
                    let txByContact = contactList.find(
                        contact => contact.address === tx.replyAddress,
                    );
                    // if a match was found
                    if (typeof txByContact !== 'undefined') {
                        contactOnlyArticleHistoryTxs.push(tx);
                    }
                }
                localArticleHistory.txs = contactOnlyArticleHistoryTxs;
            }

            // Remove muted addresses
            const totalTxlHistoryTxsInclMuted = [];
            for (const tx of localArticleHistory.txs) {
                let txByContact = mutedList.find(
                    contact => contact.address === tx.replyAddress,
                );
                // if a match was not found
                if (typeof txByContact === 'undefined') {
                    totalTxlHistoryTxsInclMuted.push(tx);
                }
            }
            localArticleHistory.txs = totalTxlHistoryTxsInclMuted;

            const selectedPageHistory = getPaginatedHistoryPage(
                localArticleHistory.txs,
                pageNum,
            );

            setArticleHistory({
                txs: selectedPageHistory,
                numPages: localArticleHistory.numPages,
                replies: localArticleHistory.replies,
                paywallTxs: localArticleHistory.paywallTxs,
            });
        } else {
            const txHistoryResp = await getArticleHistory(chronik, appConfig.townhallAddress, pageNum);
            if (txHistoryResp && Array.isArray(txHistoryResp.txs)) {
                const firstPageHistory = getPaginatedHistoryPage(
                    txHistoryResp.txs,
                    pageNum,
                );

                const currentArticleHistoryPage = {
                    txs: firstPageHistory,
                    numPages: txHistoryResp.numPages,
                    replies: txHistoryResp.replies,
                    paywallTxs: txHistoryResp.paywallTxs,
                };

                setArticleHistory(currentArticleHistoryPage);
                setFullArticleHistory(txHistoryResp);
                await localforage.setItem(appConfig.localArticleCacheParam, txHistoryResp);
                return currentArticleHistoryPage;
            }
        }
    };

    // Handle the checkbox to curate posts from contacts only
    const handleCurateByContactsChange = async (newState) => {
        setCurateByContacts(newState);
        const articleCache = await localforage.getItem(appConfig.localArticleCacheParam);
        if (newState === true) {
            await refreshContactList();
            setCurrentPage(0);
            await getArticleHistoryByPage(
                0,
                true, // filter on local cache only
                articleCache,
                true, // flag for contact filter
            );
        } else {
            setCurrentPage(0);
            await getArticleHistoryByPage(
                0,
                true, // filter on local cache only
                articleCache,
                false,
            );
        }
    };

    // Calculates article reading time in minutes
    const getEstiamtedReadingTime = (articleContent) => {
        if (!articleContent) {
            return 1;
        }
        return Math.ceil(articleContent.split(" ").length / 200);
    };

    // Uploads the selected file to IPFS and sends an article tx BIP21 query string to cashtab extensions
    const sendAudioArticle = async () => {
        const crypto = require('crypto');
        const articleHash = crypto.randomBytes(20).toString('hex')+new Date();

        // Encode the op_return article script
        const opReturnRaw = encodeBip21Article(articleHash);
        const bip21Str = `${address}?amount=${appConfig.dustXec}&op_return_raw=${opReturnRaw}`;

        try {
            toast('Uploading to IPFS, please wait...');
            const ipfsHash = await pinata.upload.file(fileSelected);
            toast('IPFS upload complete');

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
                content: '',
                category: articleCategory,
                paywallPrice: paywallAmountXec,
                disbleReplies: disableArticleReplies,
                ipfsHash: ipfsHash.IpfsHash,
                date: Date.now(),
            };

            // if this article hash already exists, return with error toast
            let updatedArticles = await localforage.getItem(appConfig.localArticlesParam);
            let isDuplicateArticle = updatedArticles.some(function(thisArticle) {
                return articleHash === thisArticle.hash;
            });
            if (isDuplicateArticle) {
                toast('This audio article already exists.');
                return;
            }
            updatedArticles.push(articleObject);

            setArticle('');
            setArticleTitle('');
            ipfsArticleTxListener(chronik, address, updatedArticles, articleObject, getArticleHistoryByPage);
        } catch (error) {
            console.log('Error uploading to IPFS: ', error);
        }
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
        articleTxListener(chronik, address, updatedArticles, articleObject, getArticleHistoryByPage);
    };

    // Pass a reply to article tx BIP21 query string to cashtab extensions
    const replytoArticle = (replyTxid, replyMsg) => {
        if (replyMsg.trim() === '') {
            return;
        }
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
                    <div className="flex flex-col break-words space-y-1.5 gap-2 mt-2 w-full leading-1.5 p-6 rounded-xl bg-card text-card-foreground shadow-none dark:bg-gray-700 transition-transform transform">
                        <div className="flex justify-between items-center w-full" key={"article"+index}>
                            <div className="flex items-center gap-2">
                                {foundReply.senderAvatarLink === false ? (
                                    <ReplieduseravatarIcon/>
                                ) : (
                                <Avatar className="h-9 w-9">
                                <AvatarImage src={foundReply.senderAvatarLink} alt="User Avatar" />
                                <AvatarFallback><DefaultavatarIcon/></AvatarFallback>
                            </Avatar>
                                )}
                                <div className="font-medium dark:text-white" onClick={() => {
                                    copy(foundReply.replyAddress);
                                    toast(`${foundReply.replyAddress} copied to clipboard`);
                                }}>
                                    <Badge className="leading-7 [&:not(:first-child)]:mt-6 py-3px" variant="outline">
                                        {getContactNameIfExist(foundReply.replyAddress, contactList)}
                                    </Badge>
                                </div>
                                <RenderTipping address={foundReply.replyAddress} sendXecTip={sendXecTip} />

                                {/* Add contact popover to input the new contact name */}
                                {isExistingContact(foundReply.replyAddress, contactList) === false && (
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="icon" className="mr-2">
                                            <IdCardIcon className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <div className="space-y-2">
                                        <h4 className="flex items-center font-medium leading-none">
                                                <Pencil1Icon className="h-4 w-4 mr-1" />
                                                New contact
                                            </h4>
                                            <p className="text-sm text-muted-foreground max-w-96 break-words">
                                                Input contact name for <br />{foundReply.replyAddress}
                                            </p>
                                        </div>
                                        <div className="py-2">
                                            <Input
                                                id="addContactName"
                                                name="addContactName"
                                                type="text"
                                                ref={newContactNameInput}
                                                placeholder="New contact name"
                                                className="bg-gray-50"
                                                maxLength="30"
                                            />
                                            <Button
                                                type="button"
                                                disabled={newContactNameInput?.current?.value === ''}
                                                className="mt-2"
                                                onClick={e => {
                                                    addNewContact(newContactNameInput?.current?.value, foundReply.replyAddress, refreshContactList);
                                                }}
                                            >
                                                Add Contact
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                )}
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
    const RenderArticle = ({ content, ipfsAudioHash }) => {
        if (ipfsAudioHash) {
            return (<AudioPlayer
                src={`https://gateway.pinata.cloud/ipfs/${ipfsAudioHash}`}
            />);
        }
        const renderedArticle = DOMPurify.sanitize(content);
        return (<MarkdownEditor.Markdown style={{ backgroundColor: 'transparent' }}  source={renderedArticle} />);
    };

    // Validate the paywall price input
    const handlePaywallAmountChange = e => {
        const { value } = e.target;

        const decimalIndex = value.toString().indexOf('.');
        const decimalPlaces = decimalIndex >= 0 ? value.toString().length - decimalIndex - 1 : 0;

        if (decimalPlaces > 2) {
            setPaywallAmountXecError(`Paywall amount must not exceed 2 decimal places`);
        } else if (value >= appConfig.dustXec || value === '') {
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
            Array.isArray(fullArticleHistory.txs) &&
            fullArticleHistory.txs.length > 0
        ) {
            const filteredArticleHistory = [];
            for (const tx of fullArticleHistory.txs) {
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
    const checkPaywallPayment = (paywalledArticleTxId, paywallPrice, localArticleHistoryResp = false, articleAuthor = false) => {
        let paywallPaid = false;
        let localArticleHistory = articleHistory;
        if (localArticleHistoryResp) {
            localArticleHistory = localArticleHistoryResp;
        }

        // Waive paywall for article author
        if (articleAuthor === address) {
            return true;
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

    // Calculate the aggregate paywall revenue earned for a particular article
    const getTotalPaywallEarnedPerArticle = (paywalledArticleTxId, localArticleHistoryResp = false) => {
        let localArticleHistory = articleHistory;
        if (localArticleHistoryResp) {
            localArticleHistory = localArticleHistoryResp;
        }
        let totalPaywallEarned = BN(0);
        let totalUnlockCount = BN(0);
        for (const thisPaywallPayment of localArticleHistory.paywallTxs) {
            if (thisPaywallPayment.paywallPaymentArticleTxid === paywalledArticleTxId) {
                totalPaywallEarned = totalPaywallEarned.plus(BN(thisPaywallPayment.paywallPayment));
                totalUnlockCount = totalUnlockCount.plus(BN(1));
            }
        }
    
        return {
            totalPaywallEarned,
            totalUnlockCount
        };
    };

    // Calculate the total number of comments for a particular article
    const getTotalCommentsPerArticle = (txid, replies) => {
        const foundReplies = replies.filter(replyTx => replyTx.articleTxid === txid);
        return foundReplies.length;
    };

    // Conditionally renders the appropriate modal based on paywall payment status
    const handlePaywallStatus = (paywalledArticleTxId, paywallPrice, localArticleHistoryResp = false, articleAuthor = false) => {
        const paywallPaid = checkPaywallPayment(paywalledArticleTxId, paywallPrice, localArticleHistoryResp, articleAuthor);
        if (paywallPaid) {
            setShowArticleModal(true);
        } else {
            setShowPaywallPaymentModal(true);
        }
    };

    const PaywallPaymentModal = () => {
        return (
            <Modal show={showPaywallPaymentModal} onClose={() => setShowPaywallPaymentModal(false)}>
                <Modal.Header>{currentArticleTxObj.articleObject.title}</Modal.Header>
                <Modal.Body>
                    This article costs a one-off {formatBalance(currentArticleTxObj.articleObject.paywallPrice, getUserLocale(navigator))} XEC to access.<br />
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
                        <Button variant="secondary" onClick={() => setShowPaywallPaymentModal(false)}>
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    };

    const FullArticleModal = () => {
        return (
            <Modal show={showArticleModal} onClose={() => setShowArticleModal(false)}  className="bg-background/90 h-auto md:h-auto">
                <div className="shadow-xl bg-white border rounded-lg">
                <Modal.Header>{currentArticleTxObj.articleObject.title}</Modal.Header>
                <Modal.Body>
                    {/* Article content */}
                    <div className="space-y-2 flex flex-col max-w-xl gap-2 break-words w-full leading-1.5 p-6">
                        <time dateTime={currentArticleTxObj.txTime} className="text-gray-500">
                            By: {getContactNameIfExist(currentArticleTxObj.replyAddress, contactList)}<br />
                            {currentArticleTxObj.txDate}
                        </time>
                        <RenderArticle
                            content={currentArticleTxObj.articleObject.content}
                            ipfsAudioHash={currentArticleTxObj.articleObject.ipfsHash}
                        />
                    </div>
                    {/* Render corresponding replies for this article, ignore if disablReplies is set to true */}
                    {currentArticleTxObj.articleObject.disbleReplies !== true && (
                        <div><RenderReplies txid={currentArticleTxObj.txid} replies={articleHistory.replies} /></div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex flex-col items-start space-x-0 space-y-2 rounded-b border-gray-200 p-6 dark:border-gray-600 border-t">
                    <div className="flex gap-2">
                        {/* Tipping action to an article */}
                        <RenderTipping address={currentArticleTxObj.replyAddress} sendXecTip={sendXecTip} />

                        {/* Sharing options */}
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Share1Icon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-30">
                        <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900 leading-none">Select Platform</h4>
                                    </div>
                            <div className="pt-2">
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
                                    <FacebookIcon size={25} round />
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
                                    <TelegramIcon size={25} round />
                                </TelegramShareButton>
                            </div>
                        </PopoverContent>
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
                            name="reply-post"
                            ref={articleReplyInput}
                            placeholder="Post your reply..."
                            className="bg-gray-50"
                            maxLength={opreturnConfig.articleReplyByteLimit}
                            rows={4}
                        />
                        <Button
                            type="button"
                            className="mt-2"
                            onClick={e => {
                                replytoArticle(currentArticleTxObj.txid, articleReplyInput?.current?.value)
                            }}
                        >
                            Post Reply
                        </Button>
                        <Button
                            className="ml-2"
                            variant="secondary" onClick={() => setShowArticleModal(false)}
                        >
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
            Array.isArray(txHistoryByAddress)
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
                <Card key={index} className="max-w-xl w-full mt-2 shadow-none">
                    <CardHeader>
                    <div className="flex items-center justify-between gap-x-4 text-xs">
                    <div className="flex items-center gap-x-4">
                        <time dateTime={tx.txTime} className="text-muted-foreground">
                            {tx.txDate}
                        </time>

                        <span className="text-muted-foreground">
                            {getEstiamtedReadingTime(tx.articleObject.content)} min read
                        </span>

                        <Badge variant="secondary">
                            {tx.articleObject.category || 'General'}
                        </Badge>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <DotsHorizontalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Action</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                            onClick={(e) => {
                                muteNewContact('Muted user', tx.replyAddress, setMuteList, window);
                            }}
                            >
                            <EyeNoneIcon className="h-4 w-4 mr-2" />
                            Mute
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                        <CardTitle>{tx.articleObject.title}</CardTitle>
                        <CardDescription></CardDescription>
                    
                    </CardHeader>
                    <CardContent className="relative">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentArticleTxObj(tx);
                                if (tx.articleObject.paywallPrice > 0) {
                                    handlePaywallStatus(tx.txid, tx.articleObject.paywallPrice, false, tx.replyAddress);
                                } else {
                                    setShowArticleModal(true);
                                }
                            }}
                        >
                            {tx.articleObject.paywallPrice > 0 && !checkPaywallPayment(tx.txid, tx.articleObject.paywallPrice, false, tx.replyAddress) && (
                                <Alert
                                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-auto z-10 flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/5"
                                >
                                    <AlertDescription className="flex items-center justify-center whitespace-nowrap">
                                        <EncryptionIcon />
                                        This article costs {formatBalance(tx.articleObject.paywallPrice, getUserLocale(navigator))} XEC to view
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="line-clamp-3">
                                <p
                                    className={`mt-0 text-sm leading-6 text-gray-600 break-words max-h-80 ${
                                        tx.articleObject.paywallPrice > 0 && !checkPaywallPayment(tx.txid, tx.articleObject.paywallPrice, false, tx.replyAddress) ? 'blur-sm pt-6' : ''
                                    }`}
                                >
                                    {tx.articleObject.paywallPrice > 0 && !checkPaywallPayment(tx.txid, tx.articleObject.paywallPrice, false, tx.replyAddress) ? (
                                        <>
                                            <Skeleton className="h-4 mt-2 w-full" />
                                            <Skeleton className="h-4 mt-2 w-2/3" />
                                            <Skeleton className="h-4 mt-2 w-1/2" />
                                        </>
                                    ) : (
                                        <RenderArticle
                                            content={tx.articleObject.content}
                                            ipfsAudioHash={tx.articleObject.ipfsHash}
                                        />
                                    )}
                                </p>
                            </div>
                        </a>
                    </CardContent>
                    <CardFooter>
                    <div className="relative mt-2 flex items-center gap-x-2">
                            {tx.senderAvatarLink === false ? (
                                <DefaultavatarIcon className="h-10 w-10 rounded-full bg-gray-50" />
                            ) : (
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={tx.senderAvatarLink} alt="User Avatar" />
                                    <AvatarFallback><DefaultavatarIcon /></AvatarFallback>
                                </Avatar>
                            )}
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
                                            {getContactNameIfExist(tx.replyAddress, contactList)}
                                        </div>
                                    </Badge>
                                </p>
                            </div>
                            {/* Add contact popover to input the new contact name */}
                            {isExistingContact(tx.replyAddress, contactList) === false && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon" className="mr-2">
                                                <IdCardIcon className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div className="space-y-2">
                                            <h4 className="flex items-center font-medium leading-none">
                                                <Pencil1Icon className="h-4 w-4 mr-1" />
                                                New contact
                                            </h4>
                                                <p className="text-sm text-muted-foreground max-w-96 break-words">
                                                    Input contact name for <br />{tx.replyAddress}
                                                </p>
                                            </div>
                                            <div className="py-2">
                                                <Input
                                                    id="addContactName"
                                                    name="addContactName"
                                                    type="text"
                                                    ref={newContactNameInput}
                                                    placeholder="New contact name"
                                                    className="bg-gray-50"
                                                    maxLength="30"
                                                />
                                                <Button
                                                    type="button"
                                                    disabled={newContactNameInput?.current?.value === ''}
                                                    className="mt-2"
                                                    onClick={e => {
                                                        addNewContact(newContactNameInput?.current?.value, tx.replyAddress, refreshContactList);
                                                    }}
                                                >
                                                    Add Contact
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>
                        <div className="relative mt-2 flex items-center gap-x-2 ml-auto md:hidden">
                            <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="mr-2">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-120">
                                    <div className="flex flex-col items-start space-y-1 ml-2">
                            <div className="flex items-center space-x-1">
                                <ChatBubbleIcon />
                                <span>{getTotalCommentsPerArticle(tx.txid, articleHistory.replies)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                            <GraphchartIcon />
                            <span>{`${getTotalPaywallEarnedPerArticle(tx.txid).totalUnlockCount} `}</span>
                            </div>
                            <p>
                                {getTotalPaywallEarnedPerArticle(tx.txid).totalPaywallEarned.gt(0) && 
                                `Earned ${formatBalance(getTotalPaywallEarnedPerArticle(tx.txid).totalPaywallEarned, getUserLocale(navigator))} XEC`}
                            </p>
                            </div>
                         </PopoverContent>
                         </Popover>
                      </div>
                        <div className="relative mt-2 flex items-center gap-x-2 ml-auto hidden md:flex">
                          
                            {tx.articleObject.paywallPrice > 0 && checkPaywallPayment(tx.txid, tx.articleObject.paywallPrice, false, tx.replyAddress) && (
                                <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger> <UnlockIcon /></TooltipTrigger>
                                  <TooltipContent>
                                    <p>This article has been paid.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                              <div className="flex items-center space-x-1 ml-2 ">
                            <ChatBubbleIcon />
                            <span>{getTotalCommentsPerArticle(tx.txid, articleHistory.replies)}</span>
                            </div>
                            
                            <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                            
                            <div className="flex items-center space-x-1 ml-2">
                            <GraphchartIcon />
                            <span>{`${getTotalPaywallEarnedPerArticle(tx.txid).totalUnlockCount} `}</span>
                         </div>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>
                            {`Earned ${formatBalance(getTotalPaywallEarnedPerArticle(tx.txid).totalPaywallEarned, getUserLocale(navigator))} XEC`}
                            <br />
                            {` from ${getTotalPaywallEarnedPerArticle(tx.txid).totalUnlockCount} unlocks`}
                        </p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>        
                        <div>
                      </div>
                        </div>
                    </CardFooter>
                </Card>
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
            <div className="flex justify-center items-center space-x-2">
            <Toggle variant="outline" className="bg-accent data-[state=on]:bg-white" aria-label="Toggle bold" onClick={() => setshowEditor(prevState => !prevState)}>
                <Pencil1Icon className="h-4 w-4" />
            </Toggle>
            <Toggle variant="outline" className="bg-accent data-[state=on]:bg-white" aria-label="Toggle bold" onClick={() => setshowSearchBar(prevState => !prevState)}>
                <MagnifyingGlassIcon className="h-4 w-4" />
            </Toggle>
            </div>
                {showEditor && (
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
                <div className="flex flex-col mt-2 sm:flex-row sm:gap-2">
                    <div className="flex flex-col gap-1.5 mt-2 sm:mt-0 ">
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
                            <SelectItem value="Podcast">Podcast</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-1.5 mt-2 sm:mt-0">
                       
                        <Input
                        type="number"
                        id="value-input"
                        aria-describedby="helper-text-explanation"
                        placeholder="Pay-to-read in XEC -optional"
                        className="bg-white w-[240px]"
                        value={paywallAmountXec}
                        onChange={e => handlePaywallAmountChange(e)}
                        />
                          <Button
                                type="button"
                                variant="outline" size="icon"
                                onClick={() => savedDraftArticleToLocalStorage()}
                                >
                                <RiSave3Fill />
                                </Button>
                                <Button
                                type="button"
                                variant="outline" size="icon"
                                onClick={() => loadDraftArticleFromLocalStorage()}
                                >
                                <ImDownload3 />
                                </Button>
                    </div>
                  
                    </div>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                        {paywallAmountXecError !== false && paywallAmountXecError}
                    </p>

                            {/* Option to disable comments */}
                        <fieldset>
                                <div className="space-y-5 py-1">     
                                </div>
                        </fieldset>

                        {articleCategory === "Podcast" ? (
                            <FileUpload
                                maxFileSizeBytes={appConfig.ipfsAudioSizeLimitMb*1024*1024}
                                setIsFileSelected={setIsFileSelected}
                                setFileSelected={setFileSelected}
                            />
                        ) : (
                        <MarkdownEditor
                            value={article}
                            onChange={(value, viewUpdate) => {
                                setArticle(value);
                            }}
                            height="400px"
                            className="px-2 py-2 rounded-xl mx-auto border max-w-3xl max-h-85vh my-auto bg-card text-card-foreground break-words"
                        />

                        )}

                            <p className="text-sm text-red-600 dark:text-red-500">{articleError !== false && articleError}</p>
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-2">
                                {/* Write article button*/}

                                {articleCategory !== "Podcast" ? (
                                <Button
                                    type="button"
                                    disabled={article === '' || articleError || articleTitle === '' || paywallAmountXecError}                            
                                    onClick={() => sendArticle()}
                                >
                                    <BiSolidNews />&nbsp;Post Article
                                </Button>
                                ) : (
                                <Button
                                    type="button"
                                    disabled={articleError || articleTitle === '' || paywallAmountXecError || isFileSelected === false}
                                    onClick={() => sendAudioArticle()}
                                >
                                    <BiSolidNews />&nbsp;Post Podcast
                                </Button>
                                )
                                }
                                <br />
                                <div className="sm:flex">
                               
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
                )}
               
                <div className="relative flex items-start mt-2 mb-2">
                    <div className="flex h-6 items-center py-2">
                        <Checkbox
                        id="curateByContacts"
                        checked={curateByContacts}
                        onCheckedChange={() => handleCurateByContactsChange(!curateByContacts)}
                        className="rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <Label htmlFor="curateByContacts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Only show articles by your contacts
                        </Label>
                    </div>
                </div>

                {/*Set up pagination menu*/}
                <span>
                    <Pagination className='mt-2'>
                        <PaginationContent>
                            {/* Previous button */}
                            <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(old => Math.max(0, old - 1));
                                getArticleHistoryByPage(Math.max(0, currentPage - 1), true, false, curateByContacts);
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
                                    getArticleHistoryByPage(i, true, false, curateByContacts);
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
                                getArticleHistoryByPage(Math.min(articleHistory.numPages - 1, currentPage + 1), true, false, curateByContacts);
                                }}
                                disabled={currentPage === articleHistory.numPages - 1}
                            />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </span>
                
                {/* Filter by article author */}
                {showSearchBar && (
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
                )}

                {/* Render article listings */}
                <RenderArticleListing />
            </div>
            </div>
        </>
    );
};
