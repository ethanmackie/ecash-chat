"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import TxHistory from './txhistory';
import cashaddr from 'ecashaddrjs';
import { queryAliasServer } from '../alias/alias-server';

export default function Home() {
    const [address, setAddress] = useState('');
    const [step, setStep] = useState('pending');
    const [aliases, setAliases] = useState({
            registered: [],
            pending: [],
        });

    useEffect(() => {
        // Listen for cashtab extension messages on load
        window.addEventListener('message', handleMessage);
    }, [address]);

    const handleMessage = async (event) => {
        // Parse for an address from cashtab
        if (
            event &&
            event.data &&
            event.data.type &&
            event.data.type === 'FROM_CASHTAB'
        ) {
            console.log(`Address ${event.data.address} shared by Cashtab`);
            setAddress(event.data.address);
            getAliasesByAddress(event.data.address);
        }
    };

    // Retrieves the aliases associated with this address
    const getAliasesByAddress = async (thisAddress) => {
        try {
            const aliasesForThisAddress = await queryAliasServer(
                'address',
                thisAddress,
            );
            if (aliasesForThisAddress.error) {
                // If an error is returned from the address endpoint
                throw new Error(aliasesForThisAddress.error);
            }
            setAliases({
                registered: aliasesForThisAddress.registered.sort((a, b) =>
                    a.alias.localeCompare(b.alias),
                ),
                pending: aliasesForThisAddress.pending.sort((a, b) =>
                    a.alias.localeCompare(b.alias),
                ),
            });
        } catch (err) {
            console.log(`getAliasesByAddress(): ${err}`);
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
            <b>User:</b> {address}
        <br />
            <b>Registered Aliases:</b>
            {aliases.registered && aliases.registered.length > 0 &&
            aliases.registered.map(
                  (alias, index) => (
                      <span key={index}>{alias.alias} </span>
                  ),
              )}
            <br />
            <b>Pending Aliases:</b>
            {aliases.pending && aliases.pending.length > 0 &&
            aliases.pending.map(
                  (alias, index) => (
                      <span key={index}>{alias.alias} </span>
                  ),
              )}
        <br />
        {cashaddr.isValidCashAddress(address, 'ecash') &&
            <TxHistory address={address} />
        }
      </div>
    </main>
  );
}
