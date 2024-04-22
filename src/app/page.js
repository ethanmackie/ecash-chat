"use client";
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import TxHistory from './txhistory';
import Townhall from './townhall';
import cashaddr from 'ecashaddrjs';
import Script from 'next/script';
import { queryAliasServer } from '../alias/alias-server';
import { encodeBip21Message } from '../utils/utils';
import { isMobileDevice } from '../utils/mobileCheck';
import { getBalance, txListener } from '../chronik/chronik';
import { appConfig } from '../config/app';
import { isValidRecipient, isValidMessage } from '../validation/validation';
import { opReturn as opreturnConfig } from '../config/opreturn';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import QRCode from "react-qr-code";
import copy from 'copy-to-clipboard';
import { Tooltip, Tabs, Alert } from "flowbite-react";
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
} from "@/components/ui/social";
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
const chronik = new ChronikClientNode(chronikConfig.urls);

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
    const [messageError, setMessageError] = useState(false);
    const [sendAmountXec, setSendAmountXec] = useState(5.5);
    const [sendAmountXecError, setSendAmountXecError] = useState(false);
    const [renderEmojiPicker, setRenderEmojiPicker] = useState(false);
    const [xecBalance, setXecBalance] = useState('Loading...');

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
        if (isValidMessage(value) === true) {
            setMessage(value);
            setMessageError(false);
        } else {
            setMessageError(`Message must be between 0 - ${opreturnConfig.cashtabMsgByteLimit} bytes`);
        }
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
        // Encode the op_return message script
        const opReturnRaw = encodeBip21Message(message);

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
        txListener(chronik, address, "Message", false);
    };

    const CreditCardHeader = () => {
        const cardStyling = isMobile ? "w-94 h-56 m-auto bg-red-100 rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110" :
            "w-96 h-56 m-auto bg-red-100 rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110";
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
                    <div className="flex justify-between">
                        <div className="">
                            <p className="font-light">
                                {/*QR Code*/}
                                {address !== '' && (
                                  <>
                                    <QRCode
                                        value={address}
                                        size={290}
                                        style={{ height: "auto", maxWidth: "25%", width: "25%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                    </>
                                )}
                            </p>
                        </div>
                        <img className="w-14 h-14" src="/ecash-square-icon.svg"/>
                    </div>
                    <div className="pt-1">
                        <p className="font-light">
                            eCash Address
                        </p>
                        <p className="font-medium tracking-more-wider text-xs">
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
    <Script
        strategy="lazyOnload"
        id="google-analytics1"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
    />
    <Script id="google-analytics2" strategy="lazyOnload">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
            page_path: window.location.pathname,
            });
        `}
    </Script>

      <main className="lg:flex lg:flex-col items-center justify-center p-5">

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
              src="/ecash-chat-logo.png"
              alt="eCash Chat Logo"
              className="dark:invert"
              width={500}
              height={150}
              priority
            />
          </a>
          <br />
          </>
      ) : (
        <Image
          src="/ecash-chat-logo.png"
          alt="eCash Chat Logo"
          className="dark:invert"
          width={250}
          height={75}
          priority
        />
      )}

      <div>
        {isLoggedIn === false && isMobile === false && step === 'fresh' && (
        <div>
            <button type="button" className="text-white transition-transform transform hover:scale-110 shadow-2xl bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2">
            Sign in with&emsp;
            <Image
              src="/cashtab-extension.png"
              alt="eCash Extension Logo"
              width={150}
              height={50}
              priority
              onClick={() => getAddress()}
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
          <Tabs aria-label="eCash Chat" style="default">
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
                                          required
                                          onChange={e => handleMessageChange(e)}
                                      />
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
                                                    setMessage(String(message).concat(e.native));
                                                }}
                                            />
                                          </div>
                                          <Tooltip content="e.g. [url]https://i.imgur.com/YMjGMzF.jpeg[/url]" style="light">
                                              <button className="rounded bg-indigo-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[url]https://www...[/url]')}>
                                                  Embed Url
                                              </button>
                                          </Tooltip>
                                          <Tooltip content="e.g. [img]https://i.imgur.com/YMjGMzF.jpeg[/img]" style="light">
                                              <button className="rounded bg-indigo-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[img]url[/img]')}>
                                                  Embed Image
                                              </button>
                                          </Tooltip>
                                          <Tooltip content="e.g. [yt]5RuYKxKCAOA[/yt]" style="light">
                                              <button className="rounded bg-indigo-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[yt]youtube-video-id[/yt]')}>
                                                  Embed Youtube
                                              </button>
                                          </Tooltip>
                                          <Tooltip content="e.g. [twt]1762780466976002393[/twt]" style="light">
                                              <button className="rounded bg-indigo-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" type="button" onClick={() => insertMarkupTags('[twt]tweet-id[/twt]')}>
                                                  Embed Tweet
                                              </button>
                                          </Tooltip>
                                      </div>
                                    </div>
                                    <br />
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">{messageError !== false && messageError}</p>
                                    <label htmlFor="value-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Send XEC amount (optional, 5.5 XEC by default):</label>
                                    <Input
                                        type="number"
                                        id="value-input"
                                        aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        defaultValue="5.5"
                                        onChange={e => handleSendAmountChange(e)}
                                    />
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      disabled={recipientError || messageError || sendAmountXecError || recipient === ''}
                                      className="flex justify-center w-full rounded bg-indigo-500 px-2 py-2 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                      onClick={() => {
                                          sendMessage();
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

              <Tabs.Item title="Townhall" icon={GiDiscussion}>
                  <Townhall address={address} isMobile={isMobile} />
              </Tabs.Item>

              <Tabs.Item title="About" icon={IoMdInformationCircleOutline}>
                  <div className="flex flex-col justify-center py-3">
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
                              <b>Images</b>: Click "Embed Image" to insert the [img]url[/img] tag.<br />
                              Replace the url with the url of the image you're embedding.
                          </li>
                          <li>
                              <b>Videos</b>: Click "Embed Youtube" to insert the [yt]youtube-video-id[/yt] tag.<br />
                              Replace the youtube-video-id between "watch?v=" and the "&" symbol.<br />
                              <img src="/embed-youtube.png"/>
                          </li>
                          <li>
                              <b>Tweets</b>: Click "Embed Tweet" to insert the [twt]tweet-id[/twt] tag.<br />
                              Replace the tweet-id with the id of the tweet.<br />
                              <img src="/embed-tweet.png"/>
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
                      <Alert color="info">Version: 0.3.0</Alert><br />
                      <button
                        type="button"
                        className="rounded bg-indigo-500 px-3 py-3 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
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
                        className="rounded bg-indigo-500 px-3 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      >
                        <div className="flex"><ImageIcon/>&nbsp;Set NFT Profile (Coming soon)</div>
                      </button>
                      <br />
                      <button
                        type="button"
                        className="rounded bg-indigo-500 px-3 py-1 text-m font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
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
