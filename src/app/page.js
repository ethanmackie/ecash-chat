"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import { getHashFromAddress } from '../utils/utils';
import { getTxHistoryPage } from '../chronik/chronik';
import { chronik as chronikConfig } from '../config/config';

import { ChronikClient } from 'chronik-client';
const chronik = new ChronikClient(chronikConfig.urls);

export default function Home() {  
    const [address, setAddress] = useState('');
    const [hash, setHash] = useState('');
    const [txHistory, setTxHistory] = useState('');
    const [step, setStep] = useState('pending');

    useEffect(() => {
        // Listen for cashtab extension interaction messages on load
        window.addEventListener('message', handleMessage);
    }, [txHistory]);

    const handleMessage = async (event) => {
        // Parse for an address from cashtab
        if (
            event &&
            event.data &&
            event.data.type &&
            event.data.type === 'FROM_CASHTAB'
        ) {
            setAddress(event.data.address);
            await refreshTxHistory();
        }
    };

    const refreshTxHistory = async () => {
        const hash = await getHashFromAddress(event.data.address);
        setHash(hash);
        const txHistory = await getTxHistoryPage(chronik, hash);
        setTxHistory(txHistory);
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
          eCash Social - onchain social platform (we'll work on the slogan later)&nbsp;
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
        Hash: {hash}
        <br />
        txHistory: 
        {txHistory !== '' && (
            <>
            {txHistory.numPages} pages of tx history. Displaying {chronikConfig.txHistoryCount} transactions below.
            <br />
            {txHistory &&
            txHistory.txs &&
            txHistory.txs.length > 0
                ? txHistory.txs.map(
                      (tx, index) => (
                          <li>tx: {tx.txid}</li>
                      ),
                  )
                : ''}
            </>
            )
        }
      </div>
    </main>
  );
}
