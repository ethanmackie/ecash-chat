import * as utxolib from '@bitgo/utxo-lib';
import { opReturn as opreturnConfig } from '../config/opreturn';
import { chronik as chronikConfig } from '../config/chronik';
import localforage from 'localforage';
import { BN } from 'slp-mdm';
import { appConfig } from '../config/app';
import { useToast, toast } from "@/hooks/use-toast";
import { AlitacoffeeIcon } from "@/components/ui/social";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const SATOSHIS_PER_XEC = 100;

/**
 * Checks whether an NFT avatar has been set for the given address
 * @param {string} address the address being checked for any existing NFT avatars
 * @param {Array} latestAvatars an address to NFT Avatar link mapping
 * @returns {string | false} Returns the icon server reference if found, otherwise returns false
 */
export const getNFTAvatarLink = (address, latestAvatars) => {
    if (!Array.isArray(latestAvatars)) {
        return false;
    }
    let avatarIndex = latestAvatars.findIndex(thisAvatar => thisAvatar.address === address);
    if (avatarIndex === -1) {
        return false;
    }

    return latestAvatars[avatarIndex].link;
};

/**
 * Calculates the total paywall revenue earned by the address in XEC
 *
 * @param {string} address the address being checked for the paywall revenue
 * @param {Array} paywallTxs an array of paywall txs
 * @returns Revenue earned denominated in XEC and total count of paywall unlocks
 */
export const totalPaywallEarnedByAddress = (address, paywallTxs) => {
    const paywallTxsByAddress = [];
    let totalPaywallRevenueByAddress = BN(0);
    for (const paywallTx of paywallTxs) {
        if (paywallTx.recipientAddress === address) {
            paywallTxsByAddress.push(paywallTx);
            totalPaywallRevenueByAddress = totalPaywallRevenueByAddress.plus(BN(paywallTx.paywallPayment));
        }
    }

    return {
        xecEarned: totalPaywallRevenueByAddress.toString(),
        unlocksEarned: paywallTxsByAddress.length,
    };
};

// Slices the full history array based on custom pagination size
export const getPaginatedHistoryPage = (fullHistoryArray, pageNumber) => {
    return fullHistoryArray.slice(
        pageNumber * chronikConfig.townhallHistoryPageSize,
        pageNumber * chronikConfig.townhallHistoryPageSize + chronikConfig.townhallHistoryPageSize,
    );
};

/**
 * Extracts a tweet ID from a twitter url
 * @param {string} the full twitter Url
 * @returns {string} tweet Id
 */
export const getTweetId = tweetUrl => {
    let updatedTweetId;
    let parsedMessage = tweetUrl;
    let tweetId = tweetUrl.substring(
        tweetUrl.indexOf('[twt]') + 5,
        tweetUrl.lastIndexOf('[/twt]')
    );
    // Check if video Id contains the full tweet url
    if (tweetId.includes('status/')) {
        // Extract the tweet Id after the 'status/' substring
        return tweetId.split('status/')[1];
    }
    return parsedMessage;
};

/**
 * Convert an amount in satoshis to XEC
 * @param {Integer} satoshis
 * @returns {Number}
 */
export const toXec = satoshis => {
    if (!Number.isInteger(satoshis)) {
        throw new Error('Input param satoshis must be an integer');
    }
    return new BN(satoshis).div(SATOSHIS_PER_XEC).toNumber();
};

// Encode the op_return message script
// encryptionFlag indicates whether to use the encrypted message prefix
export const encodeBip21Message = (message, encryptionFlag) => {
    if (typeof message !== 'string') {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        if (encryptionFlag) {
            script.push(Buffer.from(opreturnConfig.encryptedMessagePrefixHex, 'hex'));
        }

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(message, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat message: ', err);
    }
};

// Encodes the op_return script for an XEC tipping action
export const encodeBip2XecTip = () => {
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        // Push XEC tip identifier
        script.push(Buffer.from(opreturnConfig.xecTipPrefixHex, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(' ', 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat message: ', err);
    }
};

// Encodes the op_return script for an XEC dust authentication tx
export const encodeBip21Auth = (authHex) => {
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.authPrefixHex, 'hex'));

        // Push random hash + timestamp
        script.push(Buffer.from(authHex, 'hex'));

        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding authentication tx: ', err);
    }
};

// Encodes the op_return script for an XEC paywall payment
export const encodeBip21PaywallPayment = replyTxid => {
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.paywallPaymentPrefixHex, 'hex'));

        // Push txid of paywalled article
        script.push(Buffer.from(replyTxid, 'hex'));

        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding paywall payement: ', err);
    }
};

// Encode the op_return post script
export const encodeBip21Post = (post, premiumPostFlag) => {
    if (typeof post !== 'string') {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        if (premiumPostFlag) {
            // Push eCash Chat premium MVP post identifier
            script.push(Buffer.from(opreturnConfig.townhallMvpPostPrefixHex, 'hex'));
        } else {
            // Push eCash Chat post identifier
            script.push(Buffer.from(opreturnConfig.townhallPostPrefixHex, 'hex'));
        }

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(post, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat post: ', err);
    }
};

// Encode the op_return article script
export const encodeBip21Article = article => {
    if (typeof article !== 'string') {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat blog identifier
        script.push(Buffer.from(opreturnConfig.articlePrefixHex, 'hex'));

        // eCash Chat Article metadata are utf8 encoded
        const eCashChatMsgScript = Buffer.from(article, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat article: ', err);
    }
};

// Encode the op_return reply article script
export const encodeBip21ReplyArticle = (articleReply, replyTxid) => {
    if (
        typeof articleReply !== 'string' ||
        typeof replyTxid !== 'string'
    ) {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.articlePrefixHex, 'hex'));

        // Push eCash Chat reply article identifier
        script.push(Buffer.from(opreturnConfig.articleReplyPrefixHex, 'hex'));

        // Push eCash Chat reply txid
        script.push(Buffer.from(replyTxid, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(articleReply, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat article reply: ', err);
    }
};

// Encode the op_return reply post script
export const encodeBip21ReplyPost = (post, replyTxid) => {
    if (
        typeof post !== 'string' ||
        typeof replyTxid !== 'string'
    ) {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        // Push eCash Chat reply post identifier
        script.push(Buffer.from(opreturnConfig.townhallReplyPostPrefixHex, 'hex'));

        // Push eCash Chat reply txid
        script.push(Buffer.from(replyTxid, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(post, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat post: ', err);
    }
};

// Encode the op_return NFT showcase script
export const encodeBip21NftShowcase = (showcaseMsg, nftId) => {
    if (
        typeof showcaseMsg !== 'string' ||
        typeof nftId !== 'string'
    ) {
        return '';
    }
    try {
        let script = [];

        // Push eCash Chat protocol identifier
        script.push(Buffer.from(opreturnConfig.appPrefixesHex.eCashChat, 'hex'));

        // Push eCash Chat NFT showcase identifier
        script.push(Buffer.from(opreturnConfig.nftShowcasePrefixHex, 'hex'));

        // Push eCash Chat nftId
        script.push(Buffer.from(nftId, 'hex'));

        // eCash Chat messages are utf8 encoded
        const eCashChatMsgScript = Buffer.from(showcaseMsg, 'utf8');
        script.push(eCashChatMsgScript);
        script = utxolib.script.compile(script).toString('hex');
        return script;
    } catch (err) {
        console.log('Error encoding eCash Chat nft showcase: ', err);
    }
};

// Formats a date value
export const formatDate = (dateString, userLocale = 'en') => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateFormattingError = 'Unable to format date.';
    try {
        if (dateString) {
            return new Date(dateString * 1000).toLocaleDateString(
                userLocale,
                options,
            );
        }
        return new Date().toLocaleDateString(userLocale, options);
    } catch (error) {
        return dateFormattingError;
    }
};

// Formats an XEC balance based on the user's locale
export const formatBalance = (unformattedBalance, optionalLocale) => {
    try {
        if (optionalLocale === undefined) {
            return new Number(unformattedBalance).toLocaleString({
                maximumFractionDigits: appConfig.cashDecimals,
            });
        }
        return new Number(unformattedBalance).toLocaleString(optionalLocale, {
            maximumFractionDigits: appConfig.cashDecimals,
        });
    } catch (err) {
        console.error(`Error in formatBalance for ${unformattedBalance}`);
        console.error(err);
        return unformattedBalance;
    }
};

/**
 * Call in a web browser. Return user locale if available or default (e.g. 'en-US') if not.
 * @param {object | undefined} navigator
 * @returns {string}
 */
export const getUserLocale = navigator => {
    if (typeof navigator?.language !== 'undefined') {
        return navigator.language;
    }
    return appConfig.defaultLocale;
};

// Calculates the top 10 paywall revenue earners by unlock count
export const getPaywallLeaderboard = (paywallTxs) => {
    const uncountedLeaderboard = [];
    for (const paywallTx of paywallTxs) {
        uncountedLeaderboard.push(paywallTx.recipientAddress);
    }

    let countedLeaderboard = uncountedLeaderboard.reduce(function (valueA, valueB) {
        return (
            valueA[valueB] ? ++valueA[valueB] :(valueA[valueB] = 1),
            valueA
        );
    }, {});

    const entries = Object.entries(countedLeaderboard);
    const sortedLeaderboard = entries.sort((a, b) => b[1] - a[1]);
    const sortedLeaderboardTop10 = sortedLeaderboard.slice(0, 10);
    return sortedLeaderboardTop10;
};

// Add contact to local storage mute list
export const muteNewContact = async (contactName, contactAddress, setMuteList, window) => {
    let muteList = await localforage.getItem(appConfig.localMuteParam);

    if (!Array.isArray(muteList)) {
        muteList = [];
    }

    // Check to see if the contact exists
    const contactExists = muteList.find(
        contact => contact.address === contactAddress,
    );

    if (typeof contactExists !== 'undefined') {
        // Contact exists
        toast({
            title: "oops",
            description: `${contactAddress} already exists in mute list`,
          });
    } else {
        muteList.push({
            name: contactName,
            address: contactAddress,
        });
        // update localforage and state
        await localforage.setItem(appConfig.localMuteParam, muteList);
        toast({
            title: "✅Added",
            description: `${contactName}" (${contactAddress}) added to mute list, refreshing app...`,
          });
    }
    if (setMuteList) {
        setMuteList(muteList);
    }

    if (window) {
        setTimeout(function (){
            window.location.reload();
        }, 2000);
    }
};

// Delete contact from local storage must list
export const deleteMutedContact = async (contactListAddressToDelete, setMuteList, window) => {
    let muteList = await localforage.getItem(appConfig.localMuteParam);
    if (!Array.isArray(muteList)) {
        muteList = [];
    }

    // filter contact from local contact list array
    const updatedMutetList = muteList.filter(
        contact => contact.address !== contactListAddressToDelete,
    );

    // Update localforage and state
    await localforage.setItem(appConfig.localMuteParam, updatedMutetList);
    toast({
        title: "✅Unmuted",
        description: `User unmuted, refreshing app...`,
      });
    if (setMuteList) {
        setMuteList(updatedMutetList);
    }
    if (window) {
        setTimeout(function (){
            window.location.reload();
        }, 2000);
    }
};

// Add contact to local storage
export const addNewContact = async (contactName, contactAddress, refreshCallback) => {
    let contactList = await localforage.getItem(appConfig.localContactsParam);

    if (!Array.isArray(contactList)) {
        contactList = [];
    }

    // Check to see if the contact exists
    const contactExists = contactList.find(
        contact => contact.address === contactAddress,
    );

    if (typeof contactExists !== 'undefined') {
        // Contact exists
        toast({
            title: 'error',
            description: `${contactAddress} already exists in Contacts`,
          });
    } else {
        contactList.push({
            name: contactName,
            address: contactAddress,
        });
        // update localforage and state
        await localforage.setItem(appConfig.localContactsParam, contactList);
        toast({
            title: "✅Added",
            description: `${contactName}" (${contactAddress}) added to Contacts`,
          });
    }
    if (refreshCallback) {
        await refreshCallback();
    }
};

// Delete contact from local storage
export const deleteContact = async (contactListAddressToDelete, setContactList, refreshCallback) => {
    let contactList = await localforage.getItem(appConfig.localContactsParam);
    if (!Array.isArray(contactList)) {
        contactList = [];
    }

    // filter contact from local contact list array
    const updatedContactList = contactList.filter(
        contact => contact.address !== contactListAddressToDelete,
    );

    // Update localforage and state
    await localforage.setItem(appConfig.localContactsParam, updatedContactList);
    setContactList(updatedContactList);
    toast({
        title: "✅Removed",
        description: `${contactListAddressToDelete}" removed from Contacts`,
      });
    if (refreshCallback) {
        await refreshCallback();
    }
};

// Rename contact from local storage
export const renameContact = async (contactListAddressToRename, setContactList, newName, refreshCallback) => {
    let contactList = await localforage.getItem(appConfig.localContactsParam);
    // Find the contact to rename
    let contactToUpdate = contactList.find(
        contact => contact.address === contactListAddressToRename,
    );

    // if a match was found
    if (typeof contactToUpdate !== 'undefined') {
        // update the contact name
        contactToUpdate.name = newName;

        // Update localforage and state
        await localforage.setItem(appConfig.localContactsParam, contactList);
        toast({
            title: "✅Renamed",
            description: `Contact renamed to "${newName}"`,
          });
    } else {
        toast({
            title: 'oops',
            description: `Unable to find contact`,
          });
    }
    setContactList(contactList);
    if (refreshCallback) {
        await refreshCallback();
    }
};

// Export contacts from local storage
export const exportContacts = contactListArray => {
    if (!contactListArray) {
        toast({
            title: 'error',
            description: `Unable to export contact list`,
            variant: 'destructive',
          });
        return;
    }

    // convert object array into csv data
    let csvContent =
        'data:text/csv;charset=utf-8,' +
        contactListArray.map(
            element => '\n' + element.name + '|' + element.address,
        );

    // encode csv
    var encodedUri = encodeURI(csvContent);

    // hidden DOM node to set the default file name
    var csvLink = document.createElement('a');
    csvLink.setAttribute('href', encodedUri);
    csvLink.setAttribute(
        'download',
        'eCashChat_Contacts.csv',
    );
    document.body.appendChild(csvLink);
    csvLink.click();
};

// Return the contact name based on address if this contact exists
export const getContactNameIfExist = (address, contactList) => {
    if (!Array.isArray(contactList)) {
        return address.substring(0,10) + '...' + address.substring(address.length - 5);
    }
    // Find the contact
    let contactExists = contactList.find(
        contact => contact.address === address,
    );

    // if a match was found
    if (typeof contactExists !== 'undefined') {
        return contactExists.name;
    }
    return address.substring(0,10) + '...' + address.substring(address.length - 5);
};

// Checks whether the address is an existing contact
export const isExistingContact = (address, contactList) => {
    if (!Array.isArray(contactList)) {
        return false;
    }
    // Find the contact
    let contactExists = contactList.find(
        contact => contact.address === address,
    );

    // if a match was found
    if (typeof contactExists !== 'undefined') {
        return true;
    }

    return false;
};

// Render the tipping button popover
export const RenderTipping = ( { address, sendXecTip } ) => {
    return (
        <>
        {/* Tip XEC options */}
        <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                        <AlitacoffeeIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-2">
                            <h4 className="font-medium leading-none"> <AlitacoffeeIcon /></h4>
                            <p className="text-sm text-muted-foreground">
                            Send a little XEC as a tip
                            </p>
                        </div>
                    <div className="py-4">
                        <Button
                            type="button"
                            onClick={() => sendXecTip(address, 100)}
                        >
                            100
                        </Button>
                        &nbsp;
                        <Button
                            type="button"
                            onClick={() => sendXecTip(address, 1000)}
                        >
                            1k
                        </Button>
                        &nbsp;
                        <Button
                            type="button"
                            onClick={() => sendXecTip(address, 10000)}
                        >
                            10k
                        </Button>
                        &nbsp;
                        <Button
                            type="button"
                            onClick={() => sendXecTip(address, 100000)}
                        >
                            100k
                        </Button>
                        &nbsp;
                        <Button
                            type="button"
                            onClick={() => sendXecTip(address, 1000000)}
                        >
                            1M
                        </Button>

                        <Input
                            id="customTip"
                            name="customTip"
                            type="number"
                            placeholder="Custom tip in XEC"
                            className="mt-2"
                        />
                        <Button
                            type="button"
                            onClick={() => sendXecTip(address, document.getElementById('customTip').value)}
                            className="mt-2"
                        >
                            Custom
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
};
