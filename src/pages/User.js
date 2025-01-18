import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { AnonAvatar } from "@/components/ui/social";

export default function User() {
    const searchParams = useSearchParams();
    const address = searchParams.get("address");
    return (
        <>
            <Card className="mt-2">
                <CardHeader>
                    <div className="flex items-left">
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
                    100,000,000 XEC
                    </CardDescription>
                </CardContent>
            </Card>
        </>
    )
};
