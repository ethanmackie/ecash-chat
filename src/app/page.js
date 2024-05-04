"use client";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import TxHistory from './txhistory';
import Townhall from './townhall';
import cashaddr from 'ecashaddrjs';
import { queryAliasServer } from '../alias/alias-server';
import { encodeBip21Message, getTweetId } from '../utils/utils';
import { isMobileDevice } from '../utils/mobileCheck';
import { getBalance, txListener } from '../chronik/chronik';
import { appConfig } from '../config/app';
import { isValidRecipient, messageHasErrors } from '../validation/validation';
import { opReturn as opreturnConfig } from '../config/opreturn';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import QRCode from "react-qr-code";
import copy from 'copy-to-clipboard';
import { Tooltip, Tabs, Alert, Modal } from "flowbite-react";
import { HiOutlineMail, HiOutlineNewspaper } from "react-icons/hi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { PiHandCoins } from "react-icons/pi";
import { GiDiscussion, GiAbstract010 } from "react-icons/gi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    EmojiIcon,
    SendIcon,
    LogoutIcon,
    ImageIcon,
    AliasIcon,
    EncryptionIcon,
} from "@/components/ui/social";
const crypto = require('crypto');
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
const chronik = new ChronikClientNode(chronikConfig.urls);
import Spline from '@splinetool/react-spline';
import YouTubeVideoId from 'youtube-video-id';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { Tweet } from 'react-tweet';
const packageJson = require('../../package.json');

export default function Home() {
    const [address, setAddress] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [step, setStep] = useState('pending');
    const [aliases, setAliases] = useState({
            registered: [],
            pending: [],
        });
    const [recipient, setRecipient] = useState('');
    const [recipientError, setRecipientError] = useState(false);
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [messageError, setMessageError] = useState(false);
    const [sendAmountXec, setSendAmountXec] = useState(5.5);
    const [sendAmountXecError, setSendAmountXecError] = useState(false);
    const [renderEmojiPicker, setRenderEmojiPicker] = useState(false);
    const [xecBalance, setXecBalance] = useState('Loading...');
    const [encryptionMode, setEncryptionMode] = useState(false);
    const [showMessagePreview, setShowMessagePreview] = useState(false);

    useEffect(() => {
        // Check whether Cashtab Extensions is installed
        setTimeout(confirmCashtabProviderStatus, 750);

        (async () => {
            if (await isMobileDevice() === true) {
                console.log('Mobile device detected');
                setIsMobile(true);
            } else {
                console.log('Desktop detected');
            }
        })();
        // Listen for cashtab extension messages on load
        window.addEventListener('message', handleMessage);
    }, []);

    // Triggered upon change of address i.e. login
    useEffect(() => {
        if (address === '') {
            return;
        }
        (async () => {
            setXecBalance(await getBalance(chronik, address));
        })();
    }, [address]);

    // Parse for an address from cashtab
    const handleMessage = async (event) => {
        if (
            event &&
            event.data &&
            event.data.type &&
            event.data.type === 'FROM_CASHTAB'
        ) {
            getAliasesByAddress(event.data.address);
            setAddress(event.data.address);
            if (event.data.address !== 'Address request denied by user') {
              setIsLoggedIn(true);
            }
        }
    };

    // Parse for a manual address input on mobile and log in via view-only mode
    const viewAddress = async (address) => {
        getAliasesByAddress(address);
        setAddress(address);
        setIsLoggedIn(true);
    };

    // Retrieves the aliases associated with this address
    const getAliasesByAddress = async (thisAddress) => {
        try {
            const aliasesForThisAddress = await queryAliasServer(
                'address',
                thisAddress,
            );
            if (aliasesForThisAddress.error) {
                // If an error is returned from the address endpoint
                throw new Error(aliasesForThisAddress.error);
            }
            setAliases({
                registered: aliasesForThisAddress.registered.sort((a, b) =>
                    a.alias.localeCompare(b.alias),
                ),
                pending: aliasesForThisAddress.pending.sort((a, b) =>
                    a.alias.localeCompare(b.alias),
                ),
            });
        } catch (err) {
            console.log(`getAliasesByAddress(): ${err}`);
        }
    };

    const confirmCashtabProviderStatus = () => {
        const cashTabStatus = getCashtabProviderStatus();
        if (!cashTabStatus) {
            setStep('install');
        } else {
            setStep('fresh');
        }
    };

    const getCashtabProviderStatus = () => {
        console.log(window.bitcoinAbc);
        if (window && window.bitcoinAbc && window.bitcoinAbc === 'cashtab') {
            return true;
        }
        return false;
    };

    // Sends a request to the extension to share the address
    const getAddress = () => {
      window.postMessage(
          {
              type: 'FROM_PAGE',
              text: 'Cashtab',
              addressRequest: true,
          },
          '*',
      );
    };

    const handleAddressChange = e => {
        const { value } = e.target;
        if (
            isValidRecipient(value) === true &&
            value.trim() !== ''
        ) {
            setRecipientError(false);
        } else {
            setRecipientError('Invalid eCash address');
        }
        setRecipient(value);
    };

    const handleMessageChange = e => {
        const { value } = e.target;
        const messageValidation = messageHasErrors(value, encryptionMode);

        if (!messageValidation) {
            // Message validates ok
            setMessageError(false);
        } else {
            setMessageError(messageValidation);
        }
        setMessage(value);
    };

    const handleSendAmountChange = e => {
        const { value } = e.target;
        if (value >= appConfig.dustXec) {
            setSendAmountXec(value);
            setSendAmountXecError(false);
        } else {
            setSendAmountXecError(`Send amount must be at minimum ${appConfig.dustXec} XEC`);
        }
    };

    const insertMarkupTags = tooltipStr => {
        const updatedMsg = String(message).concat(tooltipStr);
        setMessage(updatedMsg);
        handleMessageChange({
            target: {
                value: updatedMsg,
            },
        });
    };

    // Pass a message tx BIP21 query string to cashtab extensions
    const sendMessage = () => {
        let opReturnRaw;

        if (password === '') {
            // Parse the message for any media tags
            let parsedMessage = message;
            // If youtube embedding is present
            if (
                message.includes('[yt]') &&
                message.includes('[/yt]') &&
                !message.includes('youtubeurl') &&
                !message.includes('https://www.youtube.com/shorts/')
            ) {
                const tagStartIndex = message.indexOf('[yt]');
                const tagEndIndex = message.lastIndexOf('[/yt]');
                const remainderMessage = message.substring(0, tagStartIndex) + message.substring(tagEndIndex+5);
                parsedMessage = remainderMessage + '[yt]'+YouTubeVideoId(message)+'[/yt]';
            }

            // If youtube shorts is being embedded
            if (
                message.includes('[yt]') &&
                message.includes('[/yt]') &&
                !message.includes('youtubeurl') &&
                message.includes('https://www.youtube.com/shorts/')
            ) {
                let updatedVideoId;
                let videoId = message.substring(
                    message.indexOf('[yt]') + 4,
                    message.lastIndexOf('[/yt]')
                );
                const tagStartIndex = message.indexOf('[yt]');
                const tagEndIndex = message.lastIndexOf('[/yt]');
                const remainderMessage = message.substring(0, tagStartIndex) + message.substring(tagEndIndex+5);
                parsedMessage = remainderMessage + '[yt]'+videoId.split('https://www.youtube.com/shorts/')[1]+'[/yt]';
            }

            // If tweet embedding is present
            if (
                message.includes('[twt]') &&
                message.includes('[/twt]') &&
                !message.includes('tweeturl')
            ) {
                const tagStartIndex = message.indexOf('[twt]');
                const tagEndIndex = message.lastIndexOf('[/twt]');
                const remainderMessage = message.substring(0, tagStartIndex) + message.substring(tagEndIndex+6);
                parsedMessage = remainderMessage + '[twt]' + getTweetId(message) + '[/twt]';
            }

            opReturnRaw = encodeBip21Message(parsedMessage, false);
        } else {
            // if user opted to encrypt this message
            const cipher = crypto.createCipher('aes-256-cbc', password);
            let encryptedMessage = cipher.update(message, 'utf8', 'hex');
            encryptedMessage += cipher.final('hex');
            opReturnRaw = encodeBip21Message(encryptedMessage, true);
        }

        window.postMessage(
            {
                type: 'FROM_PAGE',
                text: 'Cashtab',
                txInfo: {
                    bip21: `${recipient}?amount=${sendAmountXec}&op_return_raw=${opReturnRaw}`,
                },
            },
            '*',
        );
        setRecipient('');
        setMessage('');
        setPassword('');
        txListener(chronik, address, "Message", false);
    };

    const MessagePreviewModal = () => {
        return (
            <Modal show={showMessagePreview} onClose={() => setShowMessagePreview(false)}>
                <Modal.Header>Message Preview</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            {password !== '' ? (
                                <>
                                    <Alert color="failure" icon={HiInformationCircle}>
                                        &nbsp;&nbsp;<b>Encrypted Message</b><br />
                                        &nbsp;&nbsp;{message.substring(0,40)+'...'}
                                    </Alert>
                                </>
                                ) : (
                                    <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white text-ellipsis break-words min-w-0">
                                        {message}
                                    </p>
                                )
                            }
                            <br />Media Preview:
                            {/* Render any media content within the message */}
                            {message.includes('[img]') && message.includes('[/img]') && (
                                <img src={message.substring(message.indexOf('[img]') + 5, message.lastIndexOf('[/img]'))} />
                            )}
                            {message.includes('[yt]') && message.includes('[/yt]') && !message.includes('https://www.youtube.com/shorts/') && (
                                <LiteYouTubeEmbed id={YouTubeVideoId(message.substring(message.indexOf('[yt]') + 4, message.lastIndexOf('[/yt]')))} />
                            )}
                            {message.includes('[yt]') && message.includes('[/yt]') && message.includes('https://www.youtube.com/shorts/') && (
                                <LiteYouTubeEmbed id={YouTubeVideoId((message.substring(message.indexOf('[yt]') + 4, message.lastIndexOf('[/yt]'))).split('https://www.youtube.com/shorts/')[1])} />
                            )}
                            {message.includes('[twt]') && message.includes('[/twt]') && !message.includes('tweeturl') && (
                                <Tweet id={getTweetId(message)} />
                            )}
                            {message.includes('[url]') && message.includes('[/url]') && (
                                <a href={message.substring(message.indexOf('[url]') + 5, message.lastIndexOf('[/url]'))} target="_blank">
                                    {message.substring(message.indexOf('[url]') + 5, message.lastIndexOf('[/url]'))}
                                </a>
                            )}
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => {
                        setShowMessagePreview(false)
                        sendMessage()
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

    const CreditCardHeader = () => {
        const cardStyling = isMobile 
        ? "w-94 h-56 m-auto bg-red-100 rounded-xl relative text-white shadow-2xl transition all 0.8s cubic-bezier(0.075, 0.82, 0.165, 1) 0s hover:scale-105" 
        : "w-96 h-56 m-auto bg-red-100 rounded-xl relative text-white shadow-2xl transition all 0.8s cubic-bezier(0.075, 0.82, 0.165, 1) 0s hover:scale-105";

        return (
            <div
                className={cardStyling}
                onClick={() => {
                    copy(address);
                    toast(`${address} copied to clipboard`);
                }}
            >
                <img className="relative object-cover w-full h-full rounded-xl" src="/creditcard-bg.png" />
                <div className="w-full px-8 absolute top-8">
                <div className="flex justify-between items-start">
                    <div className="bg-white p-2 rounded-lg" style={{ maxWidth: "3.5rem", maxHeight: "3.5rem", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}>
                        {/*QR Code*/}
                        {address !== '' && (
                            <QRCode
                                value={address}
                                size={88} // Adjust QR code size to fit within 3.5rem x 3.5rem
                                style={{ height: "auto", maxWidth: "100%", maxHeight: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        )}
                    </div>
                        <img className="w-14 h-14" src="/ecash-square-icon.svg"/>
                    </div>
                    <div className="pt-1">
                        <p className="text-base">
                            eCash Address
                        </p>
                        <p className="text-xs">
                            {address}
                        </p>
                    </div>
                    <div className="pt-6 pr-6">
                        <div className="flex justify-between">
                            <div className="">
                                <p className="font-light text-xs">
                                    Balance
                                </p>
                                <p className="font-medium tracking-wider text-sm">
                                    {xecBalance} XEC
                                </p>
                            </div>
                            <div className="">
                                <p className="font-light text-xs text-xs">
                                    Aliases Registered
                                </p>
                                <p className="font-medium tracking-wider text-sm">
                                    {aliases.registered ? aliases.registered.length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

  /* Placeholder UI for now until the Tailwind UI set is ready for implementation */
  return (
    <>
    <ToastContainer />

      <div className="relative">
          <div className="absolute inset-0 noise z-10"></div>
          <div className="fixed inset-0 z-0" style={{ backgroundImage: "url('/bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      </div>

      <main className="lg:flex lg:flex-col items-center justify-center p-5 relative z-10 mt-4">

      {isLoggedIn === false && isMobile === false ? (
          <>
          <br /><br /><br />
          <a
            className="pointer-events-none flex place-items-center"
            href="https://e.cash/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/ecash-chat-new-logo.svg"
              alt="eCash Chat Logo"
              className="dark:invert"
              width={273}
              height={75}
              priority
            />
          </a>
          <br />
          </>
      ) : (
        <Image
          src="/ecash-chat-new-logo.svg"
          alt="eCash Chat Logo"
          className="dark:invert"
          width={273}
          height={75}
          priority
        />
      )}
 
      <div>
        {isLoggedIn === false && isMobile === false && step === 'fresh' && (
        <div>
            <button
                type="button"
                className="text-white transition-transform transform hover:scale-110 shadow-2xl bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
                onClick={() => getAddress()}
            >
            Sign in with&emsp;
            <Image
              src="/cashtab-extension.png"
              alt="eCash Extension Logo"
              width={150}
              height={50}
              priority
            />
            </button>
        </div>
        )}

        {/* Currently this app is not optimized for mobile use as Cashtab Extension is not available on non-desktop platforms */}
        {isMobile === true && isLoggedIn === false && (
            <><br />
                <Alert color="info">
                    <p><b>Mobile device detected </b></p>
                    <p>Please note eCash Chat is optimized for desktop browsers as it is integrated with Cashtab Extensions.</p><br />
                    <p>Mobile users can access the public townhall with limited functionality.</p>
                </Alert>
                <form className="space-y-6" action="#" method="POST">
                    <div>
                        <div className="mt-2">
                          <Input
                            id="viewAddress"
                            name="viewAddress"
                            type="text"
                            placeholder="Enter your eCash address..."
                            value={recipient}
                            required
                            onChange={e => handleAddressChange(e)}
                          />
                        </div>
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">{recipientError !== false && recipientError}</p>

                        <div>
                          <Button
                            type="button"
                            disabled={recipientError || recipient === ''}
                            className="flex w-full"
                            onClick={() => {
                                viewAddress(recipient);
                            }}
                          >
                            View
                          </Button>
                        </div>
                  </div>
              </form>
            </>
        )}

        {/* If Cashtab Extension is not installed, render button to install */}
        {isLoggedIn === false && isMobile === false && step === 'install' && (
            <a href="https://chromewebstore.google.com/detail/cashtab/obldfcmebhllhjlhjbnghaipekcppeag" target="_blank">
                <button type="button" className="text-white transition-transform transform hover:scale-110 shadow-2xl bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2">
                Install &emsp;
                    <Image
                      src="/cashtab-extension.png"
                      alt="eCash Extension Logo"
                      width={150}
                      height={50}
                      priority
                    />
                </button>
            </a>
        )}

        {/* If logged in, render wallet details and message history */}
        {isLoggedIn === true && (
          <>
          {/* Credit card summary */}
          <CreditCardHeader />

          {/* Tab navigation */}
          <Tabs aria-label="eCash Chat" style="default" className='z-10 relative mt-4'>
              {isMobile === false && (
                  <Tabs.Item active title="Inbox" icon={HiOutlineMail}>
                      {cashaddr.isValidCashAddress(address, 'ecash') &&
                          <TxHistory address={address} />
                      }
                  </Tabs.Item>
              )}

              {isMobile === false && (
                  <Tabs.Item title="Send Message" icon={HiOutlineNewspaper}>
                      <div style={{ display: (isLoggedIn ? 'block' : 'none') }}>
                          <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-5 lg:px-8">
                                <MessagePreviewModal />

                                <form className="space-y-6" action="#" method="POST">
                                  <div>
                                    <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                                      Address
                                    </label>
                                    <div className="mt-2">
                                      <Input
                                        id="address"
                                        name="address"
                                        type="text"
                                        value={recipient}
                                        required
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        onChange={e => handleAddressChange(e)}
                                      />
                                    </div>
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">{recipientError !== false && recipientError}</p>
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between">
                                      <label htmlFor="message" className="block text-sm font-medium leading-6 text-gray-900">
                                        Message
                                      </label>
                                    </div>
                                    <div className="mt-2">
                                      <Textarea
                                          id="message"
                                          rows="4"
                                          value={message}
                                          placeholder={encryptionMode ? 'Max. 95 bytes' : 'Max. 215 bytes'}
                                          required
                                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                          onChange={e => handleMessageChange(e)}
                                      />
                                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">{messageError !== false && messageError}</p>
                                      {/* Emoji picker and tooltip guide for embedding markups */}
                                      <div className="flex py-1 gap-2">
                                          {/* Emoji Picker */}
                                          <button className="rounded bg-blue-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => setRenderEmojiPicker(!renderEmojiPicker)}>
                                              <EmojiIcon />
                                          </button>
                                          <div style={{ display: (renderEmojiPicker ? 'block' : 'none') }}>
                                            <Picker
                                                data={data}
                                                onEmojiSelect={(e) => {
                                                    setMessage(String(message).concat(e.native));
                                                }}
                                            />
                                          </div>
                                          <Tooltip content="e.g. [url]https://i.imgur.com/YMjGMzF.jpeg[/url]" style="light">
                                              <button className="rounded bg-blue-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[url]theurl[/url]')}>
                                                  Embed Url
                                              </button>
                                          </Tooltip>
                                          <Tooltip content="e.g. [img]https://i.imgur.com/YMjGMzF.jpeg[/img]" style="light">
                                              <button className="rounded bg-blue-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[img]imageurl[/img]')}>
                                                  Embed Image
                                              </button>
                                          </Tooltip>
                                          <Tooltip content="e.g. [yt]https://www.youtube.com/watch?v=8oIHo0vCZDs[/yt]" style="light">
                                              <button className="rounded bg-blue-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[yt]youtubeurl[/yt]')}>
                                                  Embed Youtube
                                              </button>
                                          </Tooltip>
                                          <Tooltip content="e.g. [twt]https://twitter.com/eCashCommunity/status/1783932847528583665[/twt]" style="light">
                                              <button className="rounded bg-blue-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[twt]tweeturl[/twt]')}>
                                                  Embed Tweet
                                              </button>
                                          </Tooltip>
                                      </div>
                                    </div>
                                    <br />
                                    <label htmlFor="value-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Send XEC amount (optional, 5.5 XEC by default):</label>
                                    <Input
                                        type="number"
                                        id="value-input"
                                        aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        defaultValue="5.5"
                                        onChange={e => handleSendAmountChange(e)}
                                    />
                                    <br />
                                    {/* Encryption mode toggle */}
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value=""
                                            className="sr-only peer"
                                            onClick={() => {
                                                setMessage('')
                                                setEncryptionMode(!encryptionMode)
                                            }}
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        <span className="ms-3 text-sm flex font-medium text-gray-900 dark:text-gray-300"><EncryptionIcon />&nbsp;Encrypt with password (optional):</span>
                                    </label>
                                    {encryptionMode && (
                                        <>
                                            <Input
                                                type="input"
                                                id="password-input"
                                                value={password}
                                                maxlength="19"
                                                aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                placeholder="Set an optional encryption password"
                                                onChange={e => setPassword(e.target.value)}
                                            />
                                        </>
                                    )}
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      disabled={recipientError || messageError || sendAmountXecError || recipient === '' || (encryptionMode && password === '')}
                                      className="flex justify-center w-full rounded bg-blue-500 px-2 py-2 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                      onClick={() => {
                                          setShowMessagePreview(true);
                                      }}
                                    >
                                        <div className="flex"><SendIcon/>&nbsp;Send Message</div>
                                    </button>
                                  </div>
                              </form>
                       </div>
                    </div>
                  </Tabs.Item>
              )}

              <Tabs.Item title="Town Hall" icon={GiDiscussion}>
                  <Townhall address={address} isMobile={isMobile} />
              </Tabs.Item>

              <Tabs.Item title="About" icon={IoMdInformationCircleOutline} >
                  <div className="flex flex-col justify-center py-3 z-10 relative">
                      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">What is eCash Chat?</h2>
                      eCash Chat is an on-chain messaging platform on the eCash blockchain.
                      <br />It filters for specific messaging transactions for a seamless social experience.
                      <br /><br />
                      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Key features:</h2>
                      <ul className="space-y-1 list-disc list-inside">
                          <li>
                              One-click metamask-like login experience
                          </li>
                          <li>
                              Direct wallet to wallet and an all-in townhall forum
                          </li>
                          <li>
                              Message encryption option via AES 256 CBC algorithm
                          </li>
                          <li>
                              Displays only messaging transactions
                          </li>
                          <li>
                              Real time address specific filtering
                          </li>
                          <li>
                              XEC Tipping on addresses
                          </li>
                          <li>
                              Enables embedding of images, videos, tweets and emojis in messages
                          </li>
                          <li>
                              Powered by In-Node Chronik and Cashtab Extensions
                          </li>
                          <li>
                              Integrated with the eCash Alias protocol (coming soon)
                          </li>
                      </ul>
                      <br />
                      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">User guide:</h2>
                      <ul className="space-y-1 list-disc list-inside">
                          <li>
                              <b>Inbox</b>: a direct wallet to wallet messaging history.
                          </li>
                          <li>
                              <b>Send Message</b>: send public messages to another wallet
                          </li>
                          <li>
                              <b>Townhall</b>: public onchain discussion forum
                          </li>
                          <li>
                              <b>Settings</b>: logout and profile configuration
                          </li>
                      </ul>
                      <br />
                      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Embedding media:</h2>
                      <ul className="space-y-1 list-disc list-inside">
                          <li>
                              <b>Urls</b>: Click "Embed Url" to insert the [url]https://www..[/url] tag.<br />
                              Replace the hyperlink with the url you're embedding.
                          </li>
                          <li>
                              <b>Images</b>: Click "Embed Image" to insert the [img]image-url[/img] tag.<br />
                              Replace it with the url of the image you're embedding.
                          </li>
                          <li>
                              <b>Videos</b>: Click "Embed Youtube" to insert the [yt]youtube-url[/yt] tag.<br />
                              Replace it with the url of the youtube video you're embedding.<br />
                          </li>
                          <li>
                              <b>Tweets</b>: Click "Embed Tweet" to insert the [twt]tweet-url[/twt] tag.<br />
                              Replace it with the url of the tweet you're embedding.<br />
                          </li>
                      </ul>
                      <br />
                      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Support:</h2>
                      <ul className="space-y-1 list-disc list-inside">
                          <li>
                              For general support please visit the official <a href="https://t.me/ecash" target="_blank" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">eCash Telegram Channel</a>.
                          </li>
                          <li>
                              For technical references please refer to the <a href="https://github.com/ethanmackie/ecash-chat" target="_blank" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">github repository</a>.
                          </li>
                      </ul>
                  </div>
              </Tabs.Item>

              <Tabs.Item title="Settings" icon={GiAbstract010}>
                  <div className="flex w-80 flex-col py-3">
                      <Alert color="info">Version: {packageJson.version}</Alert><br />
                      <button
                        type="button"
                        className="rounded bg-blue-500 px-3 py-3 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={() => {
                            setIsLoggedIn(false)
                            toast(`Logged out of ${address}`)
                        }}
                      >
                          <div className="flex"><LogoutIcon/>&nbsp;Log Out</div>
                      </button>
                      <br />
                      <button
                        type="button"
                        className="rounded bg-blue-500 px-3 py-1 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      >
                        <div className="flex"><ImageIcon/>&nbsp;Set NFT Profile (Coming soon)</div>
                      </button>
                      <br />
                      <button
                        type="button"
                        className="rounded bg-blue-500 px-3 py-1 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      >
                        <div className="flex"><AliasIcon/>&nbsp;Link eCash Alias (Coming soon)</div>
                      </button>
                  </div>
              </Tabs.Item>

              </Tabs>
              </>
              )}
        </div>
      </main>
  
    </>
  );
}
