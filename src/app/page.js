"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import TxHistory from './txhistory';
import Townhall from './townhall';
import Nft from './nft';
import Article from './article';
import cashaddr from 'ecashaddrjs';
import { queryAliasServer } from '../alias/alias-server';
import { encodeBip21Message, getTweetId } from '../utils/utils';
import { isMobileDevice } from '../utils/mobileCheck';
import { txListener, refreshUtxos, txListenerOngoing, getArticleListing } from '../chronik/chronik';
import { appConfig } from '../config/app';
import { isValidRecipient, messageHasErrors } from '../validation/validation';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import QRCode from "react-qr-code";
import copy from 'copy-to-clipboard';
import { Tooltip, Tabs, Alert, Modal, Popover } from "flowbite-react";
import { HiOutlineMail, HiOutlineNewspaper, HiInformationCircle, HiOutlinePhotograph } from "react-icons/hi";
import { BiSolidNews } from "react-icons/bi";
import { GiDiscussion, GiAbstract010 } from "react-icons/gi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import { PersonIcon, FaceIcon, ImageIcon, TwitterLogoIcon as UITwitterIcon, Link2Icon, RocketIcon } from '@radix-ui/react-icons';
import 'react-toastify/dist/ReactToastify.css';
import { YoutubeIcon, DefaultavatarIcon, EcashchatIcon, LoadingSpinner, Home3Icon, File3Icon, Nft3Icon, Inbox3Icon, Send3Icon, Info3icon } from "@/components/ui/social";
import {
    SendIcon,
    LogoutIcon,
    EncryptionIcon,
} from "@/components/ui/social";
const crypto = require('crypto');
import { chronik as chronikConfig } from '../config/chronik';
import { ChronikClientNode } from 'chronik-client';
const chronik = new ChronikClientNode(chronikConfig.urls);
import YouTubeVideoId from 'youtube-video-id';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { Tweet } from 'react-tweet';
const packageJson = require('../../package.json');
import localforage from 'localforage';
import xecMessage from 'bitcoinjs-message';
import * as utxolib from '@bitgo/utxo-lib';

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
    const [signature, setSignature] = useState('');
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [messageError, setMessageError] = useState(false);
    const [sendAmountXec, setSendAmountXec] = useState(5.5);
    const [sendAmountXecError, setSendAmountXecError] = useState(false);
    const [renderEmojiPicker, setRenderEmojiPicker] = useState(false);
    const [xecBalance, setXecBalance] = useState('Loading...');
    const [encryptionMode, setEncryptionMode] = useState(false);
    const [showMessagePreview, setShowMessagePreview] = useState(false);
    const [sharedArticleTxid, setSharedArticleTxid] = useState(false);
    const searchParams = useSearchParams();
    const [openSaveLoginModal, setOpenSaveLoginModal] = useState(false);
    const [savedLogin, setSavedLogin] = useState(false);
    const [showLoadingSpinner, setShowLoadingSpinner] = useState(true);

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

        (async () => {
            const savedLoginAddress = await localforage.getItem('savedLoginAddress');
            if (isValidRecipient(savedLoginAddress)) {
                setSavedLogin(savedLoginAddress);
                setAddress(savedLoginAddress);
                setIsLoggedIn(true);
            }
        })();
        setShowLoadingSpinner(false);

        (async () => {
            const latestArticles = await getArticleListing();
            await localforage.setItem(appConfig.localArticlesParam, latestArticles);
        })();

        // Check if this app is accessed via a shared article link
        const sharedArticleParam = searchParams.get("sharedArticleTxid");
        if (sharedArticleParam) {
            setSharedArticleTxid(sharedArticleParam);
        }

        // Listen for cashtab extension messages on load
        window.addEventListener('message', handleMessage);

    }, []);

    // Triggered upon change of address i.e. login
    useEffect(() => {
        if (address === '') {
            return;
        }
        (async () => {
            const updatedCache = await refreshUtxos(chronik, address);
            setXecBalance(updatedCache.xecBalance);
        })();

        if (!savedLogin) {
            setOpenSaveLoginModal(true);
        }

        // Listens for all mempool events for this address and silently
        // updates XEC balance in the background
        txListenerOngoing(chronik, address, setXecBalance);
    }, [address]);

    // Parse for an address from cashtab
    const handleMessage = async (event) => {
        if (
            event &&
            event.data &&
            event.data.type &&
            event.data.type === 'FROM_CASHTAB'
        ) {
            if (event.data.address !== 'Address request denied by user') {
                //getAliasesByAddress(event.data.address);
                setAddress(event.data.address);
                setIsLoggedIn(true);
            }
        }
    };

    // Parse for a manual address input on mobile and log in via view-only mode
    const viewAddress = async (address) => {
        //getAliasesByAddress(address);
        setAddress(address);
        setIsLoggedIn(true);
    };

    // Checks whether the mobile user's address matches their signature
    const verifySignature = () => {
        let verification;

        try {
            verification = xecMessage.verify(
                'ecashchat',
                cashaddr.toLegacy(recipient),
                signature,
                utxolib.networks.ecash.messagePrefix,
            );
        } catch (err) {
            toast.error(`${err}`);
        }
        if (verification) {
            setOpenSaveLoginModal(true);
            viewAddress(recipient);
        } else {
            toast.error(`Signature does not match address`);
        }
    };

    // Saves the verified login address to local storage to avoid needing to login again
    const saveLoginAddressToLocalStorage = async () => {
        await localforage.setItem('savedLoginAddress', address);
        toast(`Login info saved for ${address}`);
        setOpenSaveLoginModal(false);
    }

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
        txListener(chronik, address, "Message", sendAmountXec, recipient, false);
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
                        Send
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
        ? "w-94 h-56 max-w-md mx-auto break-words bg-blue-500 rounded-xl relative text-white shadow-2xl transition all 0.8s cubic-bezier(0.075, 0.82, 0.165, 1) 0s hover:scale-105" 
        : "w-96 h-56 max-w-md mx-auto break-words bg-blue-500 rounded-xl relative text-white shadow-2xl transition all 0.8s cubic-bezier(0.075, 0.82, 0.165, 1) 0s hover:scale-105";

        return (
            <div
                className={cardStyling}
                onClick={() => {
                    copy(address);
                    toast(`${address} copied to clipboard`);
                }}
            >
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
                    <div className="pt-4">
                        <p className="font-medium tracking-wider text-sm">
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

    const RenderSaveLoginModal = () => {
        return (
            <AlertDialog open={openSaveLoginModal} onOpenChange={setOpenSaveLoginModal}>
                <AlertDialogTrigger asChild>
                    <button className="hidden">Open</button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Save login details?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Saving login details will reduce the number of times you're asked to login.<br />
                        Please ensure you're the only person who uses this device.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <Button
                        onClick={() => setOpenSaveLoginModal(false)}
                        variant="outline"
                            >
                            Don't save login
                    </Button>
                    <Button
                        onClick={() => {
                        saveLoginAddressToLocalStorage();
                        }}
                    >
                        Save login
                    </Button>
                    
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
          )
    };

    return (
        <>
        <ToastContainer />

        {openSaveLoginModal === true && (
            <RenderSaveLoginModal />
        )}

        <div className="sm:flex flex-col items-center justify-center p-5 relative z-10 mt-4">
        <div className="background_content"></div>
        </div>
        <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
        className="absolute inset-x-0 -top-10 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-40"
        aria-hidden="true"
        >
        <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a1c0ff] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
            clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
        />
        </div>
        <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%+20rem)]"
        aria-hidden="true"
        >
        <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
            clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
        />
        </div>
        </div>

        <header className="fixed mt-4 flex top-0 z-50 w-full justify-center ">
          <div className="container flex items-center justify-between rounded-lg flex bg-black w-full h-14 mx-4 md:mx-auto md:max-w-xl lg:max-w-3xl border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/40">
            <div className="sm:flex">
              <a className="flex items-center space-x-2" href="#">
                <EcashchatIcon />
                <span className="font-bold sm:inline-block">
                eCashChat 
                </span>
              </a>
            </div>
            <div className="sm:flex">
                <nav className="flex items-center gap-6 text-sm">
                </nav>
            </div>

            {(isMobile && isLoggedIn) ? (
            <div>
                <Button
                onClick={async () => {
                    setIsLoggedIn(false);
                    setSavedLogin(false);
                    await localforage.setItem('savedLoginAddress', false);
                    toast(`Logged out of ${address}`);
                }}
                variant="outline"
                >
                Logout
                </Button>
            </div>
            ) : (
            !isMobile && (
                <div>
                <Button
                    onClick={isLoggedIn ? async () => {
                    setIsLoggedIn(false);
                    setSavedLogin(false);
                    await localforage.setItem('savedLoginAddress', false);
                    toast(`Logged out of ${address}`);
                    } : () => getAddress()}
                    variant="outline"
                >
                    {isLoggedIn ? 'Logout' : 'Signin'}
                </Button>
                </div>
            )
            )}
            </div>
        </header>
        
      <main className="sm:flex flex-col items-center justify-center p-1 sm:px-5 relative z-10">
      {isLoggedIn === false && isMobile === false ? (
        <>
            <div className="mx-auto max-w-xl mb-4 mt-8">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative flex gap-1 items-center rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/40">
                <RocketIcon/> Version: {packageJson.version}{' '}
                </div>
            </div>
            <div className="text-center">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-4xl">
                {'Socialize, monetize and earn on the eCash blockchain'}
                </h1>
            </div>
            </div>
        
        </>
        ) : (
            <div className="flex justify-center">
            </div>
        )}

    {showLoadingSpinner && (
        <div className="flex justify-center">
        <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
        </div>
    )}

      <div>
       {isLoggedIn === false && isMobile === false && step === 'fresh' && (
        <div className='flex justify-center'>
            <button
               type="button"
               className="text-white transition-transform transform hover:scale-105 bg-blue-500 hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55"               
               onClick={() => getAddress()}
            >
            Sign in with&emsp;
            <Image
              src="/cashtab-extension.png"
              alt="eCash Extension Logo"
              width={120}
              height={40}
              priority
            />
            </button>
        </div>
        )}

        {isLoggedIn === false && isMobile === false && (
            <div className='mx-auto mt-4 '>
            <Image
                src="/landingp1.png"
                alt="groupchat"
                width={800}
                height={400}
                priority
            />
            </div>
        )}

        {/* Currently this app is not optimized for mobile use as Cashtab Extension is not available on non-desktop platforms */}
        {isMobile === true && isLoggedIn === false && (
            <><br />
            <div className="px-4">
                <Alert color="info">
                    <br />
                    <p><b>Mobile device detected </b></p>
                    <p>Please use your wallet to sign an <b>'ecashchat'</b> message via <a href='https://cashtab.com/#/signverifymsg' target='_blank'>Cashtab</a> and input the signature below for verification.</p><br />
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
                        <div className="mt-2">
                          <Input
                            id="viewSignature"
                            name="viewSignature"
                            type="text"
                            placeholder="Enter your signature..."
                            value={signature}
                            required
                            onChange={e => setSignature(e.target.value)}
                          />
                        </div>
                        <div>
                          <Button
                            type="button"
                            disabled={recipientError || recipient === '' || signature === ''}
                            className="flex w-full"
                            onClick={() => {
                                verifySignature();
                            }}
                          >
                            Login
                          </Button>
                        </div>
                  </div>
              </form>
              </div>
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
          <Tabs aria-label="eCash Chat" style="default" className='z-10 focus:ring-0 relative mt-4 justify-center'>
              {isMobile === false && (
                  <Tabs.Item title="Inbox" icon={Inbox3Icon}>
                      {cashaddr.isValidCashAddress(address, 'ecash') &&
                          <TxHistory address={address} />
                      }
                  </Tabs.Item>
              )}

              {isMobile === false && (
                  <Tabs.Item title="Send" className='focus:ring-0' f icon={Send3Icon} >
                      <div style={{ display: (isLoggedIn ? 'block' : 'none') }}>
                          <div className="flex min-h-full flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:min-w-[576px] min-w-96">
                                <MessagePreviewModal />
                                <form className="space-y-0 w-full mx-auto max-w-xl" action="#" method="POST">
                                  <div>
                                    <div className="mt-2">
                                      <Input
                                        id="address"
                                        name="address"
                                        type="text"
                                        value={recipient}
                                        required
                                        placeholder="to:address"
                                        className="bg-gray-50"
                                        onChange={e => handleAddressChange(e)}
                                      />
                                    </div>
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{recipientError !== false && recipientError}</p>
                                  </div>

                                  <div>
                                    <div className="mt-2">
                                        <Textarea
                                          id="message"
                                          rows="4"
                                          value={message}
                                          placeholder={encryptionMode ? 'Your message, Max. 95 bytes' : 'Your message, Max. 215 bytes'}
                                          required
                                          className="bg-gray-50"
                                          onChange={e => handleMessageChange(e)}
                                        />
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">{messageError !== false && messageError}</p>
                                        {/* Emoji picker and tooltip guide for embedding markups */}
                                        <div className="flex py-1 gap-2">
                                            {/* Emoji Picker */}
                                            <Popover
                                                aria-labelledby="emoji-popover"
                                                content={
                                                    <div>
                                                    <Picker
                                                        data={data}
                                                        onEmojiSelect={(e) => {
                                                        setMessage(prevMessage => prevMessage.concat(e.native));
                                                        }}
                                                    />
                                                    </div>
                                                }
                                                >
                                                <Button variant="ghost" type="button">
                                                    <FaceIcon /> 
                                                </Button>
                                                </Popover>
                                            <Tooltip content="e.g. [url]https://i.imgur.com/YMjGMzF.jpeg[/url]" style="light">
                                                <Button
                                               variant="ghost"
                                                type="button"
                                                onClick={() => insertMarkupTags('[url]theurl[/url]')}
                                                >
                                                    <Link2Icon/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="e.g. [img]https://i.imgur.com/YMjGMzF.jpeg[/img]" style="light">
                                                <Button
                                                variant="ghost"
                                                type="button"
                                                onClick={() => insertMarkupTags('[img]imageurl[/img]')}
                                                >
                                                     <ImageIcon/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="e.g. [yt]https://www.youtube.com/watch?v=1234[/yt]" style="light">
                                                <Button
                                               variant="ghost"
                                                type="button"
                                                onClick={() => insertMarkupTags('[yt]youtubeurl[/yt]')}
                                                >
                                                      <YoutubeIcon/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="e.g. [twt]https://x.com/yourid/status/1234[/twt]" style="light">
                                                <Button
                                               variant="ghost"
                                                type="button"
                                                onClick={() => insertMarkupTags('[twt]tweeturl[/twt]')}
                                                >
                                                    <UITwitterIcon/>
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>     
                                    <div className="grid w-full items-center gap-1.5 mt-4">                       
                                    <Label htmlFor="value-input">Send XEC amount (optional, 5.5 XEC by default):</Label>
                                    <Input
                                        type="number"
                                        id="value-input"
                                        aria-describedby="helper-text-explanation" className="bg-gray-50"
                                        defaultValue="5.5"
                                        onChange={e => handleSendAmountChange(e)}
                                    />                
                                      </div>       
                                    {/* Encryption mode toggle */}
                                    <label className="inline-flex items-center cursor-pointer mt-4">
                                        <Input
                                            type="checkbox"
                                            value=""
                                            className="sr-only peer"
                                            onClick={() => {
                                                setMessage('')
                                                setEncryptionMode(!encryptionMode)
                                            }}
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        <span className="ml-2 gap-1 flex items-center text-sm font-medium text-gray-900 dark:text-gray-300">
                                        <EncryptionIcon />
                                        Encrypt with password (optional):
                                        </span>
                                    </label>
                                    {encryptionMode && (
                                        <>
                                            <Input
                                                type="input"
                                                id="password-input"
                                                value={password}
                                                maxlength="19"
                                                aria-describedby="helper-text-explanation" className="bg-gray-50"
                                                placeholder="Set an optional encryption password"
                                                onChange={e => setPassword(e.target.value)}
                                            />
                                        </>
                                    )}
                                  </div>
                                  <div>
                                        <Button
                                            type="button"
                                            disabled={recipientError || messageError || sendAmountXecError || recipient === '' || (encryptionMode && password === '')}
                                            className="w-full mt-2 mb-20"
                                            onClick={() => { setShowMessagePreview(true); }}
                                            >
                                            <SendIcon/>&nbsp;Send Message
                                        </Button>
                                  </div>
                              </form>
                       </div>
                    </div>
                  </Tabs.Item>
              )}

              <Tabs.Item title="Town Hall" icon={Home3Icon} >
                  <Townhall address={address} isMobile={isMobile} />
              </Tabs.Item>

              <Tabs.Item title="Articles" active icon={File3Icon} >
                <Article chronik={chronik} address={address} isMobile={isMobile} sharedArticleTxid={sharedArticleTxid} />
              </Tabs.Item>

              <Tabs.Item title="NFTs" icon={Nft3Icon} >
                  <Nft chronik={chronik} address={address} isMobile={isMobile} />
              </Tabs.Item>

              <Tabs.Item title="About" icon={Info3icon} >
              <div className="flex min-h-full flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:min-w-[576px] min-w-96">
                      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">What is eCash Chat?</h2>
                      <p className='leading-7 [&:not(:first-child)]:mt-6'>eCash Chat is an on-chain web platform that enables anyone to socialize,
                      <br />monetize and earn on the eCash blockchain.</p>
                      <br />
                      <h2 className="mt-4 scroll-m-20 text-2xl font-semibold tracking-tight">Key features:</h2>
                      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                        <li>One-click metamask-like login experience</li>
                        <li>Direct wallet to wallet and an all-in townhall forum</li>
                        <li>Full length blogging facility with paywall option</li>
                        <li>Message encryption option via AES 256 CBC algorithm</li>
                        <li>NFT Showcases</li>
                        <li>Displays only messaging transactions</li>
                        <li>Real time address specific filtering</li>
                        <li>XEC Tipping on addresses</li>
                        <li>Enables embedding of images, videos, tweets and emojis in messages</li>
                        <li>Powered by In-Node Chronik and Cashtab Extensions</li>
                        <li>Integrated with the eCash Alias protocol (coming soon)</li>
                      </ul>
                      <br />
                      <h2 className="mt-4 scroll-m-20 text-2xl font-semibold tracking-tight">User guide:</h2>
                      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                          <li><b>Inbox</b>: a direct wallet to wallet messaging history.</li>
                          <li><b>Send Message</b>: send public messages to another wallet</li>
                          <li><b>Townhall</b>: public onchain discussion forum</li>
                          <li><b>Articles</b>: write full length articles with paywall option</li>
                          <li><b>NFTs</b>: browse and showcase your NFTs</li>
                      </ul>
                      <br />
                      <h2 className="mt-4 scroll-m-20 text-2xl font-semibold tracking-tight">Support:</h2>
                      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                          <li>
                              For general support please visit the official <a href="https://t.me/ecash" target="_blank" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">eCash Telegram Channel</a>.
                          </li>
                          <li>
                              For technical references please refer to the <a href="https://github.com/ethanmackie/ecash-chat" target="_blank" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">github repository</a>.
                          </li>
                      </ul>
                      <div className='mx-auto mb-4'>
                      <Image
                        src="/groupchat.svg"
                        alt="groupchat"
                        width={400}
                        height={400}
                        priority
                        />
                        </div>
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
