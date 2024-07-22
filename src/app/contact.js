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
    CardFooter,
} from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { appConfig } from '../config/app';
import { getNFTAvatarLink, deleteContact } from '../utils/utils';
import { DefaultavatarIcon} from "@/components/ui/social";
import { IdCardIcon } from '@radix-ui/react-icons';
import { toast } from 'react-toastify';
import copy from 'copy-to-clipboard';
import localforage from 'localforage';

export default function ContactListPanel({ latestAvatars }) {
    const [contactList, setContactList] = useState([]);

    useEffect(() => {
        (async () => {
            await refreshContacts();
        })();
    }, []);

    const refreshContacts = async () => {
        const contacts = await localforage.getItem(appConfig.localContactsParam);
        setContactList(contacts);
    };

    /*
    // Add contact to local storage
    const addNewContact = async () => {
        // Check to see if the contact exists
        const contactExists = contactList.find(
            contact => contact.address === contactListAddress,
        );

        if (typeof contactExists !== 'undefined') {
            // Contact exists
            toast.error(
                `${contactListAddress} already exists in Contacts`,
            );
        } else {
            contactList.push({
                name: contactListName,
                address: contactListAddress,
            });
            // update localforage and state
            await localforage.setItem(appConfig.localContactsParam, contactList);
            toast.success(
                `"${contactListName}" (${contactListAddress}) added to Contacts`,
            );
        }

        // Reset relevant state fields
        setContactListName('');
        setContactListAddress('');
    };
*/

    return (
        <button>
            <Sheet>
            <SheetTrigger>
                <Button
                    variant="outline"
                    size="icon"
                    className='mr-2'
                    onClick={async () => {
                        await refreshContacts();
                    }}
                >
                <IdCardIcon />
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Contact List</SheetTitle>
                </SheetHeader>

                <Card className="mt-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Manage your contacts</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        {contactList && contactList.length > 0 && contactList.map((thisContact) => (
                        <div key={thisContact.address} className="flex items-center mt-2">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={getNFTAvatarLink(thisContact.address, latestAvatars)} alt="User Avatar" />
                            <AvatarFallback>
                                <DefaultavatarIcon />
                            </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                            <p className="font-semibold leading-none tracking-tight">{thisContact.name}</p>
                            <p
                                className="text-sm text-muted-foreground max-w-lg break-words text-balance leading-relaxed"
                                onClick={() => {
                                    copy(thisContact.address);
                                    toast(`${thisContact.address} copied to clipboard`);
                                }}
                            >
                                {`${thisContact.address.substring(0, 11)}...${thisContact.address.substring(thisContact.address.length - 5)}`}
                            </p>
                            <p onClick={() => {
                                deleteContact(thisContact.address, setContactList);
                            }}>
                                Delete
                            </p>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                </Card>
            </SheetContent>
            </Sheet>
        </button>
    )
};
