"use client";
import React, { useState, useEffect } from 'react';
import { getNfts, nftTxListener, addAvatar, updateAvatars } from '../chronik/chronik';
import Image from "next/image";
import { appConfig } from '../config/app';
import localforage from 'localforage';
import { Modal } from "flowbite-react";
import { encodeBip21NftShowcase, formatDate } from '../utils/utils';
import { Button } from "@/components/ui/button";
import { MagicIcon} from "@/components/ui/social";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { toast } from 'react-toastify';

export default function Nft( { chronik, address, isMobile, setLatestAvatars } ) {
    const [nftParents, setNftParents] = useState([]);
    const [nftChilds, setNftChilds] = useState([]);
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
                        tokenName: 'Miscellaneous NFTs',
                        tokenTicker: '',
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
            setNftChilds(chatCache.childNftList);
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

    // Constructs the new avatar object and updated avatar array
    const setAvatar = async (nftId) => {
        const latestAvatars = await localforage.getItem(appConfig.localAvatarsParam);
        const newAvatar = {
            address: address,
            link: `${appConfig.tokenIconsUrl}/64/${nftId}.png`,
        }
        latestAvatars.push(newAvatar);

        try {
            await addAvatar(latestAvatars, newAvatar);
            setShowNftModal(false);
            toast(`Avatar updated, refreshing app`);
            updateAvatars(setLatestAvatars);
            setTimeout(function (){
                window.location.reload();
            }, 2000);
        } catch (err) {
            console.log('Error setting NFT as avatar', err.message);
        }
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

        const childNftsObjsOwned = [];
        for (const thisChildNft of childNftObjs) {
            const childNftOwnedByWallet = nftChilds.find(nft => nft.token.tokenId === thisChildNft.tokenId);
            if (typeof childNftOwnedByWallet !== 'undefined') {
                childNftsObjsOwned.push(thisChildNft);
            }
        }

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
                            {childNftsObjsOwned && childNftsObjsOwned.length > 0 && childNftsObjsOwned.map((childNftObj, index) => (
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
                                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" variant="outline">
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { nftShowCasePost(childNftObj.tokenId, '') }}>
                                Post to townhall
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setAvatar(childNftObj.tokenId) }}>
                                Set as avatar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-end mt-10">
                            <Button variant="secondary" onClick={() => { setShowNftModal(false) }}>
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
                <Button
                    type="button"
                >
                    Mint NFTs on cashtab
                </Button>
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
                            <CardTitle>{nftParent.genesisInfo.tokenName} {nftParent.genesisInfo.tokenTicker}</CardTitle>
                            <CardDescription>{nftParent.tokenId !== 0 && `Url: ${nftParent.genesisInfo.url}`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <img
                                src={nftParent.tokenId === 0 ? '/ecash-chat-logo.png' : `${appConfig.tokenIconsUrl}/256/${nftParent.tokenId}.png`}
                                width={256}
                                height={256}
                                className="rounded-lg object-cover"
                                alt={`icon for ${nftParent.tokenId}`}
                            />
                            {nftParent.tokenId !== 0 && (<p className="text-sm font-medium leading-none mt-4">Supply: {nftParent.genesisSupply} NFTs</p>)}
                            {nftParent.tokenId !== 0 && (<p className="text-sm font-medium leading-none">Created: {formatDate(nftParent.genesisOutputScripts.timeFirstSeen, navigator.language)}</p>)}
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
