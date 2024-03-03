"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import { chronik as chronikConfig } from '../config/config';
import TxHistory from './txhistory';
import cashaddr from 'ecashaddrjs';

export default function Home() {
    const [address, setAddress] = useState('');
    const [step, setStep] = useState('pending');

    useEffect(() => {
        // Listen for cashtab extension messages on load
        window.addEventListener('message', handleMessage);
    }, []);

    const handleMessage = async (event) => {
        // Parse for an address from cashtab
        if (
            event &&
            event.data &&
            event.data.type &&
            event.data.type === 'FROM_CASHTAB'
        ) {
            setAddress(event.data.address);
        }
    };

    const confirmCashtabProviderStatus = () => {
        const cashTabStatus = getCashtabProviderStatus();
        if (!cashTabStatus) {
            setStep('install');
        } else {
            setStep('fresh');
        }
    };

    const getCashtabProviderStatus = () => {
        console.log(window.bitcoinAbc);
        if (window && window.bitcoinAbc && window.bitcoinAbc === 'cashtab') {
            return true;
        }
        return false;
    };

    const getAddress = () => {
      window.postMessage(
          {
              type: 'FROM_PAGE',
              text: 'Cashtab',
              addressRequest: true,
          },
          '*',
      );
    };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://e.cash/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/ecash-square-icon.svg"
              alt="eCash Logo"
              className="dark:invert"
              width={50}
              height={15}
              priority
            />
          </a>
          <br />
        </div>
        <p>
          eCash Social - onchain social platform (we&lsquo;ll work on the slogan later)&nbsp;
        </p>
        <br />
        <div>
            Log in via
            <Image
              src="/cashtab-logo.png"
              alt="eCash Logo"
              className="dark:invert"
              width={100}
              height={30}
              priority
              onClick={() => getAddress()}
            />
        </div>
        <br />
        User: {address}
        <br />
        {cashaddr.isValidCashAddress(address, 'ecash') &&
            <TxHistory address={address} />
        }
      </div>
    </main>
  );
}
