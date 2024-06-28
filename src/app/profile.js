import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
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
    CardFooter,
  } from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar";
import { appConfig } from '../config/app';
import { AnonAvatar } from "@/components/ui/social";
import { totalPaywallEarnedByAddress } from '../utils/utils';
import { DefaultavatarsmallIcon} from "@/components/ui/social";
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
        <SheetTrigger>
        <Button variant="outline" size="icon" className='mr-2'>
            <DefaultavatarsmallIcon/>
                </Button>
        </SheetTrigger>
        <SheetContent>
            <SheetHeader>
            <SheetDescription>

              <Card className="mt-2"> 
              <CardHeader>
            <div className="flex items-center">
                    <div>
                    {avatarLink === false ? (
                                <AnonAvatar />
                            ) : (
                                <Avatar className="h-9 w-9">
                                <AvatarImage src={avatarLink} alt="User Avatar" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            )}
                    </div>
                    <div className="ml-3">
                    <p className="font-semibold leading-none tracking-tight ">Your Address：</p>
                    <p className="text-sm text-muted-foreground max-w-lg break-words text-balance leading-relaxed">Alitatest</p>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <CardTitle>Your Address：</CardTitle>
                        <CardDescription className="max-w-lg break-words text-balance leading-relaxed">
                        {address}
                        </CardDescription>
                        </CardContent>
                </Card> 

                <Card className="mt-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Incomes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{paywallRevenueXec} XEC</div>
                    <p className="text-xs text-muted-foreground">Total Paywall Revenue Earned</p>
                </CardContent>
                </Card>

                <Card className="mt-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unlocks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{paywallRevenueCount} </div>
                    <p className="text-xs text-muted-foreground">Total Paywall Unlocks Earned</p>
                </CardContent>
                </Card>

            </SheetDescription>
            </SheetHeader>
        </SheetContent>
        </Sheet>
        </button>
    )
};
