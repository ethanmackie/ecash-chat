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
import { getNFTAvatarLink, deleteContact, renameContact, exportContacts } from '../utils/utils';
import { DefaultavatarIcon} from "@/components/ui/social";
import { IdCardIcon } from '@radix-ui/react-icons';
import { toast } from 'react-toastify';
import copy from 'copy-to-clipboard';
import { Input } from "@/components/ui/input";
import { Popover } from "flowbite-react";
import localforage from 'localforage';

export default function ContactListPanel({ latestAvatars }) {
    const [contactList, setContactList] = useState([]);
    const [contactListName, setContactListName] = useState('');

    useEffect(() => {
        (async () => {
            await refreshContacts();
        })();
    }, []);

    const refreshContacts = async () => {
        const contacts = await localforage.getItem(appConfig.localContactsParam);
        setContactList(contacts);
    };

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
                            {/* Rename contact popover to input the new contact name */}
                            <Popover
                                aria-labelledby="default-popover"
                                placement="top"
                                content={
                                <div className="w-120 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                                    <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Input new name for <br />{thisContact.address}</h3>
                                    </div>
                                    <div className="px-3 py-2">
                                        <Input
                                            id="addContactName"
                                            name="addContactName"
                                            type="text"
                                            value={contactListName}
                                            required
                                            placeholder="New contact name"
                                            className="bg-gray-50"
                                            maxLength="30"
                                            onChange={e => setContactListName(e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            disabled={contactListName === ''}
                                            onClick={e => {
                                                renameContact(thisContact.address, setContactList, contactListName);
                                                setContactListName('');
                                            }}
                                        >
                                            Rename Contact
                                        </Button>
                                    </div>
                                </div>
                                }
                            >
                                <Button variant="outline" size="icon" className="mr-2">
                                    Rename
                                </Button>
                            </Popover>

                            </div>
                        </div>
                        ))}
                    </CardContent>
                    <Button
                        type="button"
                        onClick={e => {
                            exportContacts(contactList);
                        }}
                    >
                        Export contacts
                    </Button>
                </Card>
            </SheetContent>
            </Sheet>
        </button>
    )
};
