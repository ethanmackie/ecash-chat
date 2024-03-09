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

    // Parse for an address from cashtab
    const handleMessage = async (event) => {
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
  
  /* Placeholder UI for now until the Tailwind UI set is ready for implementation */
  return (
    <>
    <nav className="bg-gradient-to-t border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
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

          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-gradient-to-t dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li key="top menu option1">
                <a href="#" className="block py-2 px-3 text-white bg-gradient-to-t rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Top menu option</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    
    
    <main className="flex min-h-screen flex-col items-left justify-between p-24">
      <div>
        <div>
            <button type="button" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2">
            Sign in with&emsp;
            <Image
              src="/cashtab-extension.png"
              alt="eCash Extension Logo"
              width={150}
              height={50}
              priority
              onClick={() => getAddress()}
            />
            <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd"/>
            </button>
        </div>
        <br />
            <b>User:</b> {address}
        <br />
            <b>Registered Aliases: </b>
            {aliases.registered && aliases.registered.length > 0 &&
            aliases.registered.map(
                  (alias, index) => (
                      <kbd
                          className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-blue-300 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                          key={index}
                      >
                          {alias.alias}.xec 
                      </kbd>
                  ),
              )}
            <br />
            <b>Pending Aliases: </b>
            {aliases.pending && aliases.pending.length > 0 &&
            aliases.pending.map(
                  (alias, index) => (
                      <kbd
                          className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                          key={index}
                      >
                          {alias.alias}.xec 
                      </kbd>
                  ),
              )}
        <br />
        
        <b>Messages:</b>
        <br />
        
        {cashaddr.isValidCashAddress(address, 'ecash') &&
            <TxHistory address={address} />
        }
      </div>
      
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="eCash Social"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Send Message
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                Address
              </label>
              <div className="mt-2">
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="message" className="block text-sm font-medium leading-6 text-gray-900">
                  Message
                </label>
              </div>
              <div className="mt-2">
                <textarea
                    id="message"
                    rows="4"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />                
              </div>

            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      
    </main>
    </>
  );
}
