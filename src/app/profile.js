import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet";
import { appConfig } from '../config/app';
import { AnonAvatar } from "@/components/ui/social";
import { totalPaywallEarnedByAddress } from '../utils/utils';
import localforage from 'localforage';

export default function ProfilePanel({ address, avatarLink }) {
    const [paywallRevenueXec, setPaywallRevenueXec] = useState('');
    const [paywallRevenueCount, setPaywallRevenueCount] = useState('');

    useEffect(() => {
        (async () => {
            const paywallTxs = await localforage.getItem(appConfig.localpaywallTxsParam);
            const paywallResponse = totalPaywallEarnedByAddress(address, paywallTxs);
            setPaywallRevenueXec(paywallResponse.xecEarned);
            setPaywallRevenueCount(paywallResponse.unlocksEarned);
        })();
    }, []);

    return (
        <button>
        <Sheet>
        <SheetTrigger>Profile</SheetTrigger>
        <SheetContent>
            <SheetHeader>
            <SheetDescription>
                 <br />
                {avatarLink === false ? (
                    <AnonAvatar />
                ) : (
                    <img src={avatarLink}></img>
                )}<br />

                Address: {address} <br /><br />

                Total Paywall Revenue Earned: {paywallRevenueXec} XEC <br /><br />

                Total Paywall Unlocks Earned: {paywallRevenueCount} <br /><br />

            </SheetDescription>
            </SheetHeader>
        </SheetContent>
        </Sheet>
        </button>
    )
};
