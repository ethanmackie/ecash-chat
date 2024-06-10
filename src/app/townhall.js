"use client";
import  React, { useState, useEffect } from 'react';
import { appConfig } from '../config/app';
import { Tooltip, Avatar, Popover, Accordion, Alert, Modal } from "flowbite-react";
import { Textarea } from "@/components/ui/textarea";
import { opReturn as opreturnConfig } from '../config/opreturn';
import { postHasErrors, replyHasErrors } from '../validation/validation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"
import { AnonAvatar, ShareIcon, ReplyIcon, EmojiIcon, PostIcon, YoutubeIcon, AlitacoffeeIcon, DefaultavatarIcon, ReplieduseravatarIcon } from "@/components/ui/social";
import { PersonIcon, FaceIcon, Link2Icon, ImageIcon, TwitterLogoIcon as UITwitterIcon, ChatBubbleIcon, Share1Icon } from '@radix-ui/react-icons';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Tweet } from 'react-tweet';
import { HiInformationCircle } from "react-icons/hi";
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
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
import { encodeBip21Message, encodeBip21Post, encodeBip21ReplyPost, encodeBip2XecTip, getTweetId } from '../utils/utils';
import {
    getTxHistory,
    getReplyTxDetails,
    parseChronikTx,
    txListener,
    getTxDetails,
} from '../chronik/chronik';
import copy from 'copy-to-clipboard';
import { toast } from 'react-toastify';
import { Alert as ShadcnAlert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
const chronik = new ChronikClientNode(chronikConfig.urls);
import YouTubeVideoId from 'youtube-video-id';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton";

export default function TownHall({ address, isMobile }) {
    const [townHallHistory, setTownHallHistory] = useState('');
    const [post, setPost] = useState('');
    const [postError, setPostError] = useState(false);
    const [replyPost, setReplyPost] = useState('');
    const [replyPostError, setReplyPostError] = useState(false);
    const [renderEmojiPicker, setRenderEmojiPicker] = useState(false);
    const [showMessagePreview, setShowMessagePreview] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [maxPagesToShow, setMaxPagesToShow] = useState(7); // default 7 here 

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
            await getTownhallHistoryByPage(0);
        })();
        initializeTownHallRefresh();
    }, []);

    /**
     * Set an interval to trigger regular townhall refresh
     * @returns callback function to cleanup interval
     */
    const initializeTownHallRefresh = async () => {
        const intervalId = setInterval(async function () {
            await getTownhallHistoryByPage(0);
        }, appConfig.historyRefreshInterval);
        // Clear the interval when page unmounts
        return () => clearInterval(intervalId);
    };

    // Retrieves the post history
    const getTownhallHistoryByPage = async (page) => {
        if (
            typeof page !== "number" ||
            chronik === undefined
        ) {
            return;
        }

        const txHistoryResp = await getTxHistory(chronik, appConfig.townhallAddress, page);
        if (txHistoryResp && Array.isArray(txHistoryResp.txs)) {
            setTownHallHistory(txHistoryResp);
        }
    };

    // Validate the reply post
    // Note: at some point this function will diverge in functionality with handlePostChange()
    const handleReplyPostChange = e => {
        const { value } = e.target;
        const replyValidation = replyHasErrors(value);
        let parsedMessage = value;
        if (!replyValidation) {
            // Reply validates ok
            setReplyPostError(false);

            // Automatically extract video and tweet IDs

            // If youtube embedding is present
            if (
                value.includes('[yt]') &&
                value.includes('[/yt]') &&
                !value.includes('youtubeurl') &&
                !value.includes('https://www.youtube.com/shorts/')
            ) {
                parsedMessage = '[yt]'+YouTubeVideoId(value)+'[/yt]';
            }
            // If youtube shorts is being embedded
            if (
                value.includes('[yt]') &&
                value.includes('[/yt]')&&
                !value.includes('youtubeurl') &&
                value.includes('https://www.youtube.com/shorts/')
            ) {
                let updatedVideoId;
                let videoId = value.substring(
                    value.indexOf('[yt]') + 4,
                    value.lastIndexOf('[/yt]')
                );
                parsedMessage = '[yt]'+videoId.split('https://www.youtube.com/shorts/')[1]+'[/yt]';
            }

            // If tweet embedding is present
            if (
                value.includes('[twt]') &&
                value.includes('[/twt]') &&
                !value.includes('tweeturl')
            ) {
                parsedMessage = getTweetId(value);
            }
        } else {
            setReplyPostError(replyValidation);
        }
        setReplyPost(parsedMessage);
    };

    // Validate the post content length
    const handlePostChange = e => {
        const { value } = e.target;
        const postValidation = postHasErrors(value);
        if (!postValidation) {
            // Post validates ok
            setPostError(false);
        } else {
            setPostError(postValidation);
        }
        setPost(value);
    };

    const insertMarkupTags = tooltipStr => {
        const updatedPost = String(post).concat(tooltipStr);
        setPost(updatedPost);
        handlePostChange({
            target: {
                value: updatedPost,
            },
        });
    };

    // Pass a post tx BIP21 query string to cashtab extensions
    const sendPost = () => {
        // Parse the message for any media tags
        let parsedPost= post;
        // If youtube embedding is present
        if (
            post.includes('[yt]') &&
            post.includes('[/yt]') &&
            !post.includes('youtubeurl') &&
            !post.includes('https://www.youtube.com/shorts/')
        ) {
            const tagStartIndex = post.indexOf('[yt]');
            const tagEndIndex = post.lastIndexOf('[/yt]');
            const remainderPost = post.substring(0, tagStartIndex) + post.substring(tagEndIndex+5);
            parsedPost = remainderPost + '[yt]'+YouTubeVideoId(post)+'[/yt]';
        }

        // If youtube shorts is being embedded
        if (
            post.includes('[yt]') &&
            post.includes('[/yt]') &&
            !post.includes('youtubeurl') &&
            post.includes('https://www.youtube.com/shorts/')
        ) {
            let updatedVideoId;
            let videoId = post.substring(
                post.indexOf('[yt]') + 4,
                post.lastIndexOf('[/yt]')
            );
            const tagStartIndex = post.indexOf('[yt]');
            const tagEndIndex = post.lastIndexOf('[/yt]');
            const remainderPost = post.substring(0, tagStartIndex) + post.substring(tagEndIndex+5);
            parsedPost = remainderPost + '[yt]'+videoId.split('https://www.youtube.com/shorts/')[1]+'[/yt]';
        }

        // If tweet embedding is present
        if (
            post.includes('[twt]') &&
            post.includes('[/twt]') &&
            !post.includes('tweeturl')
        ) {
            const tagStartIndex = post.indexOf('[twt]');
            const tagEndIndex = post.lastIndexOf('[/twt]');
            const remainderPost = post.substring(0, tagStartIndex) + post.substring(tagEndIndex+6);
            parsedPost = remainderPost + '[twt]' + getTweetId(post) + '[/twt]';
        }

        // Encode the op_return post script
        const opReturnRaw = encodeBip21Post(parsedPost);
        const bip21Str = `${appConfig.townhallAddress}?amount=${appConfig.dustXec}&op_return_raw=${opReturnRaw}`;

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
        setPost('');
        txListener(chronik, address, "Townhall post sent", appConfig.dustXec, appConfig.townhallAddress, getTownhallHistoryByPage);
    };

    // Pass a reply post tx BIP21 query string to cashtab extensions
    const replytoPost = (replyTxid, replyMsg) => {
        // Encode the op_return message script
        const opReturnRaw = encodeBip21ReplyPost(replyMsg, replyTxid);
        const bip21Str = `${appConfig.townhallAddress}?amount=${appConfig.dustXec}&op_return_raw=${opReturnRaw}`;

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
        setReplyPost('');
        txListener(chronik, address, "Townhall reply sent", appConfig.dustXec, appConfig.townhallAddress, getTownhallHistoryByPage);
    };

    const MessagePreviewModal = () => {
        return (
            <Modal show={showMessagePreview} onClose={() => setShowMessagePreview(false)}>
                <Modal.Header>Post Preview</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            {(
                                <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white text-ellipsis break-words min-w-0">
                                    {post}
                                </p>
                            )}
                            <br />Media Preview:
                            {/* Render any media content within the message */}
                            {post.includes('[img]') && post.includes('[/img]') && (
                                <img src={post.substring(post.indexOf('[img]') + 5, post.lastIndexOf('[/img]'))} />
                            )}
                            {post.includes('[yt]') && post.includes('[/yt]') && !post.includes('https://www.youtube.com/shorts/') && (
                                <LiteYouTubeEmbed id={YouTubeVideoId(post.substring(post.indexOf('[yt]') + 4, post.lastIndexOf('[/yt]')))} />
                            )}
                            {post.includes('[yt]') && post.includes('[/yt]') && post.includes('https://www.youtube.com/shorts/') && (
                                <LiteYouTubeEmbed id={YouTubeVideoId((post.substring(post.indexOf('[yt]') + 4, post.lastIndexOf('[/yt]'))).split('https://www.youtube.com/shorts/')[1])} />
                            )}
                            {post.includes('[twt]') && post.includes('[/twt]') && !post.includes('tweeturl') && (
                                <Tweet id={getTweetId(post)} />
                            )}
                            {post.includes('[url]') && post.includes('[/url]') && (
                                <a href={post.substring(post.indexOf('[url]') + 5, post.lastIndexOf('[/url]'))} target="_blank">
                                    {post.substring(post.indexOf('[url]') + 5, post.lastIndexOf('[/url]'))}
                                </a>
                            )}
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => {
                        setShowMessagePreview(false)
                        sendPost()
                    }}>
                        Post now
                    </Button>
                    <Button onClick={() => setShowMessagePreview(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        );
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

        txListener(chronik, address, "Townhall XEC tip sent", tipAmount, recipient, getTownhallHistoryByPage);
    };

    // Lookup and render any corresponding replies
    const RenderReplies = ( { txid, replies } ) => {
        const foundReplies = replies.filter(replyTx => replyTx.replyTxid === txid);

        // If this post (i.e. txid) has no reply, don't bother rendering a reply component
        if (foundReplies.length === 0) {
            return;
        }

        return (
            foundReplies.map(
                (foundReply, index) => (
                    <>
                    <div className="flex flex-col break-words space-y-1.5 hover:shadow-md border gap-2 mt-2 w-full leading-1.5 p-6 rounded-xl bg-card text-card-foreground shadow dark:bg-gray-700 transition-transform transform">
                        <div className="flex justify-between items-center w-full" key={"townhallReply"+index}>
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

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:min-w-[576px]">
            <MessagePreviewModal />
              <>
                <div className="max-w-xl w-full mx-auto">
                    {/* Post input field */}
                    <Textarea
                      className="bg-white"
                          id="post"
                          value={post}
                          placeholder="Post your thoughts to the public town hall..."
                          required
                          onChange={e => handlePostChange(e)}
                          rows={4}
                    />
                    <p className="text-sm text-red-600 dark:text-red-500">{postError !== false && postError}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-2">

                        {/* this is icons, buttons on left */}
                        <div className="flex gap-2 mb-2 sm:mb-0">
                        <Popover
                            aria-labelledby="emoji-popover"
                            content={
                                <div>
                                <Picker
                                    data={data}
                                    onEmojiSelect={(e) => {
                                    setPost(post + e.native);
                                    }}
                                />
                                </div>
                            }
                            >
                            <Button
                                variant="ghost"
                                onClick={() => setRenderEmojiPicker(!renderEmojiPicker)}
                            >
                                <FaceIcon /> 
                            </Button>
                        </Popover>
                        <Tooltip content="e.g. [url]https://i.imgur.com/YMjGMzF.jpeg[/url]" style="light">
                            <Button variant="ghost" onClick={() => insertMarkupTags('[url]theurl[/url]')}>
                            <Link2Icon/>
                            </Button>
                        </Tooltip>
                        <Tooltip content="e.g. [img]https://i.imgur.com/YMjGMzF.jpeg[/img]" style="light">
                            <Button variant="ghost" onClick={() => insertMarkupTags('[img]imageurl[/img]')}>
                            <ImageIcon/>
                            </Button>
                        </Tooltip>
                        <Tooltip content="e.g. [yt]https://www.youtube.com/watch?v=1234[/yt]" style="light">
                            <Button variant="ghost" onClick={() => insertMarkupTags('[yt]youtubeurl[/yt]')}>
                                <YoutubeIcon/>
                            </Button>
                        </Tooltip>
                        <Tooltip content="e.g. [twt]https://x.com/yourid/status/1234[/twt]" style="light">
                            <Button variant="ghost" onClick={() => insertMarkupTags('[twt]tweeturl[/twt]')}>
                            <UITwitterIcon/>
                            </Button>
                        </Tooltip>
                        </div>
                        {/* well this is post button*/}
                        <Button
                        type="button"
                        disabled={post === '' || postError}
                        className="bg-blue-500 hover:bg-blue-300"
                        onClick={() => { isMobile ? sendPost() : setShowMessagePreview(true) }}
                        >
                        <PostIcon />&nbsp;Post
                        </Button>
                        </div>
                    </div>
                </>
             <Separator className="my-2" />
            {/* Townhall Post History */}
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
                            getTownhallHistoryByPage(Math.max(0, currentPage - 1));
                            }}
                            disabled={currentPage === 0}
                        />
                        </PaginationItem>

                        {/* Numbered page links with dynamic display logic */}
                        {Array.from({ length: townHallHistory.numPages }, (_, i) => i)
                        .filter(i => {
                            if (townHallHistory.numPages <= maxPagesToShow) return true;
                            if (currentPage <= halfMaxPages) return i < maxPagesToShow;
                            if (currentPage >= townHallHistory.numPages - halfMaxPages) return i >= townHallHistory.numPages - maxPagesToShow;
                            return i >= currentPage - halfMaxPages && i <= currentPage + halfMaxPages;
                        })
                        .map(i => (
                            <PaginationItem key={i}>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                e.preventDefault();
                                getTownhallHistoryByPage(i);
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
                        {(townHallHistory.numPages > maxPagesToShow && currentPage < townHallHistory.numPages - halfMaxPages) && (
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
                            setCurrentPage(old => Math.min(townHallHistory.numPages - 1, old + 1));
                            getTownhallHistoryByPage(Math.min(townHallHistory.numPages - 1, currentPage + 1));
                            }}
                            disabled={currentPage === townHallHistory.numPages - 1}
                        />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </span>

            <div>
            {
                townHallHistory &&
                  townHallHistory.txs &&
                    townHallHistory.txs.length > 0
                    ? townHallHistory.txs.map(
                          (tx, index) => (
                            <>
                                <div className="flex flex-col items-center mt-2" key={"townhallTxHistory"+index}>
                                   <div className="flex flex-col max-w-xl gap-2 break-words hover:shadow-md w-full leading-1.5 p-6 rounded-xl border bg-card text-card-foreground shadow dark:bg-gray-700 transition-transform transform">
                                   <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-semibold text-gray-900 dark:text-white">
                                      <span>
                                         {tx.replyAddress === address ? (
                                             <>
                                             <div className="flex items-center gap-2">
                                                 <DefaultavatarIcon/>
                                                 <Badge variant="outline" className="py-3px">
                                                 <div className="font-medium dark:text-white">
                                                     <div onClick={() => {
                                                         copy(tx.replyAddress);
                                                         toast(`${tx.replyAddress} copied to clipboard`);
                                                     }}
                                                     >Your wallet</div>
                                                 </div>
                                                 </Badge>
                                             </div>
                                             </>
                                         ) :
                                           (<>
                                             <span>
                                                <div className="flex items-center gap-2">
                                                    <DefaultavatarIcon/>
                                                    <Badge variant="outline" className="py-3px shadow-sm hover:bg-accent">
                                                    <div className="leading-7 [&:not(:first-child)]:mt-6">
                                                        <div onClick={() => {
                                                            copy(tx.replyAddress);
                                                            toast(`${tx.replyAddress} copied to clipboard`);
                                                        }}>
                                                            {tx.replyAddress.substring(0,10)}...{tx.replyAddress.substring(tx.replyAddress.length - 5)}
                                                        </div>
                                                    </div>
                                                    </Badge>

                                                    {/* Tip XEC options */}
                                                    <RenderTipping address={tx.replyAddress} />
                                                 </div>
                                             </span>
                                           </>)
                                         }
                                      </span>
                                   </div>

                                   {/* Render the op_return message */}
                                <div className={(tx.opReturnMessage.trim() && tx.opReturnMessage !== '\0') ? "my-2" : "hidden"}>
                                    <p className="leading-7" key={index}>
                                        {(tx.opReturnMessage.trim() && tx.opReturnMessage !== '\0') ? tx.opReturnMessage : ' '}
                                    </p>
                                </div>
                                   {/* Render any media content within the message */}
                                   {tx.nftShowcaseId !== false && tx.nftShowcaseId !== undefined && (
                                        <>
                                <Card className="max-w-md w-full mx-auto transition-shadow duration-300 ease-in-out hover:shadow-lg hover:bg-slate-50">
                                    <CardHeader>
                                        <CardTitle>NFT Showcase</CardTitle>
                                        <CardDescription>
                                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                                        <span onClick={() => {
                                            copy(tx.nftShowcaseId);
                                            toast(`${tx.nftShowcaseId} copied to clipboard`);
                                        }}>
                                        <span className="hidden sm:inline">
                                            ID: {tx.nftShowcaseId.substring(0,15)}...{tx.nftShowcaseId.substring(tx.nftShowcaseId.length - 10)}
                                        </span>
                                        <span className="sm:hidden">
                                            ID: {tx.nftShowcaseId.substring(0,8)}...{tx.nftShowcaseId.substring(tx.nftShowcaseId.length - 5)}
                                        </span>
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
                                        </>
                                    )}
                                   {tx.imageSrc !== false && (<img src={tx.imageSrc} className="rounded-lg object-cover"/>)}
                                   {tx.videoId !== false && (<LiteYouTubeEmbed id={tx.videoId} />)}
                                   {tx.tweetId !== false && (<Tweet id={tx.tweetId} />)}
                                   <p className="line-clamp-1">
                                   {tx.url !== false && (
                                        <Alert color="info" className="flex-nowrap text-sm text-muted-foreground break-words">
                                            <a href={tx.url} target="_blank" className="break-words">{tx.url}</a>
                                        </Alert>
                                    )}
                                   </p>
                                   {/* Date and timestamp */}
                                   <span className="text-sm text-muted-foreground">
                                      {tx.txDate}&nbsp;at&nbsp;{tx.txTime}
                                   </span>

                                   {/* Reply action to a townhall post */}
                                   <div>    
                                       {/* Reply popover to input the reply content */}
                                       <Popover
                                         aria-labelledby="default-popover"
                                         placement="top"
                                         content={
                                           <div className="w-120 text-sm text-gray-500 dark:text-gray-400">
                                             <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                                               <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Reply to {tx.replyAddress}</h3>
                                             </div>
                                             <div className="px-3 py-2">
                                                 {/* Reply input field */}
                                                 <Textarea
                                                     id="reply-post"
                                                     value={replyPost}
                                                     placeholder="Post your reply..."
                                                     className="bg-gray-50"
                                                     required
                                                     onChange={e => handleReplyPostChange(e)}
                                                     rows={4}
                                                 />
                                                 <p className="mt-2 text-sm text-red-600 dark:text-red-500">{replyPostError !== false && replyPostError}</p>
                                                 <Button
                                                   type="button"
                                                   disabled={replyPostError || replyPost === ''}
                                                   className="bg-blue-500 hover:bg-blue-300"
                                                   onClick={e => {
                                                       replytoPost(tx.txid, replyPost)
                                                   }}
                                                 >
                                                   Post Reply
                                                 </Button>
                                             </div>
                                           </div>
                                         }
                                       >
                                          <Button variant="outline" size="icon" className="mr-2">
                                             <ChatBubbleIcon className="h-4 w-4" />
                                         </Button>
                                       </Popover>

                                       {/* Share buttons with other social platforms */}

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
                                       </Popover>
                                            {/* Render corresponding replies for this post */}
                                            {<RenderReplies txid={tx.txid} replies={townHallHistory.replies} />}
                                   </div>
                                  </div>
                               </div>
                           </>
                          ),
                      )
                    :  <div className="flex flex-col space-y-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[400px]" />
                      <Skeleton className="h-4 w-[350px]" />
                      <Skeleton className="h-4 w-[300px]" />
                    </div>
                  </div>
                }
            </div>
        </div>
    );
};

