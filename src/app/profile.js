import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar";
import { appConfig } from '../config/app';
import { AnonAvatar } from "@/components/ui/social";
import { totalPaywallEarnedByAddress, getPaywallLeaderboard, getNFTAvatarLink, getContactNameIfExist } from '../utils/utils';
import { DefaultavatarsmallIcon, DefaultavatarIcon, GraphchartIcon} from "@/components/ui/social";
import localforage from 'localforage';

import copy from 'copy-to-clipboard';

export default function ProfilePanel({ address, avatarLink, xecBalance, latestAvatars }) {
    const [paywallRevenueXec, setPaywallRevenueXec] = useState('');
    const [paywallRevenueCount, setPaywallRevenueCount] = useState('');
    const [paywallLeaderboard, setPaywallLeaderboard] = useState('');
    const [contactList, setContactList] = useState('');

    useEffect(() => {
        (async () => {
          console.log('loading paywall.js')
            const paywallTxs = await localforage.getItem(appConfig.localpaywallTxsParam);

            if (paywallTxs !== null) {
              const paywallResponse = totalPaywallEarnedByAddress(address, paywallTxs);
              setPaywallRevenueXec(paywallResponse.xecEarned);
              setPaywallRevenueCount(paywallResponse.unlocksEarned);
              //setPaywallLeaderboard(getPaywallLeaderboard(paywallTxs));
              let contactList = await localforage.getItem(appConfig.localContactsParam);
              setContactList(contactList);
            }
            console.log('finished loading paywall.js')
        })();
    }, []);

    

    return (
        <button>
  <Sheet>
  <SheetTrigger>
    <Button variant="outline" size="icon" className='mr-2'>
      <DefaultavatarsmallIcon />
    </Button>
  </SheetTrigger>
  <SheetContent className="overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Profile</SheetTitle>
      <SheetDescription>
        Your Profile panel.
      </SheetDescription>
    </SheetHeader>
    <Card className="mt-2">
      <CardHeader>
        <div className="flex items-center">
          <div>
            {avatarLink === false ? (
              <AnonAvatar />
            ) : (
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarLink} alt="User Avatar" />
                <AvatarFallback><DefaultavatarIcon /></AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="ml-3">
            <p className="font-semibold leading-none tracking-tight">Address</p>
            <p className="text-sm text-muted-foreground max-w-lg break-words text-balance leading-relaxed">
              {address ? `${address.substring(0, 11)}...${address.substring(address.length - 5)}` : ''}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle>Balance</CardTitle>
        <CardDescription className="max-w-lg break-words text-balance leading-relaxed">
          {xecBalance} XEC
        </CardDescription>
      </CardContent>
    </Card>
    <Card className="mt-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Income</CardTitle>
        <GraphchartIcon className="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">+{paywallRevenueXec ? paywallRevenueXec : 0} XEC</div>
        <p className="text-xs text-muted-foreground">Total Paywall Revenue Earned</p>
      </CardContent>
    </Card>
    <Card className="mt-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Unlocks</CardTitle>
        <GraphchartIcon className="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">+{paywallRevenueCount ? paywallRevenueCount : 0}</div>
        <p className="text-xs text-muted-foreground">Total Paywall Unlocks Earned</p>
      </CardContent>
    </Card>
    {/*
    <Card className="mt-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top 10 paywall earners by unlocks</CardTitle>
        <GraphchartIcon className="text-muted-foreground" />
      </CardHeader>
      <CardContent className="text-sm">
        {paywallLeaderboard && paywallLeaderboard.length > 0 && paywallLeaderboard.map((earner) => (
          <div key={earner[0]} className="flex items-center mt-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={getNFTAvatarLink(earner[0], latestAvatars)} alt="User Avatar" />
              <AvatarFallback>
                <DefaultavatarIcon />
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-semibold leading-none tracking-tight"
                onClick={() => copy(earner[0])}
              >{getContactNameIfExist(earner[0], contactList)}</p>
              <p className="text-sm text-muted-foreground max-w-lg break-words text-balance leading-relaxed">{earner[1]} unlocks</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
    */}
  </SheetContent>
</Sheet>
        </button>
    )
};
