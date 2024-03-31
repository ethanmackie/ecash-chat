"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import TxHistory from './txhistory';
import cashaddr from 'ecashaddrjs';
import { queryAliasServer } from '../alias/alias-server';
import { encodeBip21Message } from '../utils/utils';
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
import { Tooltip } from "flowbite-react";

export default function Home() {
    const [address, setAddress] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    const [contactList, setContactList] = useState([]);

    useEffect(() => {
        // Check whether Cashtab Extensions is installed
        setTimeout(confirmCashtabProviderStatus, 750);

        // Listen for cashtab extension messages on load
        window.addEventListener('message', handleMessage);
    }, []);

    // Parse for an address or contact list from cashtab
    const handleMessage = async (event) => {
        if (
            event &&
            event.data &&
            event.data.type &&
            event.data.type === 'FROM_CASHTAB'
        ) {
            if (event.data.contacts) {
                // If this response is the extension sharing the contact list
                setContactList(event.data.contacts);
            } else {
                // Otherwise this is the extension sharing the address
                getAliasesByAddress(event.data.address);
                setAddress(event.data.address);
                if (event.data.address !== 'Address request denied by user') {
                    setIsLoggedIn(true);
                }
            }
        }
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
    
    // Sends a request to the extension to share the contact list
    const getContacts = () => {
      window.postMessage(
          {
              type: 'FROM_PAGE',
              text: 'Cashtab',
              contactsRequest: true,
          },
          '*',
      );
    };

    const handleAddressChange = async e => {
        const { value } = e.target;
        if (
            isValidRecipient(value) === true &&
            value.trim() !== ''
        ) {
            setRecipient(value);
            setRecipientError(false);
        } else {
            // Check if this invalid eCash address is an alias

            // Extract alias without the `.xec` and check the server for validation
            const aliasName = value.slice(0, value.length - 4);
            // retrieve the alias details for `aliasName` from alias-server
            let aliasDetails;
            try {
                aliasDetails = await queryAliasServer('alias', aliasName);
                if (!aliasDetails.address) {
                    setRecipientError('Invalid eCash address or alias');
                } else {
                    // Valid alias address response returned
                    setRecipient(aliasDetails.address);
                    setRecipientError(false);
                }
            } catch (err) {
                setRecipientError(
                    'Error resolving alias at indexer, contact admin.',
                );
            }
        }
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

            <div className="hidden w-full md:block md:w-auto" id="navbar-default">
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
        </div>
      </nav>

      <main className="flex min-h-screen flex-col items-left justify-center p-24">

      <div>
        {isLoggedIn === false && step === 'fresh' && (
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

        {/* If Cashtab Extension is not installed, render button to install */}
        {isLoggedIn === false && step === 'install' && (
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
        <br />
            <b>User:</b> {address}
            {/*QR Code*/}
            {address !== '' && (
              <>
                &nbsp;<button
                  type="button"
                  id="copy-address-btn"
                  className="rounded bg-indigo-500 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  onClick={() => {
                      copy(address);
                  }}
                >
                  Copy
                </button>
                <QRCode
                    value={address}
                    size={256}
                    style={{ height: "auto", maxWidth: "15%", width: "15%" }}
                    viewBox={`0 0 256 256`}
                />
                </>
            )}
        <br />
            <b>Registered Aliases: </b>
            {aliases.registered && aliases.registered.length > 0 &&
        aliases.registered.map((alias, index) => (
          <Badge key={index} variant="solid" className="mr-1">
            {alias.alias}.xec
          </Badge>
        ))}
      <br />
            <br />
            <b>Pending Aliases: </b>
            {aliases.pending && aliases.pending.length > 0 &&
        aliases.pending.map((alias, index) => (
          <Badge key={index} variant="outline" className="mr-1">
            {alias.alias}.xec
          </Badge>
        ))}
        <br />
        
        <b>Messages:</b>
        <br />
        
        {cashaddr.isValidCashAddress(address, 'ecash') &&
            <TxHistory address={address} />
        }
        </>
        )}
      </div>
      <div style={{ display: (isLoggedIn ? 'block' : 'none') }}>
          <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img
                className="mx-auto h-10 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt="eCash Chat"
              />
              <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Send Message
              </h2>
            </div>

            {/* Render contact list from Cashtab */}
            <div>
                <Button className="mt-2 flex items-center justify-between" type="button" onClick={() => getContacts()}>
                    Get contact list from Cashtab
                </Button>
                {Array.isArray(contactList) && contactList.map(
                    (contact, index) => (<p key={index}>Name: {contact.name} | Address: {contact.address}</p>))
                }
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
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
      </div>
    </main>
    </>
  );
}
