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
import { Cross2Icon, Pencil1Icon, FileTextIcon} from '@radix-ui/react-icons';
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
import { DefaultavatarIcon, IdCardIcon} from "@/components/ui/social";
import { toast } from 'react-toastify';
import copy from 'copy-to-clipboard';
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
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
                        <div className="flex flex-row w-full space-x-4">
                            <div className="flex-1 ml-2">
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
                            </div>
                            <div className="ml-auto flex items-center space-x-2">
                            <Button variant="outline" size="icon"
                            onClick={() => {
                                deleteContact(thisContact.address, setContactList);
                            }}
                            >
                        <Cross2Icon className="h-4 w-4" />
                        </Button>
                        <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Pencil1Icon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Edit</h4>
                            <p className="text-sm text-muted-foreground">
                            Input new name for <br />{thisContact.address}
                            </p>
                        </div>
                       
                          <div className="py-2">
                            <Input
                              id="addContactName"
                              name="addContactName"
                              type="text"
                              value={contactListName}
                              required
                              placeholder="New contact name"
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
                              className="mt-2"
                            >
                              Rename Contact
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                            </div>
                        </div>
                        </div>
                    ))}
                    </CardContent>
                    <CardFooter>
                    <Button 
                     onClick={e => {
                        exportContacts(contactList);
                    }}
                    variant="ghost">
                       <FileTextIcon className='mr-2'/> Export contacts
                    </Button>
                    </CardFooter>
    
                </Card>
            </SheetContent>
            </Sheet>
        </button>
    )
};
