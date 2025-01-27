import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { appConfig } from '../config/app';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNFTAvatarLink } from '../utils/utils';
import { updateAvatars } from '../chronik/chronik';
import { DefaultavatarIcon } from "@/components/ui/social";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import localforage from 'localforage';

export default function User() {
    const searchParams = useSearchParams();
    let address = searchParams.get("address");
    const [userAvatarLink, setUserAvatarLink] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (address === null) {
            address = searchParams.get("address");
        }
        (async () => {            
            let latestAvatarsFromStorage = await localforage.getItem(appConfig.localAvatarsParam);
            if (!Array.isArray(latestAvatarsFromStorage) || latestAvatarsFromStorage.length === 0) {
                // if no avatar array in local storage, retrieve from aws
                latestAvatarsFromStorage = await updateAvatars(setLatestAvatars);
            }
            // Find the avatar corresponding to this user and store in state
            setUserAvatarLink(
                getNFTAvatarLink(address, latestAvatarsFromStorage),
            );
        })();
    }, [address]);

    return (

        <div className="flex min-h-full flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 w-full lg:min-w-[576px]">
        <>
            <div className="max-w-xl w-full mx-auto overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
                {console.log('userAvatarLink: ', userAvatarLink)}
            </div>

            <Card className="mt-2">
                <CardHeader>
                    <div className="flex items-left">
                    <div className="ml-3">
                        {userAvatarLink === false ? (
                            <DefaultavatarIcon className="h-10 w-10 rounded-full bg-gray-50" />
                        ) : (
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={userAvatarLink} alt="User Avatar" />
                                <AvatarFallback><DefaultavatarIcon /></AvatarFallback>
                            </Avatar>
                        )}

                        <p>{address ? ` ${address.substring(0, 11)}...${address.substring(address.length - 5)}` : ''}</p>

                        <p>Followers: 0&emsp;Subscribers: 0</p>

                        <Button type="button" onClick={() => {
                            toast({
                                title: "Success",
                                description: "Address xxxx added to following list",
                            });
                        }}>
                            Follow
                        </Button>

                    </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle>User content goes here</CardTitle>
                    <p>Get user posting history</p>
                </CardContent>
            </Card>
        </>
        </div>
    )
};
