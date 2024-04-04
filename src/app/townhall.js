"use client";
import { useState, useEffect } from 'react';
import { appConfig } from '../config/app';
import { Label, Textarea, Tooltip, Avatar, Popover } from "flowbite-react";
import { opReturn as opreturnConfig } from '../config/opreturn';
import { isValidPost } from '../validation/validation';
import { Button } from "@/components/ui/button"
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
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
import { encodeBip21Message, encodeBip21Post } from '../utils/utils';
import { getTxHistory } from '../chronik/chronik';
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
const chronik = new ChronikClientNode(chronikConfig.urls);

export default function TownHall({ address }) {
    const [townHallHistory, setTownHallHistory] = useState('');
    const [post, setPost] = useState('');
    const [postError, setPostError] = useState(false);
    const [renderEmojiPicker, setRenderEmojiPicker] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');

    useEffect(() => {
        // Render the first page by default upon initial load
        (async () => {
            await getTxHistoryByPage(0);
        })();
    }, []);

    // Retrieves the post history
    const getTxHistoryByPage = async (page) => {
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
    };

    // Pass a XEC tip tx BIP21 query string to cashtab extensions
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

    return (
        <div className="flex min-h-screen flex-col">
            <div className="max-w-md">
              {/* Post input field */}
              <Textarea
                  id="post"
                  value={post}
                  placeholder="Post your thoughts..."
                  required
                  onChange={e => handlePostChange(e)}
                  rows={2}
              />

              {/* Emoji Picker */}
              <Button className="mt-2" type="button" onClick={() => setRenderEmojiPicker(!renderEmojiPicker)}>
                {renderEmojiPicker ? 'Hide Emojis' : 'Show Emojis'}
              </Button>
              <div style={{ display: (renderEmojiPicker ? 'block' : 'none') }}>
                <Picker
                    data={data}
                    onEmojiSelect={(e) => {
                        setPost(String(post).concat(e.native));
                    }}
                />
              </div>

              {/* Tooltip guide for embedding markups */}
              <div className="flex gap-2">
                  <Tooltip content="e.g. [img]https://i.imgur.com/YMjGMzF.jpeg[/img]" style="light">
                      <Button className="mt-2" type="button" onClick={() => insertMarkupTags('[img]url[/img]')}>
                          Embed Image
                      </Button>
                  </Tooltip>
                  <Tooltip content="e.g. [yt]5RuYKxKCAOA[/yt]" style="light">
                      <Button className="mt-2" type="button" onClick={() => insertMarkupTags('[yt]videoId[/yt]')}>
                          Embed Youtube
                      </Button>
                  </Tooltip>
                  <Tooltip content="e.g. [twt]1762780466976002393[/twt]" style="light">
                      <Button className="mt-2" type="button" onClick={() => insertMarkupTags('[twt]tweetId[/twt]')}>
                          Embed Tweet
                      </Button>
                  </Tooltip>
              </div>
              <button
                type="button"
                className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={() => { sendPost() }}
              >
                Post
              </button>
            </div>
            <br /><hr /><br />
            {loadingMsg}

            {/* Townhall Post History */}
            <div>
            {
                townHallHistory &&
                  townHallHistory.txs &&
                    townHallHistory.txs.length > 0
                    ? townHallHistory.txs.map(
                          (tx, index) => (
                            <>
                            <div className="flex items-start gap-2.5" key={"txHistory"+index}>
                               <div className="flex flex-col w-full max-w-[550px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">

                               <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                     {tx.replyAddress === address ? (
                                         <Avatar size="xs">This Wallet</Avatar>
                                     ) :
                                       (<>
                                         <span>
                                         <Avatar size="xs">
                                            {tx.replyAddress.substring(0,10)} ... {tx.replyAddress.substring(tx.replyAddress.length - 5)}
                                         </Avatar>
                                         </span>
                                       </>)
                                     }
                                  </span>
                               </div>

                               {/* Render the op_return message */}
                               <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white" key={index}>{tx.opReturnMessage ? `${tx.opReturnMessage}` : ' '}</p>

                               {/* Render any media content within the message */}
                               {tx.imageSrc !== false && (<img src={tx.imageSrc} />)}
                               {tx.videoId !== false && (<LiteYouTubeEmbed id={tx.videoId} />)}
                               {tx.tweetId !== false && (<Tweet id={tx.tweetId} />)}
                               <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{tx.xecAmount} XEC</span>

                               <div>
                                   <button
                                       type="button"
                                       className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                   >
                                       Reply
                                   </button>

                                     {/* Tip XEC options */}
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
                                 </div>

                                 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                   {tx.isCashtabMessage ? 'Cashtab Message' :
                                      tx.iseCashChatMessage ? 'eCash Chat Message' :
                                          tx.iseCashChatPost ? 'eCash Townhall Post' :
                                           'External Message'
                                   }
                                 
                                 {/* Date and timestamp */}
                                 &nbsp;|&nbsp;{tx.txDate}&nbsp;at&nbsp;{tx.txTime}

                                 {/* Share buttons with other social platforms */}
                                 &emsp;
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
                             </span>
                            </div>
                           </div>
                           <br />
                           </>
                          ),
                      )
                    : `No messages in this range of transactions.`
                
            }
            </div>
        </div>
    );
};

