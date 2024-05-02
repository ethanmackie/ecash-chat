"use client";
import  React, { useState, useEffect } from 'react';
import { appConfig } from '../config/app';
import { Textarea, Tooltip, Avatar, Popover, Accordion, Alert, Modal } from "flowbite-react";
import { opReturn as opreturnConfig } from '../config/opreturn';
import { postHasErrors, replyHasErrors } from '../validation/validation';
import { Button } from "@/components/ui/button";
import { AnonAvatar, ShareIcon, ReplyIcon, EmojiIcon, PostIcon } from "@/components/ui/social";
import { PersonIcon } from '@radix-ui/react-icons';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Tweet } from 'react-tweet';
import { HiInformationCircle } from "react-icons/hi";
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

export default function TownHall({ address, isMobile }) {
    const [townHallHistory, setTownHallHistory] = useState('');
    const [post, setPost] = useState('');
    const [postError, setPostError] = useState(false);
    const [replyPost, setReplyPost] = useState('');
    const [replyPostError, setReplyPostError] = useState(false);
    const [renderEmojiPicker, setRenderEmojiPicker] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [showMessagePreview, setShowMessagePreview] = useState(false);

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

        setLoadingMsg('Retrieving data from Chronik, please wait.');
        const txHistoryResp = await getTxHistory(chronik, appConfig.townhallAddress, page);
        if (txHistoryResp && Array.isArray(txHistoryResp.txs)) {
            setTownHallHistory(txHistoryResp);
        }
        setLoadingMsg('');
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

        window.postMessage(
            {
                type: 'FROM_PAGE',
                text: 'Cashtab',
                txInfo: {
                    bip21: `${appConfig.townhallAddress}?amount=${appConfig.dustXec}&op_return_raw=${opReturnRaw}`,
                },
            },
            '*',
        );
        setPost('');
        txListener(chronik, address, "Townhall post sent", getTownhallHistoryByPage);
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
        }

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
        setReplyPost('');
        txListener(chronik, address, "Townhall reply sent", getTownhallHistoryByPage);
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
                        Looks good
                    </Button>
                    <Button color="gray" onClick={() => setShowMessagePreview(false)}>
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

        txListener(chronik, address, "Townhall XEC tip sent", getTownhallHistoryByPage);
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
                    <div className="flex flex-col break-words space-y-1.5 w-full max-w-[590px] leading-1.5 p-6 rounded-xl bg-card text-card-foreground shadow dark:bg-gray-700 transition-transform transform">
                        <div className="flex items-center gap-4">
                            <PersonIcon/>
                            <div
                                className="font-medium dark:text-white"
                                onClick={() => {
                                    copy(foundReply.replyAddress);
                                    toast(`${foundReply.replyAddress} copied to clipboard`);
                                }}
                            >
                                <Badge variant="outline">
                                    {foundReply.replyAddress.substring(0,10)+'...'+foundReply.replyAddress.substring(foundReply.replyAddress.length - 5)}
                                </Badge>
                            </div>
                        </div>

                        <div className="py-2">
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

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center py-5 lg:px-8">
            <MessagePreviewModal />
            {isMobile && (<Alert color="failure" icon={HiInformationCircle}>Limited functionality mode</Alert>)}
            {isMobile === false && (
              <>
                <div>
                      {/* Post input field */}
                      <Textarea
                          id="post"
                          value={post}
                          placeholder="Post your thoughts to the public town hall..."
                          required
                          onChange={e => handlePostChange(e)}
                          rows={4}
                      />
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">{postError !== false && postError}</p>

                      {/* Emoji picker and tooltip guide for embedding markups */}
                      <div className="flex gap-2">
                          {/* Emoji Picker */}
                          <button className="rounded bg-indigo-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => setRenderEmojiPicker(!renderEmojiPicker)}>
                              <EmojiIcon />
                          </button>
                          <div style={{ display: (renderEmojiPicker ? 'block' : 'none') }}>
                            <Picker
                                data={data}
                                onEmojiSelect={(e) => {
                                    setPost(String(post).concat(e.native));
                                }}
                            />
                          </div>
                          <Tooltip content="e.g. [url]https://i.imgur.com/YMjGMzF.jpeg[/url]" style="light">
                              <button className="rounded bg-indigo-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[url]theurl[/url]')}>
                                  Embed Url
                              </button>
                          </Tooltip>
                          <Tooltip content="e.g. [img]https://i.imgur.com/YMjGMzF.jpeg[/img]" style="light">
                              <button className="rounded bg-indigo-500 px-4 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[img]imageurl[/img]')}>
                                  Embed Image
                              </button>
                          </Tooltip>
                          <Tooltip content="e.g. [yt]https://www.youtube.com/watch?v=8oIHo0vCZDs[/yt]" style="light">
                              <button className="rounded bg-indigo-500 px-4 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[yt]youtubeurl[/yt]')}>
                                  Embed Youtube
                              </button>
                          </Tooltip>
                          <Tooltip content="e.g. [twt]https://twitter.com/eCashCommunity/status/1783932847528583665[/twt]" style="light">
                              <button className="rounded bg-indigo-500 px-4 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[twt]tweeturl[/twt]')}>
                                  Embed Tweet
                              </button>
                          </Tooltip>
                      </div><br />
                      <button
                        type="button"
                        disabled={post === '' || postError}
                        className="flex w-full justify-center rounded bg-indigo-500 px-2 py-2 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={() => { setShowMessagePreview(true) }}
                      >
                          <div className="flex"><PostIcon/>&nbsp;Post to Townhall</div>
                      </button>
                </div>
              <br />
            </>
            )}
            <hr /><br />
            {loadingMsg !== '' && (<Alert color="info">{loadingMsg}</Alert>)}

            {/* Townhall Post History */}

                {/*Set up pagination menu*/}
                <br />
                Scan recent townhall posts{'   '}<br />

                <span>Page:
                <nav aria-label="Page navigation example">
                   <ul className="inline-flex -space-x-px text-base h-10">
                      {(() => {
                          let page = [];
                          for (let i = 0; i < townHallHistory.numPages; i += 1) {
                            page.push(
                              <li key={"Page"+i}>
                                <a href={"#"} onClick={() => getTownhallHistoryByPage(i)} className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
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

            <div>
            {
                townHallHistory &&
                  townHallHistory.txs &&
                    townHallHistory.txs.length > 0
                    ? townHallHistory.txs.map(
                          (tx, index) => (
                            <>
                                <div className="flex items-start gap-2.5" key={"txHistory"+index}>
                                   <div className="flex flex-col break-words space-y-1.5 w-full max-w-[590px] leading-1.5 p-6 rounded-xl border bg-card text-card-foreground shadow dark:bg-gray-700 transition-transform transform">
                                   <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-semibold text-gray-900 dark:text-white">
                                      <span>
                                         {tx.replyAddress === address ? (
                                             <>
                                             <div className="flex items-center gap-4">
                                                 <PersonIcon/>
                                                 <Badge variant="outline">
                                                 <div className="font-medium dark:text-white">
                                                     <div onClick={() => {
                                                         copy(tx.replyAddress);
                                                         toast(`${tx.replyAddress} copied to clipboard`);
                                                     }}
                                                     >This Wallet</div>
                                                 </div>
                                                 </Badge>
                                             </div>
                                             </>
                                         ) :
                                           (<>
                                             <span>
                                                <div className="flex items-center gap-4">
                                                    <PersonIcon/>
                                                    <Badge variant="outline">
                                                    <div className="font-medium dark:text-white">
                                                        <div onClick={() => {
                                                            copy(tx.replyAddress);
                                                            toast(`${tx.replyAddress} copied to clipboard`);
                                                        }}>
                                                            {tx.replyAddress.substring(0,10)}...{tx.replyAddress.substring(tx.replyAddress.length - 5)}
                                                        </div>
                                                    </div>
                                                    </Badge>
                                                    {/* Tip XEC options */}
                                                    &nbsp;

                                                        <Popover
                                                          aria-labelledby="default-popover"
                                                          content={
                                                            <div className="w-50 text-sm text-gray-500 dark:text-gray-400">
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
                                                                Tip
                                                            </button>
                                                          </Popover>

                                                 </div>
                                             </span>
                                           </>)
                                         }
                                      </span>
                                   </div>

                                   {/* Render the op_return message */}
                                   <p className="text-m font-normal px-2 py-2.5 text-gray-900 dark:text-white" key={index}>{tx.opReturnMessage ? `${tx.opReturnMessage}` : ' '}</p>

                                   {/* Render any media content within the message */}
                                   {tx.imageSrc !== false && (<img src={tx.imageSrc} />)}
                                   {tx.videoId !== false && (<LiteYouTubeEmbed id={tx.videoId} />)}
                                   {tx.tweetId !== false && (<Tweet id={tx.tweetId} />)}
                                   <p className="line-clamp-1">
                                      {tx.url !== false && (<Alert color="info"><a href={tx.url} target="_blank" >{tx.url}</a></Alert>)}
                                   </p>
                                   {/* Date and timestamp */}
                                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                      &emsp;{tx.txDate}&nbsp;at&nbsp;{tx.txTime}
                                   </span>

                                   {/* Reply action to a townhall post */}
                                   <div>
                                       <br />
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
                                                     required
                                                     onChange={e => handleReplyPostChange(e)}
                                                     rows={2}
                                                 />
                                                 <p className="mt-2 text-sm text-red-600 dark:text-red-500">{replyPostError !== false && replyPostError}</p>
                                                 <button
                                                   type="button"
                                                   disabled={replyPostError || replyPost === ''}
                                                   className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                                   onClick={e => {
                                                       replytoPost(tx.txid, replyPost)
                                                   }}
                                                 >
                                                   Post Reply
                                                 </button>
                                             </div>
                                           </div>
                                         }
                                       >
                                         <button type="button">
                                             <ReplyIcon/>
                                         </button>
                                       </Popover>

                                       {/* Share buttons with other social platforms */}
                                       &emsp;

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
                                         <button type="button">
                                             <ShareIcon />
                                         </button>
                                       </Popover>
                                       <br /><br />
                                            {/* Render corresponding replies for this post */}
                                            {<RenderReplies txid={tx.txid} replies={townHallHistory.replies} />}
                                   </div>
                                  </div>
                               </div>

                                <br />
                           </>
                          ),
                      )
                    : `...`
                
            }
            </div>
        </div>
    );
};

