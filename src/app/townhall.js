"use client";
import  React, { useState, useEffect, useRef } from 'react';
import { appConfig } from '../config/app';
import { Tooltip, Alert, Modal } from "flowbite-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { postHasErrors, replyHasErrors, isValidRecipient } from '../validation/validation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar";
import {
    PostIcon,
    YoutubeIcon,
    DefaultavatarIcon,
    ReplieduseravatarIcon,
    IdCardIcon,
    MuteIcon,
} from "@/components/ui/social";
import { PersonIcon, FaceIcon, Link2Icon, ImageIcon, TwitterLogoIcon as UITwitterIcon, ChatBubbleIcon, Share1Icon, Pencil1Icon } from '@radix-ui/react-icons';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Tweet } from 'react-tweet';
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    getPaginatedHistoryPage,
    encodeBip21Message,
    encodeBip21Post,
    encodeBip21ReplyPost,
    encodeBip2XecTip,
    getTweetId,
    getContactNameIfExist,
    RenderTipping,
    isExistingContact,
    muteNewContact,
} from '../utils/utils';
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { addNewContact } from '../utils/utils';
import localforage from 'localforage';

export default function TownHall({ address, isMobile }) {
    const [townHallHistory, setTownHallHistory] = useState(''); // current history rendered on screen
    const [fullTownHallHistory, setFullTownHallHistory] = useState(''); // full history array
    const [post, setPost] = useState('');
    const [postError, setPostError] = useState(false);
    const [replyPost, setReplyPost] = useState('');
    const [replyPostError, setReplyPostError] = useState(false);
    const [renderEmojiPicker, setRenderEmojiPicker] = useState(false);
    const [showMessagePreview, setShowMessagePreview] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [maxPagesToShow, setMaxPagesToShow] = useState(7); // default 7 here
    const [contactList, setContactList] = useState('');
    const [contactListName, setContactListName] = useState('');
    const newReplierContactNameInput = useRef('');
    const [curateByContacts, setCurateByContacts] = useState(false);
    const [muteList, setMuteList] = useState('');

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
        // Check whether townhall history is cached
        (async () => {
            await refreshContactList();
            const townhallCache = await localforage.getItem(appConfig.localTownhallCacheParam);
            // If cache exists, set initial render to cached history
            if (townhallCache && townhallCache.txs && Array.isArray(townhallCache.txs) && townhallCache.txs.length > 0) {
                setFullTownHallHistory(townhallCache);
                getTownhallHistoryByPage(0, true, townhallCache, curateByContacts);
            }

            // Subsequent refresh based on on-chain source
            await getTownhallHistoryByPage(0);
        })();
    }, [muteList]);

    const refreshContactList = async () => {
        let contactList = await localforage.getItem(appConfig.localContactsParam);
        setContactList(contactList);
    };

    // Refreshes the post history via chronik
    const getTownhallHistoryByPage = async (
        pageNum = 0,
        localLookup = false,
        townhallCache = false,
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
            // if townhallCache was passed in from useEffect, use it as the source of truth for local lookup
            let localFullTownHallHistory = townhallCache ? townhallCache : fullTownHallHistory;

            // If the user opts to curate content by contacts only
            if (curateByContacts === true) {
                const contactOnlyTownHallHistoryTxs = [];
                for (const tx of localFullTownHallHistory.txs) {
                    let txByContact = contactList.find(
                        contact => contact.address === tx.replyAddress,
                    );
                    // if a match was found
                    if (typeof txByContact !== 'undefined') {
                        contactOnlyTownHallHistoryTxs.push(tx);
                    }
                }
                localFullTownHallHistory.txs = contactOnlyTownHallHistoryTxs;
            }

            // Remove posts from muted users
            const totalTxlHistoryTxsInclMuted = [];
            for (const tx of localFullTownHallHistory.txs) {
                let txByContact = mutedList.find(
                    contact => contact.address === tx.replyAddress,
                );
                // if a match was not found
                if (typeof txByContact === 'undefined') {
                    totalTxlHistoryTxsInclMuted.push(tx);
                }
            }
            localFullTownHallHistory.txs = totalTxlHistoryTxsInclMuted;

            const selectedPageHistory = getPaginatedHistoryPage(
                localFullTownHallHistory.txs,
                pageNum,
            );

            setTownHallHistory({
                txs: selectedPageHistory,
                numPages: localFullTownHallHistory.numPages,
                replies: localFullTownHallHistory.replies,
            });
        } else {
            const txHistoryResp = await getTxHistory(chronik, appConfig.townhallAddress, pageNum);
            if (txHistoryResp && Array.isArray(txHistoryResp.txs)) {
                const firstPageHistory = getPaginatedHistoryPage(
                    txHistoryResp.txs,
                    pageNum,
                );

                setTownHallHistory({
                    txs: firstPageHistory,
                    numPages: txHistoryResp.numPages,
                    replies: txHistoryResp.replies,
                });
                setFullTownHallHistory(txHistoryResp);
                await localforage.setItem(appConfig.localTownhallCacheParam, txHistoryResp);
            }
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
        txListener(chronik, address, "Townhall post", appConfig.dustXec, appConfig.townhallAddress, getTownhallHistoryByPage);
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
        txListener(chronik, address, "Townhall reply", appConfig.dustXec, appConfig.townhallAddress, getTownhallHistoryByPage);
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

    // Handle the checkbox to curate posts from contacts only
    const handleCurateByContactsChange = async (newState) => {
        setCurateByContacts(newState);
        const townhallCache = await localforage.getItem(appConfig.localTownhallCacheParam);
        if (newState === true) {
            await refreshContactList();
            setCurrentPage(0);
            await getTownhallHistoryByPage(
                0,
                true, // filter on local cache only
                townhallCache,
                true, // flag for contact filter
            );
        } else {
            setCurrentPage(0);
            await getTownhallHistoryByPage(
                0,
                true, // filter on local cache only
                townhallCache,
                false,
            );
        }
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

        txListener(chronik, address, "Townhall XEC tip", tipAmount, recipient, getTownhallHistoryByPage);
    };

    // Lookup and render any corresponding replies
    const RenderReplies = ( { txid, replies } ) => {
        const foundReplies = replies.filter(replyTx => replyTx.replyTxid === txid);

        // If this post (i.e. txid) has no reply, don't bother rendering a reply component
        if (foundReplies.length === 0) {
            return;
        }

        return (
            <Accordion type="single" defaultValue="item-1" collapsible>
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="flex-none hover:no-underline mx-auto inline-flex mb-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-primary-background shadow h-9 px-4 py-2">
                    Hide Replies&nbsp;
                </AccordionTrigger>
                <AccordionContent className="border-b-0">
                    {foundReplies.map(
                        (foundReply, index) => (
                            <>
                                <div className="flex flex-col break-words space-y-1.5 hover:shadow-md border gap-2 mt-2 w-full leading-1.5 p-6 rounded-xl bg-card text-card-foreground shadow dark:bg-gray-700 transition-transform transform">
                                    <div className="flex justify-between items-center w-full" key={"townhallReply"+index}>
                                    <div className="flex items-center gap-2">
                                        {foundReply.senderAvatarLink === false ? (
                                            <ReplieduseravatarIcon />
                                        ) : (
                                            <Avatar className="h-9 w-9">
                                            <AvatarImage src={foundReply.senderAvatarLink} alt="User Avatar" />
                                            <AvatarFallback><DefaultavatarIcon/></AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            className="font-medium dark:text-white"
                                            onClick={() => {
                                            copy(foundReply.replyAddress);
                                            toast(`${foundReply.replyAddress} copied to clipboard`);
                                            }}
                                        >
                                            <Badge className="leading-7 shadow-sm hover:bg-accent [&:not(:first-child)]:mt-6 py-3px" variant="outline" >
                                                {getContactNameIfExist(foundReply.replyAddress, contactList)}
                                            </Badge>
                                        </div>
                                        <RenderTipping address={foundReply.replyAddress} sendXecTip={sendXecTip}/>

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
                                               <p className="text-sm text-muted-foreground break-words max-w-96">
                                                   Input contact name for <br />{foundReply.replyAddress}
                                               </p>
                                           </div>
                                           <div className="py-2">
                                               <Input
                                                   id="addContactName"
                                                   name="addContactName"
                                                   type="text"
                                                   ref={newReplierContactNameInput}
                                                   placeholder="New contact name"
                                                   className="bg-gray-50"
                                                   maxLength="30"
                                               />
                                               <Button
                                                   type="button"
                                                   disabled={newReplierContactNameInput?.current?.value === ''}
                                                   className="mt-2"
                                                   onClick={e => {
                                                       addNewContact(newReplierContactNameInput?.current?.value, foundReply.replyAddress, refreshContactList);
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
                    )}
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        );
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:min-w-[576px]">
            <MessagePreviewModal />
              <>
                <div className="max-w-xl w-full mx-auto overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
                    {/* Post input field */}
                    <Textarea
                      className="bg-white resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                          id="post"
                          value={post}
                          placeholder="Post your thoughts to the public town hall..."
                          required
                          onChange={e => handlePostChange(e)}
                          rows={4}
                    />
                    <p className="text-sm text-red-600 px-3 dark:text-red-500">{postError !== false && postError}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-2 p-3 pt-0">

                        {/* this is icons, buttons on left */}
                        <div className="flex gap-2 mb-2 sm:mb-0">
                        <Popover>
                        <PopoverTrigger>
                            <Button variant="ghost" onClick={() => setRenderEmojiPicker(!renderEmojiPicker)}>
                                <FaceIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-0 h-0 p-0"> 
                            <Picker
                                data={data}
                                onEmojiSelect={(e) => {
                                    setPost(post + e.native);
                                }}
                            />
                        </PopoverContent>
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
                        onClick={() => { isMobile ? sendPost() : setShowMessagePreview(true) }}
                        >
                        <PostIcon className="mr-1" />Post
                        </Button>
                        </div>
                    </div>
                </>
             <Separator className="my-2" />
            {/* Townhall Post History */}

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
                        Only show posts by your contacts
                    </Label>
                </div>
            </div>

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
                                getTownhallHistoryByPage(Math.max(0, currentPage - 1), true, false, curateByContacts);
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
                                    getTownhallHistoryByPage(i, true, false, curateByContacts);
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
                                getTownhallHistoryByPage(Math.min(townHallHistory.numPages - 1, currentPage + 1), true, false, curateByContacts);
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
                                   <div className="flex flex-col max-w-xl gap-2 break-words hover:shadow w-full leading-1.5 p-6 rounded-2xl border bg-card text-card-foreground shadow-sm dark:bg-gray-700 transition-transform transform">
                                   <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-semibold text-gray-900 dark:text-white">
                                      <span>
                                         {tx.replyAddress === address ? (
                                             <>
                                           <div className="flex items-center gap-2">
                                                {tx.senderAvatarLink === false ? (
                                                    <DefaultavatarIcon />
                                                ) : (
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={tx.senderAvatarLink} alt="User Avatar" />
                                                        <AvatarFallback><DefaultavatarIcon/></AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <Badge variant="outline" className="py-3px shadow-sm hover:bg-accent">
                                                    <div className="font-medium leading-7 dark:text-white">
                                                        <div onClick={() => {
                                                            copy(tx.replyAddress);
                                                            toast(`${tx.replyAddress} copied to clipboard`);
                                                        }}>
                                                            Your wallet
                                                        </div>
                                                    </div>
                                                </Badge>
                                            </div>
                                             </>
                                         ) :
                                           (<>
                                             <span>
                                                <div className="flex items-center gap-2">
                                                    {tx.senderAvatarLink === false ? (
                                                        <DefaultavatarIcon/>
                                                    ) : (
                                                        <Avatar className="h-9 w-9">
                                                        <AvatarImage src={tx.senderAvatarLink} alt="User Avatar" />
                                                        <AvatarFallback><DefaultavatarIcon/></AvatarFallback>
                                                       </Avatar>
                                                    )}
                                                    <Badge variant="outline" className="py-3px shadow-sm hover:bg-accent">
                                                    <div className="leading-7 [&:not(:first-child)]:mt-6">
                                                        <div onClick={() => {
                                                            copy(tx.replyAddress);
                                                            toast(`${tx.replyAddress} copied to clipboard`);
                                                        }}>
                                                            {getContactNameIfExist(tx.replyAddress, contactList)}
                                                        </div>
                                                    </div>
                                                    </Badge>

                                                    {/* Tip XEC options */}
                                                    <RenderTipping address={tx.replyAddress} sendXecTip={sendXecTip} />

                                                    {/* Add contact popover to input the new contact name */}
                                                    {isExistingContact(tx.replyAddress, contactList) === false && (
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
                                                               <p className="text-sm text-muted-foreground break-words max-w-96">
                                                                   Input contact name for <br />{tx.replyAddress}
                                                               </p>
                                                           </div>
                                                           <div className="py-2">
                                                               <Input
                                                                   id="addContactName"
                                                                   name="addContactName"
                                                                   type="text"
                                                                   value={contactListName}
                                                                   required
                                                                   placeholder="New contact name"
                                                                   className="bg-gray-50"
                                                                   maxLength="30"
                                                                   onChange={e => setContactListName(e.target.value)}
                                                               />
                                                               <Button
                                                                   type="button"
                                                                   disabled={contactListName === ''}
                                                                   className="mt-2"
                                                                   onClick={e => {
                                                                       addNewContact(contactListName, tx.replyAddress, refreshContactList);
                                                                       setContactListName('');
                                                                   }}
                                                               >
                                                                   Add Contact
                                                               </Button>
                                                           </div>
                                                       </PopoverContent>
                                                   </Popover>
                                                    )}
                                                 </div>

                                                 <div>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="mr-2"
                                                        onClick={e => {
                                                            muteNewContact('Muted user', tx.replyAddress, setMuteList);
                                                        }}
                                                    >
                                                        <MuteIcon className="h-4 w-4" />
                                                    </Button>
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
                                <Popover>
                                <PopoverTrigger>
                                    <Button variant="outline" size="icon" className="mr-2">
                                        <ChatBubbleIcon className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='min-w-96'>
                                    <div >
                                        <div className="space-y-2 ">
                                                <h4 className="font-medium leading-none">Reply to: </h4>
                                                <p className="text-sm text-muted-foreground break-words">
                                                {tx.replyAddress}
                                                </p>
                                            </div>
                                        <div className="py-2">
                                            <Textarea
                                                id="reply-post"
                                                value={replyPost}
                                                placeholder="Post your reply..."
                                                required
                                                onChange={e => handleReplyPostChange(e)}
                                                rows={4}
                                            />
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-500">{replyPostError !== false && replyPostError}</p>
                                            <Button
                                                type="button"
                                                disabled={replyPostError || replyPost === ''}
                                                onClick={e => {
                                                    replytoPost(tx.txid, replyPost)
                                                }}
                                            >
                                                Post Reply
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                                       {/* Share buttons with other social platforms */}
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
                                                <FacebookIcon size={25} round />
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
                                                <TelegramIcon size={25} round />
                                            </TelegramShareButton>
                                        </div>
                                    </PopoverContent>
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

