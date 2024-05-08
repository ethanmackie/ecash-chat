"use client";
import React, { useState, useEffect } from 'react';
import { getNfts, nftTxListener } from '../chronik/chronik';
import Image from "next/image";
import { appConfig } from '../config/app';
import localforage from 'localforage';
import { Modal } from "flowbite-react";
import { formatDate } from "../utils/utils";
import { encodeBip21NftShowcase } from '../utils/utils';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

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

            // Retrieve Child NFTs for each known parent
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
                    <Modal.Header>
                        <div className="flex">NFTs in {parentNftInFocus.genesisInfo.tokenName} collection</div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="grid md:grid-cols-2 grid-cols-1 max-w-xl gap-2 mx-auto">
                            {childNftObjs && childNftObjs.length > 0 && childNftObjs.map((childNftObj, index) => (
                                <Card key={childNftObj.tokenId + index}
                                className="transition-shadow duration-300 ease-in-out hover:shadow-lg hover:bg-slate-50"
                                >
                                    <CardHeader>
                                        <CardTitle>{childNftObj.genesisInfo.tokenName} ({childNftObj.genesisInfo.tokenTicker})</CardTitle>
                                        <CardDescription>
                                            <p>First seen: {formatDate(childNftObj.timeFirstSeen, navigator.language)}</p>
                                            <p>Price: N/A</p>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <img
                                            src={`${appConfig.tokenIconsUrl}/256/${childNftObj.tokenId}.png`}
                                            alt=""
                                            className="block w-full h-auto rounded-lg object-cover"
                                        />
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="bg-blue-500 hover:bg-blue-300" onClick={() => { nftShowCasePost(childNftObj.tokenId, '') }}>
                                            Post to townhall
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-end mt-10">
                            <Button className="bg-blue-500 hover:bg-blue-300" onClick={() => { setShowNftModal(false) }}>
                                Close
                            </Button>
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
                <div className="grid grid-cols-2 max-w-xl gap-2">
                    {nftParents && nftParents.length > 0 && nftParents.map(
                        (nftParent, index) => (
                            <>
                       <Card
                        key={'nftParent'+index}
                        onClick={() => {
                            setParentNftInFocus(nftParent);
                            setShowNftModal(true);
                        }}
                        className="transition-shadow duration-300 ease-in-out hover:shadow-lg hover:bg-slate-50"
                    >
                        <CardHeader>
                            <CardTitle>{nftParent.genesisInfo.tokenName} ({nftParent.genesisInfo.tokenTicker})</CardTitle>
                            <CardDescription>{nftParent.tokenId !== 0 && `Url: ${nftParent.genesisInfo.url}`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <img
                                src={nftParent.tokenId === 0 ? '/ecash-square-icon.svg' : `${appConfig.tokenIconsUrl}/256/${nftParent.tokenId}.png`}
                                width={256}
                                height={256}
                                className="rounded-lg object-cover"
                                alt={`icon for ${nftParent.tokenId}`}
                            />
                            <p className="text-sm font-medium leading-none mt-4">Supply: {nftParent.genesisSupply} NFTs</p>
                            <p className="text-sm font-medium leading-none">Created: {formatDate(nftParent.genesisOutputScripts.timeFirstSeen, navigator.language)}</p>
                        </CardContent>
                        <CardFooter>
                        </CardFooter>
                        </Card>
                            </>
                        )
                    )}
                    <RenderChildNfts />
                </div>
        </div>
    );
};
