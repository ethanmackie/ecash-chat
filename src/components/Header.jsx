"use client";
import React from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Loader, WandSparkles } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { EcashchatIcon, User3icon, Logout3Icon } from "@/components/ui/social"
import ContactListPanel from '../app/contact'
import ProfilePanel from '../app/profile'
import { useToast } from "@/hooks/use-toast"
import localforage from 'localforage';

const Header = ({ 
  isLoggedIn, 
  isMobile, 
  showCard, 
  setShowCard, 
  address, 
  userAvatarLink, 
  xecBalance, 
  latestAvatars,
  syncronizingState,
  setIsLoggedIn,
  setSavedLogin,
  getAddress
}) => {
  const { toast } = useToast();

  return (
    <header className="fixed mt-4 flex top-0 z-50 w-full justify-center">
      <div className="container flex items-center justify-between rounded-lg flex bg-black w-full h-14 mx-4 md:mx-auto md:max-w-xl lg:max-w-3xl border-b border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="sm:flex">
          <a className="flex items-center space-x-2" href="#">
            <EcashchatIcon />
            <Image
              src="/ecashchat.png"
              alt="eCashChat"
              width={90}
              height={24}
              priority
              className="hidden sm:inline-block"
            />
          </a>
        </div>

        {syncronizingState && (
          <Loader className="h-4 w-4 animate-spin" />
        )}

        <div className="flex">
          {isLoggedIn && (
            <Toggle
              variant="outline"
              aria-label="Toggle italic"
              className="mr-2 w-9 px-0"
              onClick={() => setShowCard((prev) => !prev)}
            >
              <User3icon className="h-4 w-4" />
            </Toggle>
          )}

          {isLoggedIn && <ContactListPanel latestAvatars={latestAvatars} />}

          {isLoggedIn && (
            <ProfilePanel
              address={address}
              avatarLink={userAvatarLink}
              xecBalance={xecBalance}
              latestAvatars={latestAvatars}
            />
          )}

          {isMobile && isLoggedIn ? (
            <div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-2">
                    <WandSparkles className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-10 max-w-xl">
                  <div className="h-full overflow-y-auto">
                    <iframe
                      src="https://www.echan.cash/"
                      style={{ width: '100%', height: '100%', minHeight: '700px' }}
                      allow="microphone"
                      title="eChan"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={async () => {
                  setIsLoggedIn(false);
                  setSavedLogin(false);
                  await localforage.setItem("savedLoginAddress", false);
                  toast({
                    title: "👋",
                    description: `Logged out of ${address}`,
                  });
                }}
                variant="outline"
                size="icon"
              >
                <Logout3Icon />
              </Button>
            </div>
          ) : (
            !isMobile && (
              <div className="flex items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="mr-2">
                      <WandSparkles className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl p-10">
                    <div className="h-full overflow-y-auto">
                      <iframe
                        src="https://www.echan.cash/"
                        style={{ width: '100%', height: '100%', minHeight: '700px' }}
                        allow="microphone"
                        title="eChan"
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={
                    isLoggedIn
                      ? async () => {
                        setIsLoggedIn(false);
                        setSavedLogin(false);
                        await localforage.setItem(
                          "savedLoginAddress",
                          false
                        );
                        toast({
                          title: "👋",
                          description: `Logged out of ${address}`,
                        });
                      }
                      : () => getAddress()
                  }
                  variant="outline"
                  {...(isLoggedIn ? { size: "icon" } : {})}
                >
                  {isLoggedIn ? <Logout3Icon /> : "Signin"}
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;