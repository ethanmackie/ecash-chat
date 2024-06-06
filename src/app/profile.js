import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AnonAvatar } from "@/components/ui/social";
export default function ProfilePanel({ address }) {

    return (
        <button>
        <Sheet>
        <SheetTrigger>Profile</SheetTrigger>
        <SheetContent>
            <SheetHeader>
            <SheetDescription>
                <AnonAvatar /> <br />
                Address: {address} <br />
                Following List: <br />
                Followers List: <br />
                Some other stats goes here
            </SheetDescription>
            </SheetHeader>
        </SheetContent>
        </Sheet>
        </button>
    )

};