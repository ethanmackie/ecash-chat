"use client";
import React, { useState, useEffect } from 'react';
import { getNfts, nftTxListener } from '../chronik/chronik';
import Image from "next/image";
import { appConfig } from '../config/app';
import localforage from 'localforage';
import { Card, Modal } from "flowbite-react";
import { formatDate } from "../utils/utils";
import { encodeBip21NftShowcase } from '../utils/utils';

export default function Nft( { chronik, address, isMobile } ) {
    const [nftParents, setNftParents] = useState([]);
    const [showNftModal, setShowNftModal] = useState(false);
    const [parentNftInFocus, setParentNftInFocus] = useState(null);
    const [fullNfts, setFullNfts] = useState([]);

    useEffect(() => {
        (async () => {
            const chatCache = await localforage.getItem('chatCache');
            if (!chatCache || !chronik || typeof chatCache === 'undefined') {
                return;
            }

            // Retrieve Child NFTs for each parent
            const thisFullNfts = [];
            const childNftIds = [];
            for (const nftParent of chatCache.parentNftList) {
                const childNfts = await getNfts(chronik, nftParent.tokenId);
                for (const childNft of childNfts) {
                    childNftIds.push(childNft.tokenId);
                }
                thisFullNfts.push({
                    parentNft: nftParent,
                    childNft: childNfts,
                });
            }

            // Add any standlone child NFTs
            const standaloneNfts = [];
            for (const nftChild of chatCache.childNftList) {
                // If this childNft does not have a parentNft in this wallet
                if (!childNftIds.includes(nftChild.token.tokenId)) {
                    // Add genesis info to childNft
                    const fullNftInfo = await chronik.token(nftChild.token.tokenId);
                    nftChild.genesisInfo = fullNftInfo.genesisInfo;
                    nftChild.tokenId = fullNftInfo.tokenId;
                    standaloneNfts.push(nftChild);
                }
            }
            if (standaloneNfts.length > 0) {
                // Set a generic parent collection for the standalone child NFTs
                const standaloneNftParent = {
                    tokenId: 0,
                    genesisInfo: {
                        tokenName: 'Miscellaneous Collection',
                        tokenTicker: 'N/A',
                        url: '',
                    },
                    genesisOutputScripts: {
                        timeFirstSeen: '',
                    },
                    genesisSupply: 0,
                };
                chatCache.parentNftList.push(standaloneNftParent);

                // Append standalone NFTs under the generic parent
                thisFullNfts.push({
                    parentNft: standaloneNftParent,
                    childNft: standaloneNfts,
                });
            }
            setFullNfts(thisFullNfts);
            setNftParents(chatCache.parentNftList);
        })();
    }, []);

    // Pass an NFT showcase tx BIP21 query string to cashtab extensions
    const nftShowCasePost = (nftId, showcaseMsg) => {
        // Encode the op_return message script
        const opReturnRaw = encodeBip21NftShowcase(showcaseMsg, nftId);
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
        nftTxListener(chronik, address, "Wallet updated");
    };

    const RenderChildNfts = () => {
        if (!parentNftInFocus) {
            return;
        }

        // Retrieve the child NFTs corresponding to this parent NFT
        const filteredChildNfts = fullNfts.filter(function( obj ) {
            return obj.parentNft.tokenId === parentNftInFocus.tokenId;
        });
        const childNftObjs = filteredChildNfts[0].childNft;

        return (
            <>
                {/* Child NFT modal */}
                <Modal
                    show={showNftModal}
                    onClose={() => {setParentNftInFocus(null)}}
                >
                    <Modal.Header><div className="flex">NFTs in {parentNftInFocus.genesisInfo.tokenName} collection</div></Modal.Header>
                    <Modal.Body>
                        <div className="space-y-6">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                <ul
                                    role="list"
                                    className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
                                >
                                    {childNftObjs && childNftObjs.length > 0 && childNftObjs.map(
                                        (childNftObj, index) => (
                                            <>
                                                <li key={childNftObj.tokenId+index} className="relative">
                                                    <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                                                        <img
                                                            src={`${appConfig.tokenIconsUrl}/256/${childNftObj.tokenId}.png`}
                                                            alt="" className="pointer-events-none object-cover group-hover:opacity-75"
                                                        />
                                                    </div>
                                                    <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{childNftObj.genesisInfo.tokenName} ({childNftObj.genesisInfo.tokenTicker})</p>
                                                    <p className="pointer-events-none block text-sm font-medium text-gray-500">{formatDate(
                                                        childNftObj.timeFirstSeen,
                                                        navigator.language,
                                                    )}</p>
                                                    <p className="pointer-events-none block text-sm font-medium text-gray-500">Price: N/A</p>
                                                    <button type='button' onClick={() => {
                                                        nftShowCasePost(childNftObj.tokenId, '')
                                                    }} className="rounded bg-blue-500 px-2 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                                                        Showcase to Town Hall
                                                    </button>
                                                </li>
                                            </>
                                        )
                                    )}
                                </ul>
                            </p>
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                <button onClick={() => {
                                    setShowNftModal(false)
                                }} className="rounded bg-blue-500 px-2 py-1 text-m font-semibold text-white shadow-sm hover:bg-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                                    Close
                                </button>
                            </p>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        );
    };

    return (
        <div className="flex w-full flex-col py-3 items-center">
            <a href="https://cashtab.com/#/etokens" target="_blank">
                <button
                    type="button"
                    className="text-white transition-transform transform hover:scale-110 shadow-2xl bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-4 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
                >
                    Mint NFTs on&emsp;
                <Image
                    src="/cashtab-logo.png"
                    alt="Cashtab Logo"
                    width={150}
                    height={60}
                    priority
                />
                </button>
            </a>
            <br />
                <div className="grid grid-cols-2 max-w-xl">
                    {nftParents && nftParents.length > 0 && nftParents.map(
                        (nftParent, index) => (
                            <>
                                <Card
                                    href="#"
                                    className="max-w-sm"
                                    onClick={() => {
                                        setParentNftInFocus(nftParent)
                                        setShowNftModal(true)
                                    }}
                                    key={'nftParent'+index}
                                >
                                <img
                                    src={nftParent.tokenId === 0 ? '/ecash-square-icon.svg' : `${appConfig.tokenIconsUrl}/256/${nftParent.tokenId}.png`}
                                    width={256}
                                    height={256}
                                    alt={`icon for ${nftParent.tokenId}`}
                                />
                                    <p className="break-words">
                                        <b className="font-bold tracking-tight text-gray-900 dark:text-white">
                                            {nftParent.genesisInfo.tokenName} ({nftParent.genesisInfo.tokenTicker})<br />
                                                </b>
                                                {nftParent.tokenId !== 0 && (
                                                <>
                                                Url: {nftParent.genesisInfo.url}<br />
                                                Supply: {nftParent.genesisSupply} NFTs<br />
                                                Created: {formatDate(
                                                    nftParent.genesisOutputScripts.timeFirstSeen,
                                                    navigator.language,
                                                )}
                                                </>
                                            )}
                                        <br />
                                    </p>
                                </Card>
                            </>
                        )
                    )}
                    <RenderChildNfts />
                </div>
        </div>
    );
};
