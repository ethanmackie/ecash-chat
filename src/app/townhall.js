"use client";
import  React, { useState, useEffect } from 'react';
import { appConfig } from '../config/app';
import { Textarea, Tooltip, Avatar, Popover, Accordion, Alert } from "flowbite-react";
import { opReturn as opreturnConfig } from '../config/opreturn';
import { isValidPost, isValidReplyPost } from '../validation/validation';
import { Button } from "@/components/ui/button";
import { AnonAvatar, ShareIcon, ReplyIcon, EmojiIcon, PostIcon } from "@/components/ui/social";
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
import { encodeBip21Message, encodeBip21Post, encodeBip21ReplyPost } from '../utils/utils';
import { getTxHistory, getReplyTxDetails, parseChronikTx, txListener } from '../chronik/chronik';
import copy from 'copy-to-clipboard';
import { toast } from 'react-toastify';
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
const chronik = new ChronikClientNode(chronikConfig.urls);

export default function TownHall({ address, isMobile }) {
    const [townHallHistory, setTownHallHistory] = useState('');
    const [post, setPost] = useState('');
    const [postError, setPostError] = useState(false);
    const [replyPost, setReplyPost] = useState('');
    const [replyPostError, setReplyPostError] = useState(false);
    const [renderEmojiPicker, setRenderEmojiPicker] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');

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

    // Validate the reply post content length
    const handleReplyPostChange = e => {
        const { value } = e.target;
        if (isValidReplyPost(value) === true) {
            setReplyPost(value);
            setReplyPostError(false);
        } else {
            setReplyPostError(`Post must be between 0 - ${opreturnConfig.townhallReplyPostByteLimit} bytes`);
        }
    };

    // Validate the post content length
    const handlePostChange = e => {
        const { value } = e.target;
        if (isValidPost(value) === true) {
            setPost(value);
            setPostError(false);
        } else {
            setPostError(`Post must be between 0 - ${opreturnConfig.townhallPostByteLimit} bytes`);
        }
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
        // Encode the op_return post script
        const opReturnRaw = encodeBip21Post(post);

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
        txListener(chronik, address, "Townhall reply sent", getTownhallHistoryByPage);
    };

    // Pass a XEC tip tx BIP21 query string to cashtab extensions
    const sendXecTip = (recipient, tipAmount) => {
        // Encode the op_return message script
        const opReturnRaw = encodeBip21Message(`XEC tip from ${address}`);
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

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center py-5 lg:px-8">
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
                              <button className="rounded bg-indigo-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[url]https://www...[/url]')}>
                                  Embed Url
                              </button>
                          </Tooltip>
                          <Tooltip content="e.g. [img]https://i.imgur.com/YMjGMzF.jpeg[/img]" style="light">
                              <button className="rounded bg-indigo-500 px-4 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[img]url[/img]')}>
                                  Embed Image
                              </button>
                          </Tooltip>
                          <Tooltip content="e.g. [yt]5RuYKxKCAOA[/yt]" style="light">
                              <button className="rounded bg-indigo-500 px-4 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[yt]youtube-video-id[/yt]')}>
                                  Embed Youtube
                              </button>
                          </Tooltip>
                          <Tooltip content="e.g. [twt]1762780466976002393[/twt]" style="light">
                              <button className="rounded bg-indigo-500 px-4 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[twt]tweet-id[/twt]')}>
                                  Embed Tweet
                              </button>
                          </Tooltip>
                      </div><br />
                      <button
                        type="button"
                        disabled={post === '' || postError}
                        className="flex w-full justify-center rounded bg-indigo-500 px-2 py-2 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={() => { sendPost() }}
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
                                   <div className="flex flex-col w-full max-w-[550px] break-all leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700 shadow-2xl transition-transform transform hover:scale-110">
                                   <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-semibold text-gray-900 dark:text-white">
                                      <span>
                                         {tx.replyAddress === address ? (
                                             <>
                                             <div className="flex items-center gap-4">
                                                 <AnonAvatar/>
                                                 <div className="font-medium dark:text-white">
                                                     <div onClick={() => {
                                                         copy(tx.replyAddress);
                                                         toast(`${tx.replyAddress} copied to clipboard`);
                                                     }}
                                                     >This Wallet</div>
                                                 </div>
                                             </div>
                                             </>
                                         ) :
                                           (<>
                                             <span>
                                                <div className="flex items-center gap-4">
                                                    <AnonAvatar/>
                                                    <div className="font-medium dark:text-white">
                                                        <div onClick={() => {
                                                            copy(tx.replyAddress);
                                                            toast(`${tx.replyAddress} copied to clipboard`);
                                                        }}>
                                                            {tx.replyAddress.substring(0,10)} ... {tx.replyAddress.substring(tx.replyAddress.length - 5)}
                                                        </div>
                                                    </div>
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
                                                                Tip XEC
                                                            </button>
                                                          </Popover>

                                                 </div>
                                             </span>
                                           </>)
                                         }
                                      </span>
                                   </div>
                                   {/* If this post was a reply to another */}
                                   {tx.replyTxid !== false && (
                                        <p>Replying to ...
                                            <a href={appConfig.blockExplorerUrl+'/tx/'+tx.replyTxid} target="_blank">
                                                {tx.replyTxid.substring(tx.replyTxid.length - 15)}
                                            </a>
                                        </p>
                                   )}

                                   {/* Render the op_return message */}
                                   <p className="text-m font-normal py-2.5 text-gray-900 dark:text-white" key={index}>{tx.opReturnMessage ? `${tx.opReturnMessage}` : ' '}</p>

                                   {/* Render any media content within the message */}
                                   {tx.imageSrc !== false && (<img src={tx.imageSrc} />)}
                                   {tx.videoId !== false && (<LiteYouTubeEmbed id={tx.videoId} />)}
                                   {tx.tweetId !== false && (<Tweet id={tx.tweetId} />)}
                                   {tx.url !== false && (<Alert color="info"><a href={tx.url} target="_blank" >{tx.url}</a></Alert>)}

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

