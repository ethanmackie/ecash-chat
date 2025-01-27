"use client";
import React, { useState, useEffect } from 'react';
import { getNfts, nftTxListener, addAvatar, updateAvatars } from '../chronik/chronik';
import { appConfig } from '../config/app';
import { opReturn as opreturnConfig } from '../config/opreturn';
import localforage from 'localforage';
import { Modal } from "flowbite-react";
import { encodeBip21NftShowcase, formatDate } from '../utils/utils';
import { Button } from "@/components/ui/button";
import { Loader, RefreshCcw } from "lucide-react"
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import 'react-alice-carousel/lib/alice-carousel.css';

export default function Nft( { chronik, address, isMobile, setLatestAvatars } ) {
    const [nftParents, setNftParents] = useState([]);
    const [nftChilds, setNftChilds] = useState([]);
    const [showNftModal, setShowNftModal] = useState(false);
    const [parentNftInFocus, setParentNftInFocus] = useState(null);
    const [fullNfts, setFullNfts] = useState([]);
    const [loader, setLoader] = useState(false);
    const { toast } = useToast();

    const scanWalletForNfts = async () => {
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
        const eccPremiumNfts = [];
        for (const nftChild of chatCache.childNftList) {
            // If this childNft does not have a parentNft in this wallet
            if (!childNftIds.includes(nftChild.token.tokenId)) {
                // Add genesis info to childNft
                const fullNftInfo = await chronik.token(nftChild.token.tokenId);
                nftChild.genesisInfo = fullNftInfo.genesisInfo;
                nftChild.tokenId = fullNftInfo.tokenId;
                if (fullNftInfo.block && fullNftInfo.block.timestamp) {
                    nftChild.standaloneTimestamp = fullNftInfo.block.timestamp;
                }

                if (
                    opreturnConfig.townhallMvpTokenIds.includes(nftChild.token.tokenId) ||
                    opreturnConfig.articleMvpTokenIds.includes(nftChild.token.tokenId)
                ) {
                    eccPremiumNfts.push(nftChild);
                } else {
                    standaloneNfts.push(nftChild);
                }
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
        if (eccPremiumNfts.length > 0) {
            // Set a generic parent collection for the standalone premium ECC NFTs
            const standaloneEccNftParent = {
                tokenId: 1,
                genesisInfo: {
                    tokenName: 'Premium eCashChat NFTs',
                    tokenTicker: '',
                    url: '',
                },
                genesisOutputScripts: {
                    timeFirstSeen: '',
                },
                genesisSupply: 0,
            };
            chatCache.parentNftList.push(standaloneEccNftParent);

            // Append standalone NFTs under the generic parent
            thisFullNfts.push({
                parentNft: standaloneEccNftParent,
                childNft: eccPremiumNfts,
            });
        }

        setFullNfts(thisFullNfts);
        setNftParents(chatCache.parentNftList);
        setNftChilds(chatCache.childNftList);
    }

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
            toast({
                title: '✅Updated',
                description: `Avatar updated, refreshing app`,
              });
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
                                className="transition-shadow shadow-none duration-300 ease-in-out hover:shadow-sm hover:bg-slate-50"
                                >
                                    <CardHeader>
                                        <CardTitle>{childNftObj.genesisInfo.tokenName} ({childNftObj.genesisInfo.tokenTicker})</CardTitle>
                                        <CardDescription>
                                            <p>Created: {childNftObj.block && childNftObj.block.timestamp ? formatDate(childNftObj.block.timestamp, navigator.language) : formatDate(childNftObj.standaloneTimestamp, navigator.language)}</p>
                                            <p>Price: N/A</p>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <img
                                            src={opreturnConfig.townhallMvpTokenIds.includes(childNftObj.tokenId) || opreturnConfig.articleMvpTokenIds.includes(childNftObj.tokenId) ? `${appConfig.tokenIconsUrl}/${childNftObj.tokenId}.gif` : `${appConfig.tokenIconsUrl}/256/${childNftObj.tokenId}.png`}
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
            <div class="flex items-center">
            <a href="https://cashtab.com/#/etokens" target="_blank">
                <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                >
                    Mint NFTs
                </Button>
            </a>
            <a href="https://cashtab.com/#/nfts" target="_blank">
                <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                >
                    Trade NFTs
                </Button>
            </a>
            </div>
            <br />
            <Button 
              onClick={async () => {
                setLoader(true)
                await scanWalletForNfts();
                setLoader(false)
              }}
            >
              {loader 
                ? <Loader className="h-4 w-4 animate-spin" />
                : <RefreshCcw className="h-4 w-4" />}
              &nbsp;Retrieve NFTs from wallet
            </Button>
            {loader && (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-[400px]" />
                <Skeleton className="h-4 w-[350px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            )}
            {fullNfts && Array.isArray(fullNfts) && fullNfts.length > 0 && (
                <div>
                    <Carousel className="w-full max-w-sm">
                        <CarouselContent>
                            {nftParents && nftParents.length > 0 && nftParents.map(
                                (nftParent, index) => (
                                    <>
                                    <CarouselItem key={index} className="lg:basis-1/2">
                                        <Card
                                            key={'nftParent'+index}
                                            onClick={() => {
                                                setParentNftInFocus(nftParent);
                                                setShowNftModal(true);
                                            }}
                                            className="transition-shadow shadow-none duration-300 ease-in-out hover:shadow-lg hover:bg-slate-50"
                                        >
                                            <CardHeader>
                                                <CardTitle>
                                                    <span className="text-sm break-word">
                                                        {nftParent.genesisInfo.tokenName} {nftParent.genesisInfo.tokenTicker}
                                                    </span>
                                                </CardTitle>
                                                <CardDescription>
                                                    {nftParent.tokenId !== 0 && (
                                                        <span className="break-all">
                                                            Url: {nftParent.genesisInfo.url}
                                                        </span>
                                                    )}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="items-center justify-center">
                                                <img
                                                    src={nftParent.tokenId === 1 && nftParent.genesisInfo.tokenName === 'Premium eCashChat NFTs' ? '/eccNFTParent.jpeg' : nftParent.tokenId === 0 ? '/ecash-chat-logo.png' : `${appConfig.tokenIconsUrl}/256/${nftParent.tokenId}.png`}
                                                    width={256}
                                                    height={256}
                                                    className="rounded-lg object-cover"
                                                    alt={`icon for ${nftParent.tokenId}`}
                                                />
                                                {nftParent.tokenId !== 0 && (<p className="text-sm font-medium leading-none mt-4">Supply: {nftParent.genesisSupply} NFTs</p>)}
                                                {nftParent.tokenId !== 0 && (<p className="text-sm font-medium leading-none">Created: {nftParent.block && nftParent.block.timestamp && formatDate(nftParent.block.timestamp, navigator.language)}</p>)}
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                    </>
                                )
                            )}
                            <RenderChildNfts />
                            </CarouselContent>
                            <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            )}
        </div>
    );
};
