"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import TxHistory from './txhistory';
import Townhall from './townhall';
import cashaddr from 'ecashaddrjs';
import { queryAliasServer } from '../alias/alias-server';
import { encodeBip21Message } from '../utils/utils';
import { isMobileDevice } from '../utils/mobileCheck';
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
import { Tooltip, Tabs } from "flowbite-react";
import { HiOutlineMail, HiOutlineNewspaper } from "react-icons/hi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { PiHandCoins } from "react-icons/pi";
import { GiDiscussion } from "react-icons/gi";

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
    };

    const CreditCardHeader = () => {
        return (
            <div
                className="w-96 h-56 m-auto bg-red-100 rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110"
                onClick={() => {
                    copy(address);
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
                                    xx,xxx,xxx XEC
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
    <nav className="bg-gradient-to-t border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a
              className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
              href="https://e.cash/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/ecash-square-icon.svg"
                alt="eCash Logo"
                className="dark:invert"
                width={50}
                height={15}
                priority
              />
            </a>

            <button
              type="button"
              className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              alita test
            </button>
            {isLoggedIn === true && (
                <button
                  type="button"
                  className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  onClick={() => setIsLoggedIn(false)}
                >
                  Log Out
                </button>
            )}
        </div>
      </nav>

      <main className="flex min-h-screen flex-col items-left justify-center p-24">

      <div>
        {isLoggedIn === false && isMobile === false && step === 'fresh' && (
        <div>
            <button type="button" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2">
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
            <>
                <p><b>Mobile device detected </b></p>
                <p>Please note eCash Chat is optimized for desktop users as it's integrated with Cashtab Extension.</p><br />
                <p>You can access a read-only view of an address' public onchain messaging history below</p>

                <form className="space-y-6" action="#" method="POST">
                    <div>
                        <div className="mt-2">
                          <Input
                            id="viewAddress"
                            name="viewAddress"
                            type="text"
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
                <button type="button" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2">
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
              <Tabs.Item active title="Inbox" icon={HiOutlineMail}>
                  {cashaddr.isValidCashAddress(address, 'ecash') &&
                      <TxHistory address={address} />
                  }
              </Tabs.Item>

              <Tabs.Item title="Send Message" icon={HiOutlineNewspaper}>
                  <div style={{ display: (isLoggedIn ? 'block' : 'none') }}>
                      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
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
                                  {/* Emoji Picker */}
                                  <Button className="mt-2" type="button" onClick={() => setRenderEmojiPicker(!renderEmojiPicker)}>
                                    {renderEmojiPicker ? 'Hide Emojis' : 'Show Emojis'}
                                  </Button>
                                  <div style={{ display: (renderEmojiPicker ? 'block' : 'none') }}>
                                    <Picker
                                        data={data}
                                        onEmojiSelect={(e) => {
                                            setMessage(String(message).concat(e.native));
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
                                <Button
                                  type="button"
                                  disabled={recipientError || messageError || sendAmountXecError}
                                  className="flex w-full"
                                  onClick={() => {
                                      sendMessage();
                                  }}
                                >
                                  Send
                                </Button>
                              </div>
                          </form>
                   </div>
                </div>
              </Tabs.Item>

              {/* Optional disabling of townhall if we choose to launch with Inbox only first
              <Tabs.Item title="Townhall (Coming Soon)" icon={GiDiscussion} disabled>
                  Town Hall
              </Tabs.Item>
              */}
              <Tabs.Item title="Townhall" icon={GiDiscussion}>
                  <Townhall address={address} />
              </Tabs.Item>

              <Tabs.Item title="Get XEC" icon={PiHandCoins}>
                  Get XEC
              </Tabs.Item>

              <Tabs.Item title="About" icon={IoMdInformationCircleOutline}>
                  About
              </Tabs.Item>

              </Tabs>
              </>
              )}
        </div>
      </main>
    </>
  );
}
