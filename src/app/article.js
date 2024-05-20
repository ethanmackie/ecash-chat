"use client";
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
    getArticleHistory,
    getReplyTxDetails,
    parseChronikTx,
    txListener,
    getTxDetails,
    articleTxListener,
} from '../chronik/chronik';
import {
    encodeBip21Article,
    encodeBip2XecTip,
    encodeBip21ReplyArticle,
} from '../utils/utils';
import { CrossIcon, AnonAvatar, ShareIcon, ReplyIcon, EmojiIcon, YoutubeIcon, AlitacoffeeIcon, DefaultavatarIcon, ReplieduseravatarIcon } from "@/components/ui/social";
import { PersonIcon, FaceIcon, Link2Icon, ImageIcon, TwitterLogoIcon as UITwitterIcon, ChatBubbleIcon, Share1Icon } from '@radix-ui/react-icons';
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
import Yamde from 'yamde';
import { Badge } from "@/components/ui/badge";
import { kv } from '@vercel/kv';
import localforage from 'localforage';
import copy from 'copy-to-clipboard';
import { Skeleton } from "@/components/ui/skeleton";

export default function Article( { chronik, address, isMobile } ) {
    const [articleHistory, setArticleHistory] = useState('');
    const [articleTitle, setArticleTitle] = useState(''); // title of the article being drafted
    const [article, setArticle] = useState(''); // the article being drafted
    const [articleCategory, setArticleCategory] = useState(''); // category of the article being drafted
    const [currentArticleTxObj, setCurrentArticleTxObj] = useState(false); // the tx object containing the full article / tx being viewed
    const [articleError, setArticleError] = useState(false);
    const [replyArticle, setReplyArticle] = useState('');
    const [replyArticleError, setReplyArticleError] = useState(false);
    const [showArticleModal, setShowArticleModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [maxPagesToShow, setMaxPagesToShow] = useState(7);
    const md = require('markdown-it')({
        html: true,
        linkify: true,
        typography: true
    }).use(require('markdown-it-video'), {
        youtube: { width: 500, height: 281 },
        vimeo: { width: 500, height: 281 },
        vine: { width: 500, height: 281, embed: 'simple' },
        prezi: { width: 500, height: 281 }
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
        // Render the first page by default upon initial load
        (async () => {
            await getArticleHistoryByPage(0);
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
        }, appConfig.historyRefreshInterval);
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
        setArticle('');
        setArticleTitle('');

        const articleObject = {
            hash: articleHash,
            title: articleTitle,
            content: article,
            category: articleCategory,
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

        articleTxListener(chronik, address, kv, updatedArticles);
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
        txListener(chronik, address, "Article reply sent", getArticleHistoryByPage);
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

        txListener(chronik, address, "Article XEC tip sent", getArticleHistoryByPage);
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
        const renderedArticle = md.render(content);
        return (<div dangerouslySetInnerHTML={{ __html: renderedArticle }} />);
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

    const FullArticleModal = () => {
        return (
            <Modal show={showArticleModal} onClose={() => setShowArticleModal(false)}>
                <Modal.Header>{currentArticleTxObj.articleObject.title}</Modal.Header>
                <Modal.Body>
                    {/* Article content */}
                    <div className="space-y-2 flex flex-col max-w-xl gap-2 break-words w-full leading-1.5 p-6">
                        <RenderArticle content={currentArticleTxObj.articleObject.content} />
                    </div>
                    {/* Render corresponding replies for this article */}
                    <div>
                        <RenderReplies txid={currentArticleTxObj.txid} replies={articleHistory.replies} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex gap-5">
                        {/* Tipping action to an article */}
                        <RenderTipping address={currentArticleTxObj.replyAddress} />

                        {/* Reply action to an article */}
                        <div className="w-120 text-sm text-gray-500 dark:text-gray-400">
                            <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                                <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Reply to article ...{currentArticleTxObj.txid.slice(-10)}</h3>
                            </div>
                            <div className="px-3 py-2">
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
                                    variant="outline"
                                    className="bg-blue-500 hover:bg-blue-300"
                                    onClick={e => {
                                        replytoArticle(currentArticleTxObj.txid, replyArticle)
                                    }}
                                >
                                    Post Reply
                                </Button>
                            </div>
                        </div>

                        <Button onClick={() => setShowArticleModal(false)}>
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    };

    return (
        <>
            {showArticleModal && (
                <FullArticleModal />
            )}
            <div>
                {/* Dropdown to render article editor */}
                <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="items-center justify-center">
                        <Button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-300"
                        >
                            <b>Write an article</b>
                        </Button>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="max-w-xl w-full mx-auto">
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
                            <select
                                id="article-category"
                                name="article-category"
                                className="mt-2 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                defaultValue="General"
                                value={articleCategory}
                                onChange={e => setArticleCategory(e.target.value)}
                                maxLength={5000}
                            >
                                <option>General</option>
                                <option>News</option>
                                <option>Opinion</option>
                                <option>Technical</option>
                            </select>

                            <Yamde value={article} handler={setArticle} theme="light" />
                            <p className="text-sm text-red-600 dark:text-red-500">{articleError !== false && articleError}</p>
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-2">
                                {/* Write article button*/}
                                <Button
                                type="button"
                                disabled={article === '' || articleError}
                                className="bg-blue-500 hover:bg-blue-300"
                                onClick={() => sendArticle()}
                                >
                                <BiSolidNews />&nbsp;Post Article
                                </Button>
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
                
                {/* Render article listings */}
                <div className="flex min-h-full flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:min-w-[576px]">
                    {articleHistory &&
                        articleHistory.txs &&
                            articleHistory.txs.length > 0
                            ? articleHistory.txs.map(
                                (tx, index) => (
                                    <>
                                        {/* Render a summary of the article */}
                                        {tx.articleObject && (
                                            <article key={index} className="flex max-w-xl flex-col items-start justify-between py-8">
                                                {/* Article date and category */}
                                                <div className="flex items-center gap-x-4 text-xs">
                                                    <time dateTime={tx.txTime} className="text-gray-500">
                                                        {tx.txDate}
                                                    </time>
                                                    <div
                                                        className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                                                    >
                                                        {typeof tx.articleObject.category !== 'undefined' && tx.articleObject.category ? tx.articleObject.category : 'General'}
                                                    </div>
                                                </div>
                                                <div className="group relative">
                                                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                                                        <a href={'#'}  onClick={() => {
                                                            setCurrentArticleTxObj(tx);
                                                            setShowArticleModal(true);
                                                        }}>
                                                            <span className="absolute inset-0" />
                                                            {tx.articleObject.title}
                                                        </a>
                                                    </h3>
                                                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 break-words">
                                                        <RenderArticle content={tx.articleObject.content} />
                                                    </p>
                                                </div>
                                                {/* Article author */}
                                                <div className="relative mt-2 flex items-center gap-x-4">
                                                    <DefaultavatarIcon className="h-10 w-10 rounded-full bg-gray-50" />
                                                    <div className="text-sm leading-6">
                                                        <p className="font-semibold text-gray-900">
                                                            <span className="absolute inset-0" />
                                                            <Badge variant="outline" className="py-3px">
                                                                <div className="leading-7 [&:not(:first-child)]:mt-6" onClick={() => {
                                                                    copy(tx.replyAddress);
                                                                    toast(`${tx.replyAddress} copied to clipboard`);
                                                                }}>
                                                                    {tx.replyAddress.substring(0,10)}...{tx.replyAddress.substring(tx.replyAddress.length - 5)}
                                                                </div>
                                                            </Badge>
                                                        </p>
                                                    </div>
                                                </div>
                                            </article>
                                        )}
                                    </>
                                ),
                            )
                        : <div className="flex flex-col space-y-3">
                        <div className="space-y-2">
                        <Skeleton className="h-4 w-[400px]" />
                        <Skeleton className="h-4 w-[350px]" />
                        <Skeleton className="h-4 w-[300px]" />
                        </div>
                    </div>
                    }
                </div>
            </div>
        </>
    );
};
