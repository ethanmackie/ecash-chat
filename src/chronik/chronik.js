// Chronik methods
import { chronik as chronikConfig } from '../config/chronik';
import cashaddr from 'ecashaddrjs';
import { opReturn as opreturnConfig } from '../config/opreturn';
import { appConfig } from '../config/app';
import { formatDate, toXec } from '../utils/utils';
import { getStackArray } from 'ecash-script';
import { BN } from 'slp-mdm';
import { toast } from 'react-toastify';
import localforage from 'localforage';
import { kv } from '@vercel/kv';

// Retrieves all articles from API and share via local storage
export const getArticleListing = async () => {
    let articles = await kv.get(appConfig.vercelKvParam);
    console.log('articles retrieved from vercel: ', articles);

    if (!Array.isArray(articles)) {
        articles = [];
    }

    return articles;
};

/**
 * Refreshes the app's utxos, XEC balance and NFT collection
 * @param {string} chronik the chronik-client instance
 * @param {string} address the eCash address of the active wallet
 * @returns {chatCache} the updated cache object
 */
export const refreshUtxos = async (chronik, address) => {
    const parentNftList = [];
    const chatCache = {
        utxos: [],
        slpUtxos: [],
        nonSlpUtxos: [],
        parentNftList: [],
        childNftList: [],
        childNftIds: [],
        xecBalance: parseInt(0),
    };

    // Retrieve all utxos
    const allUtxos = await getAllUtxos(chronik, address);
    chatCache.utxos = allUtxos;

    // Split into slp and non slp utxos
    const { slpUtxos, nonSlpUtxos } = await organizeUtxosByType(allUtxos.utxos);
    chatCache.nonSlpUtxos = nonSlpUtxos;
    chatCache.slpUtxos = slpUtxos;

    // Calculate XEC balance
    let xecBalance = parseInt(0);
    for (const utxo of nonSlpUtxos) {
        xecBalance += parseInt(utxo.value);
    }
    chatCache.xecBalance = new Number(
        toXec(xecBalance)
    ).toLocaleString({
        maximumFractionDigits: appConfig.cashDecimals,
    });

    // Parse for NFTs
    const nftParents = [];
    const nftParentIds = [];
    const nftChildren = [];
    for (const slpUtxo of slpUtxos) {
        switch (slpUtxo.token.tokenType.type) {
            case 'SLP_TOKEN_TYPE_NFT1_GROUP': {
                nftParents.push(slpUtxo);
                nftParentIds.push(slpUtxo.token.tokenId);
                break;
            }
            case 'SLP_TOKEN_TYPE_NFT1_CHILD': {
                nftChildren.push(slpUtxo);
                break;
            }
            default: {
                break;
            }
        }
    }
    // Filter out the duplicate parent IDs
    let uniqueNftParents = [...new Set(nftParentIds)];

    // Retrieve the full parent NFT details
    for (const parentId of uniqueNftParents) {
        const nftParentDetails = await getTokenGenesisInfo(chronik, parentId);
        parentNftList.push(nftParentDetails);
    }
    chatCache.parentNftList = parentNftList;
    chatCache.childNftList = nftChildren;

    // Update local storage
    await localforage.setItem('chatCache', chatCache);

    return chatCache;
};

/**
 * Convert a token amount like one from an in-node chronik utxo to a decimalized string
 * @param {string} amount undecimalized token amount as a string, e.g. 10012345 at 5 decimals
 * @param {Integer} decimals
 * @returns {string} decimalized token amount as a string, e.g. 100.12345
 */
export const decimalizeTokenAmount = (amount, decimals) => {
    const STRINGIFIED_INTEGER_REGEX = /^[0-9]+$/;
    if (typeof amount !== 'string') {
        throw new Error('amount must be a string');
    }
    if (!STRINGIFIED_INTEGER_REGEX.test(amount)) {
        throw new Error('amount must be a stringified integer');
    }
    if (!Number.isInteger(decimals)) {
        throw new Error('decimals must be an integer');
    }
    if (decimals === 0) {
        // If we have 0 decimal places, and amount is a stringified integer
        // amount is already correct
        return amount;
    }

    // Do you need to pad with leading 0's?
    // For example, you have have "1" with 9 decimal places
    // This should be 0.000000001 strlength 1, decimals 9
    // So, you must add 9 zeros before the 1 before proceeding
    // You may have "123" with 9 decimal places strlength 3, decimals 9
    // This should be 0.000000123
    // So, you must add 7 zeros before the 123 before proceeding
    if (decimals > amount.length) {
        // We pad with decimals - amount.length 0s, plus an extra zero so we return "0.000" instead of ".000"
        amount = `${new Array(decimals - amount.length + 1)
            .fill(0)
            .join('')}${amount}`;
    }

    // Insert decimal point in proper place
    const stringAfterDecimalPoint = amount.slice(-1 * decimals);
    const stringBeforeDecimalPoint = amount.slice(
        0,
        amount.length - stringAfterDecimalPoint.length,
    );
    return `${stringBeforeDecimalPoint}.${stringAfterDecimalPoint}`;
};

/**
 * Convert a decimalized token amount to an undecimalized amount
 * Useful to perform integer math as you can use BigInt for amounts greater than Number.MAX_SAFE_INTEGER in js
 * @param {string} decimalizedAmount decimalized token amount as a string, e.g. 100.12345 for a 5-decimals token
 * @param {Integer} decimals
 * @returns {string} undecimalized token amount as a string, e.g. 10012345 for a 5-decimals token
 */
export const undecimalizeTokenAmount = (decimalizedAmount, decimals) => {
    const STRINGIFIED_DECIMALIZED_REGEX = /^\d*\.?\d*$/;
    if (typeof decimalizedAmount !== 'string') {
        throw new Error('decimalizedAmount must be a string');
    }
    if (
        !STRINGIFIED_DECIMALIZED_REGEX.test(decimalizedAmount) ||
        decimalizedAmount.length === 0
    ) {
        throw new Error(
            `decimalizedAmount must be a non-empty string containing only decimal numbers and optionally one decimal point "."`,
        );
    }
    if (!Number.isInteger(decimals)) {
        throw new Error('decimals must be an integer');
    }

    // If decimals is 0, we should not have a decimal point, or it should be at the very end
    if (decimals === 0) {
        if (!decimalizedAmount.includes('.')) {
            // If 0 decimals and no '.' in decimalizedAmount, it's the same
            return decimalizedAmount;
        }
        if (decimalizedAmount.slice(-1) !== '.') {
            // If we have a decimal anywhere but at the very end, throw precision error
            throw new Error(
                'decimalizedAmount specified at greater precision than supported token decimals',
            );
        }
        // Everything before the decimal point is what we want
        return decimalizedAmount.split('.')[0];
    }

    // How many decimal places does decimalizedAmount account for
    const accountedDecimals = decimalizedAmount.includes('.')
        ? decimalizedAmount.split('.')[1].length
        : 0;

    // Remove decimal point from the string
    let undecimalizedAmountString = decimalizedAmount.split('.').join('');
    // Remove leading zeros, if any
    undecimalizedAmountString = removeLeadingZeros(undecimalizedAmountString);

    if (accountedDecimals === decimals) {
        // If decimalized amount is accounting for all decimals, we simply remove the decimal point
        return undecimalizedAmountString;
    }

    const unAccountedDecimals = decimals - accountedDecimals;
    if (unAccountedDecimals > 0) {
        // Handle too little precision
        // say, a token amount for a 9-decimal token is only specified at 3 decimals
        // e.g. 100.123
        const zerosToAdd = new Array(unAccountedDecimals).fill(0).join('');
        return `${undecimalizedAmountString}${zerosToAdd}`;
    }

    // Do not accept too much precision
    // say, a token amount for a 3-decimal token is specified at 5 decimals
    // e.g. 100.12300 or 100.12345
    // Note if it is specied at 100.12345, we have an error, really too much precision
    throw new Error(
        'decimalizedAmount specified at greater precision than supported token decimals',
    );
};

/**
 * Remove leading '0' characters from any string
 * @param {string} string
 */
export const removeLeadingZeros = givenString => {
    let leadingZeroCount = 0;
    // We only iterate up to the 2nd-to-last character
    // i.e. we only iterate over "leading" characters
    for (let i = 0; i < givenString.length - 1; i += 1) {
        const thisChar = givenString[i];
        if (thisChar === '0') {
            leadingZeroCount += 1;
        } else {
            // Once you hit something other than '0', there are no more "leading" zeros
            break;
        }
    }
    return givenString.slice(leadingZeroCount, givenString.length);
};

/**
 * Get all info about a token
 * @param {ChronikClientNode} chronik
 * @param {string} tokenId
 * @returns {object}
 */
export const getTokenGenesisInfo = async (chronik, tokenId) => {
    // We can get timeFirstSeen, block, tokenType, and genesisInfo from the token() endpoint
    // If we call this endpoint before the genesis tx is confirmed, we will not get block
    // So, block does not need to be included
    const tokenInfo = await chronik.token(tokenId);
    const genesisTxInfo = await chronik.tx(tokenId);
    const { timeFirstSeen, genesisInfo, tokenType } = tokenInfo;
    const decimals = genesisInfo.decimals;

    // Initialize variables for determined quantities we want to cache

    /**
     * genesisSupply {string}
     * Quantity of token created at mint
     * Note: we may have genesisSupply at different genesisAddresses
     * We do not track this information, only total genesisSupply
     * Cached as a decimalized string, e.g. 0.000 if 0 with 3 decimal places
     * 1000.000000000 if one thousand with 9 decimal places
     */
    let genesisSupply = decimalizeTokenAmount('0', decimals);

    /**
     * genesisMintBatons {number}
     * Number of mint batons created in the genesis tx for this token
     */
    let genesisMintBatons = 0;

    /**
     * genesisOutputScripts {Set(<outputScript>)}
     * Address(es) where initial token supply was minted
     */
    let genesisOutputScripts = new Set();

    // Iterate over outputs
    for (const output of genesisTxInfo.outputs) {
        if ('token' in output && output.token.tokenId === tokenId) {
            // If this output of this genesis tx is associated with this tokenId

            const { token, outputScript } = output;

            // Add its outputScript to genesisOutputScripts
            genesisOutputScripts.add(outputScript);

            const { isMintBaton, amount } = token;
            if (isMintBaton) {
                // If it is a mintBaton, increment genesisMintBatons
                genesisMintBatons += 1;
            }

            // Increment genesisSupply
            // decimalizeTokenAmount, undecimalizeTokenAmount
            //genesisSupply = genesisSupply.plus(new BN(amount));

            genesisSupply = decimalizeTokenAmount(
                (
                    BigInt(undecimalizeTokenAmount(genesisSupply, decimals)) +
                    BigInt(amount)
                ).toString(),
                decimals,
            );
        }
    }

    const tokenCache = {
        tokenType,
        genesisInfo,
        timeFirstSeen,
        genesisSupply,
        // Return genesisOutputScripts as an array as we no longer require Set features
        genesisOutputScripts: [...genesisOutputScripts],
        genesisMintBatons,
    };
    if ('block' in tokenInfo) {
        // If the genesis tx is confirmed at the time we check
        tokenCache.block = tokenInfo.block;
    }

    if (tokenType.type === 'SLP_TOKEN_TYPE_NFT1_CHILD') {
        // If this is an SLP1 NFT
        // Get the groupTokenId
        // This is available from the .tx() call and will never change, so it should also be cached
        for (const tokenEntry of genesisTxInfo.tokenEntries) {
            const { txType } = tokenEntry;
            if (txType === 'GENESIS') {
                const { groupTokenId } = tokenEntry;
                tokenCache.groupTokenId = groupTokenId;
            }
        }
    }
    // Note: if it is not confirmed, we can update the cache later when we try to use this value

    tokenCache.tokenId = tokenId;
    return tokenCache;
};

/**
 * Get all utxos for a given eCash address
 * @param {ChronikClientNode} chronik
 * @param {string} eCash address
 * @returns
 */
export const getAllUtxos = async (chronik, address) => {
    if (address === '') {
        return [];
    }

    try {
        const { type, hash } = cashaddr.decode(address, true);
        return await chronik.script(type, hash).utxos();
    } catch (err) {
        console.log('getAllUtxos(): error retrieving utxos - ', err);
        return [];
    }
};

/**
 * Organize utxos by token and non-token
 * @param {Tx_InNode[]} chronikUtxos
 * @returns {object} {slpUtxos: [], nonSlpUtxos: []}
 */
export const organizeUtxosByType = chronikUtxos => {
    if (!Array.isArray(chronikUtxos)) {
        return {
            slpUtxos: [],
            nonSlpUtxos: [],
        }
    }
    const nonSlpUtxos = [];
    const slpUtxos = [];
    for (const utxo of chronikUtxos) {
        // Construct nonSlpUtxos and slpUtxos arrays
        if (typeof utxo.token !== 'undefined') {
            slpUtxos.push(utxo);
        } else {
            nonSlpUtxos.push(utxo);
        }
    }

    return { slpUtxos, nonSlpUtxos };
};

/**
 * @param {string} token id of the parent NFT
 * @returns {array} an array of child NFTs corresponding to the parent NFT
 */
export const getNfts = async (chronik, tokenId) => {
	const nftParentTxHistory = await getAllTxHistoryByTokenId(
	    chronik,
	    tokenId,
	);
    const childNftsIds = getChildNftsFromParent(tokenId, nftParentTxHistory);
    const childNftsObj = [];
    for (const childNftId of childNftsIds) {
        childNftsObj.push(await chronik.token(childNftId));
    }

	return childNftsObj;
};

/**
 * @param {ChronikClientNode} chronik
 * @param {string} tokenId
 * @param {number} pageSize usually 200, the chronik max, but accept a parameter to simplify unit testing
 * @returns
 */
export const getAllTxHistoryByTokenId = async (
    chronik,
    tokenId,
    pageSize = chronikConfig.txHistoryPageSize,
) => {
    // We will throw an error if we get an error from chronik fetch
    const firstPageResponse = await chronik
        .tokenId(tokenId)
        // call with page=0 (to get first page) and max page size, as we want all the history
        .history(0, pageSize);
    const { txs, numPages } = firstPageResponse;
    // Get tx history from all pages
    // We start with i = 1 because we already have the data from page 0
    const tokenHistoryPromises = [];
    for (let i = 1; i < numPages; i += 1) {
        tokenHistoryPromises.push(
            new Promise((resolve, reject) => {
                chronik
                    .tokenId(tokenId)
                    .history(i, chronikConfig.txHistoryPageSize)
                    .then(
                        result => {
                            resolve(result.txs);
                        },
                        err => {
                            reject(err);
                        },
                    );
            }),
        );
    }
    // Get rest of txHistory using Promise.all() to execute requests in parallel
    const restOfTxHistory = await Promise.all(tokenHistoryPromises);
    // Flatten so we have an array of tx objects, and not an array of arrays of tx objects
    const flatTxHistory = restOfTxHistory.flat();
    // Combine with the first page
    const allHistory = txs.concat(flatTxHistory);

    return allHistory;
};

/**
 * Get all child NFTs from a given parent tokenId
 * i.e. get all NFTs in an NFT collection *
 * @param {string} parentTokenId
 * @param {Tx_InNode[]} allParentTokenTxHistory
 */
export const getChildNftsFromParent = (
    parentTokenId,
    allParentTokenTxHistory,
) => {
    const childNftsFromThisParent = [];
    for (const tx of allParentTokenTxHistory) {
        // Check tokenEntries
        const { tokenEntries } = tx;
        for (const tokenEntry of tokenEntries) {
            const { txType } = tokenEntry;
            if (
                txType === 'GENESIS' &&
                typeof tokenEntry.groupTokenId !== 'undefined' &&
                tokenEntry.groupTokenId === parentTokenId
            ) {
                childNftsFromThisParent.push(tokenEntry.tokenId);
            }
        }
    }
    return childNftsFromThisParent;
};

/**
 * Subscribes to a given address and listens for new websocket events related to article postings
 *
 * @param {string} chronik the chronik-client instance
 * @param {string} address the eCash address of the active wallet
 * @param {@vercel/kv} kv the Vercel KV database client instance
 * @param {array} updatedArticles an array of article object including the newly posted article
 * @throws {error} err chronik websocket subscription errors
 */
export const articleTxListener = async (
    chronik,
    address,
    kv,
    updatedArticles,
) => {
    // Get type and hash
    const { type, hash } = cashaddr.decode(address, true);

    try {
        const ws = chronik.ws({
            onMessage: msg => {
                if (msg.msgType === 'TX_ADDED_TO_MEMPOOL') {

                    console.log('articleTxListener detected: updatedArticles is: ', updatedArticles);

                    (async () => {
                        console.log('Storing article content offchain.');
                        await localforage.setItem(appConfig.localArticlesParam, updatedArticles);
                        await kv.set(appConfig.vercelKvParam, updatedArticles);
                    })();

                    // Notify user
                    toast(`Article posted`);

                    // Unsubscribe and close websocket
                    ws.unsubscribeFromScript(type, hash);
                    ws.close();
                }
            },
        });

        // Wait for WS to be connected:
        await ws.waitForOpen();

        // Subscript to script
        ws.subscribeToScript(type, hash);
    } catch (err) {
        console.log(
            'articleTxListener: Error in chronik websocket subscription: ' + err,
        );
    }
};

/**
 * Subscribes to a given address and listens for new websocket events
 *
 * @param {string} chronik the chronik-client instance
 * @param {string} address the eCash address of the active wallet
 * @param {string} txType the descriptor of the nature of this tx
 * @param {callback fn} refreshCallback a callback function to either refresh inbox or townhall history
 * @throws {error} err chronik websocket subscription errors
 */
export const txListener = async (chronik, address, txType, refreshCallback = false) => {
    // Get type and hash
    const { type, hash } = cashaddr.decode(address, true);

    try {
        const ws = chronik.ws({
            onMessage: msg => {
                if (msg.msgType === 'TX_ADDED_TO_MEMPOOL') {

                    // Notify user
                    toast(`${txType} sent`);

                    // Unsubscribe and close websocket
                    ws.unsubscribeFromScript(type, hash);
                    ws.close();

                    // Refresh history
                    if (refreshCallback) {
                        refreshCallback(0);
                    }
                }
            },
        });

        // Wait for WS to be connected:
        await ws.waitForOpen();

        // Subscript to script
        ws.subscribeToScript(type, hash);
    } catch (err) {
        console.log(
            'txListener: Error in chronik websocket subscription: ' + err,
        );
    }
};

/**
 * Permanently subscribes to a given address and listens for new websocket events
 * It silently updates the header balance upon mempool event.
 *
 * @param {string} chronik the chronik-client instance
 * @param {string} address the eCash address of the active wallet
 * @param {callback fn} refreshCallback a callback function to refresh header balance
 * @throws {error} err chronik websocket subscription errors
 */
export const txListenerOngoing = async (chronik, address, refreshCallback = false) => {
    // Get type and hash
    const { type, hash } = cashaddr.decode(address, true);

    try {
        const ws = chronik.ws({
            onMessage: msg => {
                if (msg.msgType === 'TX_ADDED_TO_MEMPOOL') {
                    // Refresh history
                    if (refreshCallback) {
                        (async () => {
                            const updatedCache = await refreshUtxos(chronik, address);
                            refreshCallback(updatedCache.xecBalance);
                        })();
                    }
                }
            },
        });

        // Wait for WS to be connected:
        await ws.waitForOpen();

        // Subscript to script
        ws.subscribeToScript(type, hash);
    } catch (err) {
        console.log(
            'txListener: Error in chronik websocket subscription: ' + err,
        );
    }
};

/**
 * Subscribes to a given address and listens for new NFT related websocket events
 *
 * @param {string} chronik the chronik-client instance
 * @param {string} address the eCash address of the active wallet
 * @param {string} txType the descriptor of the nature of this tx
 * @param {callback fn} refreshCallback a callback function to either refresh inbox or townhall history
 * @throws {error} err chronik websocket subscription errors
 */
export const nftTxListener = async (chronik, address, toastMsg) => {
    // Get type and hash
    const { type, hash } = cashaddr.decode(address, true);

    try {
        const ws = chronik.ws({
            onMessage: msg => {
                if (msg.msgType === 'TX_ADDED_TO_MEMPOOL') {

                    // Notify user
                    toast(toastMsg);

                    // Unsubscribe and close websocket
                    ws.unsubscribeFromScript(type, hash);
                    ws.close();
                }
            },
        });

        // Wait for WS to be connected:
        await ws.waitForOpen();

        // Subscript to script
        ws.subscribeToScript(type, hash);
    } catch (err) {
        console.log(
            'nftTxListener: Error in chronik websocket subscription: ' + err,
        );
    }
};

// Retrieve tx details
export const getTxDetails = async (chronik, txid) => {
    try {
        const tx = await chronik.tx(txid);
        return tx;
    } catch (err) {
        console.log(`Error in getTxDetails(${txid})`, err);
    }
};


// Retrieves the utxos for an address and calculates the balance
export const getBalance = async (chronik, address) => {
    if (
        chronik === undefined ||
        !cashaddr.isValidCashAddress(address, 'ecash')
    ) {
        return;
    }

    try {
        // Get all utxos for address
        const utxoResp = await chronik.address(address).utxos();
        const utxos = utxoResp.utxos;

        // Filter for XEC utoxs only
        let xecBalance = parseInt(0);
        for (const utxo of utxos) {
            if (typeof utxo.token === 'undefined') {
                xecBalance += parseInt(utxo.value);
            }
        }
        return new Number(
            toXec(xecBalance)
        ).toLocaleString({
            maximumFractionDigits: appConfig.cashDecimals,
        });
    } catch (err) {
        console.log(`Error in getBalance(${address})`, err);
    }
};

// Retrieves tx history via chronik, parses the response into formatted
// objects and filter out eToken or non-msg txs
export const getTxHistory = async (chronik, address, page = 0) => {
    if (
        chronik === undefined ||
        !cashaddr.isValidCashAddress(address, 'ecash')
    ) {
        return;
    }
  
    let txHistoryPage;
    try {
        txHistoryPage = await chronik.address(address).history(page, chronikConfig.txHistoryPageSize);

        const parsedTxs = [];
        const replyTxs = [];
        for (let i = 0; i < txHistoryPage.txs.length; i += 1) {
            const parsedTx = parseChronikTx(
                txHistoryPage.txs[i],
                address,
            );

            // Separate out the replies so they can be rendered underneath the main posts
            if (parsedTx.replyTxid) {
                replyTxs.push(parsedTx);
            } else {
                parsedTxs.push(parsedTx);
            }
        }

        // Filter out eToken and non-message txs
        const parsedAndFilteredTxs = parsedTxs.filter(function (el) {
          return el.isEtokenTx === false &&
                 el.opReturnMessage !== ''
        });
        return {
            txs: parsedAndFilteredTxs,
            replies: replyTxs,
            numPages: txHistoryPage.numPages,
        };
    } catch (err) {
        console.log(`Error in getTxHistory(${address})`, err);
    }
};

// Retrieves article listing tx history via chronik, parses the response into formatted
// objects and filter out eToken or non-msg txs
export const getArticleHistory = async (chronik, address, page = 0) => {
    if (
        chronik === undefined ||
        !cashaddr.isValidCashAddress(address, 'ecash')
    ) {
        return;
    }


    try {
        const lokadIdHistory = await chronik.lokadId(
            opreturnConfig.appPrefixesHex.eCashChat,
        ).history(
            page,
            chronikConfig.txHistoryPageSize,
        );
        const localArticles = await localforage.getItem(appConfig.localArticlesParam);

        const parsedTxs = [];
        const replyTxs = [];
        for (let i = 0; i < lokadIdHistory.txs.length; i += 1) {
            const parsedTx = parseChronikTx(
                lokadIdHistory.txs[i],
                address,
            );

            // Separate out the replies so they can be rendered underneath the main posts
            if (parsedTx.isArticleReply) {
                // populate with additional article info with matching entry from localArticles
                parsedTx.articleObject = localArticles.find((article) => article.hash === parsedTx.opReturnMessage);
                replyTxs.push(parsedTx);
            } else {
                // populate with additional article info with matching entry from localArticles
                parsedTx.articleObject = localArticles.find((article) => article.hash === parsedTx.opReturnMessage);
                parsedTxs.push(parsedTx);
            }
        }

        // Filter out non-article txs
        const parsedAndFilteredTxs = parsedTxs.filter(function (el) {
            return el.isArticle === true ||
                el.isArticleReply === true
        });

        return {
            txs: parsedAndFilteredTxs,
            replies: replyTxs,
            numPages: parsedAndFilteredTxs.length,
        };
    } catch (err) {
        console.log(`Error in getArticleHistory(${address})`, err);
    }
};

/**
 * Parse opReturn output for image src, twitter ID or youtube ID
 *
 * @param {utf-8 string} opReturn the string value of the op_return output
 * @returns {Object} containing attributes for the updated opReturn output and various media contents
 *
 */
export const parseMediaTags = (opReturn) => {
    let updatedImageSrc = false;
    let updatedVideoId = false;
    let updatedTweetId = false;
    let updatedUrl = false
    let updatedOpReturn = opReturn;

    // Parse for any url tags in the message
    if (
        opReturn.includes('[url]') &&
        opReturn.includes('[/url]')
    ) {
        updatedUrl = opReturn.substring(
            opReturn.indexOf('[url]') + 5,
            opReturn.lastIndexOf('[/url]')
        );
        updatedOpReturn = opReturn.replace(`[url]${updatedUrl}[/url]`,' ');
    }

    // Parse for any image tags in the message
    if (
        opReturn.includes('[img]') &&
        opReturn.includes('[/img]')
    ) {
        updatedImageSrc = opReturn.substring(
            opReturn.indexOf('[img]') + 5,
            opReturn.lastIndexOf('[/img]')
        );
        updatedOpReturn = opReturn.replace(`[img]${updatedImageSrc}[/img]`,' ');
    }

    // Parse for any youtube video tags in the message
    if (
        opReturn.includes('[yt]') &&
        opReturn.includes('[/yt]')
    ) {
        updatedVideoId = opReturn.substring(
            opReturn.indexOf('[yt]') + 4,
            opReturn.lastIndexOf('[/yt]')
        );
        updatedOpReturn = opReturn.replace(`[yt]${updatedVideoId}[/yt]`,' ');
    }

    // Parse for any tweet tags in the message
    if (
        opReturn.includes('[twt]') &&
        opReturn.includes('[/twt]')
    ) {
        updatedTweetId = opReturn.substring(
            opReturn.indexOf('[twt]') + 5,
            opReturn.lastIndexOf('[/twt]')
        );
        updatedOpReturn = opReturn.replace(`[twt]${updatedTweetId}[/twt]`,' ');
    }

    return {
        updatedOpReturn: updatedOpReturn,
        updatedImageSrc: updatedImageSrc,
        updatedVideoId: updatedVideoId,
        updatedTweetId: updatedTweetId,
        updatedUrl: updatedUrl,
    }
};

// Parses a single chronik transaction
export const parseChronikTx = (tx, address) => {
    const { hash } = cashaddr.decode(address, true);
    const { inputs, outputs } = tx;
    // Assign defaults
    let incoming = true;
    let xecAmount = new BN(0);
    let etokenAmount = new BN(0);
    let isTokenBurn = false;
    let isEtokenTx = tx.tokenEntries.length > 0;
    const isGenesisTx =
        isEtokenTx &&
        tx.tokenEntries &&
        tx.tokenEntries[0].txType === 'GENESIS';

    // Initialize required variables
    const txid = tx.txid;
    let airdropFlag = false;
    let airdropTokenId = '';
    let opReturnMessage = '';
    let isCashtabMessage = false;
    let isCashtabEncryptedMessage = false;
    let iseCashChatMessage = false;
    let iseCashChatPost = false;
    let replyAddress = '';
    let recipientAddress = '';
    let aliasFlag = false;
    let imageSrc = false;
    let videoId = false;
    let tweetId = false;
    let replyTxid = false;
    let url = false;
    let isEcashChatEncrypted = false;
    let isXecTip = false;
    let nftShowcaseId = false;
    let articleTxid = false;
    let isArticle = false;
    let isArticleReply = false;

    if (tx.isCoinbase) {
        // Note that coinbase inputs have `undefined` for `thisInput.outputScript`
        incoming = true;
        replyAddress = 'N/A';
    } else {
        // If this is an etoken tx, check for token burn
        if (
            isEtokenTx &&
            new BN(tx.tokenEntries[0].actualBurnAmount).isGreaterThan(0)
        ) {
            // Assume that any eToken tx with a burn is a burn tx
            isTokenBurn = true;
            try {
                const thisEtokenBurnAmount = new BN(tx.tokenEntries[0].actualBurnAmount);

                // Need to know the total output amount to compare to total input amount and tell if this is a burn transaction
                etokenAmount = etokenAmount.plus(thisEtokenBurnAmount);
            } catch (err) {
                // do nothing
                // If this happens, the burn amount will render wrong in tx history because we don't have the info in chronik
                // This is acceptable
            }
        }

        /* 
        Assume the first input is the originating address
        
        https://en.bitcoin.it/wiki/Script for reference
        
        Assume standard pay-to-pubkey-hash tx        
        scriptPubKey: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
        76 + a9 + 14 = OP_DUP + OP_HASH160 + 14 Bytes to push
        88 + ac = OP_EQUALVERIFY + OP_CHECKSIG

        So, the hash160 we want will be in between '76a914' and '88ac'
        ...most of the time ;)
        */

        // Since you may have more than one address in inputs, assume the first one is the replyAddress
        try {
            replyAddress = cashaddr.encodeOutputScript(
                tx.inputs[0].outputScript,
            );
        } catch (err) {
            console.log(
                `Error from cashaddr.encodeOutputScript(${tx.inputs[0].outputScript})`,
                err,
            );
            // If the transaction is nonstandard, don't worry about a reply address for now
            replyAddress = 'N/A';
        }


        if (
            typeof tx.inputs[0].outputScript !== 'undefined' &&
            tx.inputs[0].outputScript.includes(hash)
        ) {
            // Then this is an outgoing tx
            incoming = false;
        }
    }

    // Iterate over outputs to get the amount sent
    for (let i = 0; i < tx.outputs.length; i += 1) {
        const thisOutput = tx.outputs[i];
        const thisOutputReceivedAtHash160 = thisOutput.outputScript;

        // Uses output[1] as the intended recipient address
        if (i === 1) {
            recipientAddress = cashaddr.encodeOutputScript(thisOutputReceivedAtHash160);
        }

        if (
            thisOutputReceivedAtHash160.startsWith(
                opreturnConfig.opReturnPrefixHex,
            )
        ) {
            // If this is an OP_RETURN output, parse it
            const stackArray = getStackArray(thisOutputReceivedAtHash160);

            const lokad = stackArray[0];
            switch (lokad) {
                case opreturnConfig.appPrefixesHex.airdrop: {
                    // this is to facilitate special Cashtab-specific cases of airdrop txs, both with and without msgs
                    // The UI via Tx.js can check this airdropFlag attribute in the parsedTx object to conditionally render airdrop-specific formatting if it's true
                    airdropFlag = true;
                    // index 0 is drop prefix, 1 is the token Id, 2 is msg prefix, 3 is msg
                    airdropTokenId =
                        stackArray.length >= 2 ? stackArray[1] : 'N/A';

                    // Legacy airdrops used to add the Cashtab Msg lokad before a msg
                    if (stackArray.length >= 3) {
                        // If there are pushes beyond the token id, we have a msg
                        isCashtabMessage = true;
                        if (
                            stackArray[2] ===
                                opreturnConfig.appPrefixesHex.cashtab &&
                            stackArray.length >= 4
                        ) {
                            // Legacy airdrops also pushed hte cashtab msg lokad before the msg
                            opReturnMessage = Buffer.from(stackArray[3], 'hex');
                        } else {
                            opReturnMessage = Buffer.from(stackArray[2], 'hex');
                        }
                    }
                    break;
                }
                case opreturnConfig.appPrefixesHex.cashtab: {
                    isCashtabMessage = true;
                    if (stackArray.length >= 2) {
                        opReturnMessage = Buffer.from(stackArray[1], 'hex');
                    } else {
                        opReturnMessage = 'off-spec Cashtab Msg';
                    }
                    break;
                }
                case opreturnConfig.appPrefixesHex.cashtabEncrypted: {
                    // Encrypted Cashtab msgs are deprecated, set a standard msg
                    isCashtabMessage = true;
                    isCashtabEncryptedMessage = true;
                    opReturnMessage = 'Encrypted Cashtab Msg';
                    break;
                }
                case opreturnConfig.appPrefixesHex.aliasRegistration: {
                    aliasFlag = true;
                    if (stackArray.length >= 3) {
                        opReturnMessage = Buffer.from(stackArray[2], 'hex');
                    } else {
                        opReturnMessage = 'off-spec alias registration';
                    }
                    break;
                }
                case opreturnConfig.appPrefixesHex.paybutton: {
                    // Paybutton tx
                    // For now, Cashtab only supports version 0 PayButton txs
                    // ref doc/standards/paybutton.md
                    // https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/doc/standards/paybutton.md

                    // <lokad> <version> <data> <paymentId>

                    if (stackArray.length !== 4) {
                        opReturnMessage = 'off-spec PayButton tx';
                        break;
                    }
                    if (stackArray[1] !== '00') {
                        opReturnMessage = `Unsupported version PayButton tx: ${stackArray[1]}`;
                        break;
                    }
                    const dataHex = stackArray[2];
                    const nonceHex = stackArray[3];

                    opReturnMessage = `PayButton${
                        nonceHex !== '00' ? ` (${nonceHex})` : ''
                    }${
                        dataHex !== '00'
                            ? `: ${Buffer.from(dataHex, 'hex').toString()}`
                            : ''
                    }`;
                    break;
                }
                case opreturnConfig.appPrefixesHex.eCashChat: {
                    if (stackArray.length >= 2) {
                        if (stackArray[1] === opreturnConfig.townhallPostPrefixHex) {
                            opReturnMessage = Buffer.from(stackArray[2], 'hex');
                            iseCashChatPost = true;
                        } else if (stackArray[1] === opreturnConfig.townhallReplyPostPrefixHex) {
                            replyTxid = stackArray[2];
                            opReturnMessage = Buffer.from(stackArray[3], 'hex');
                            iseCashChatPost = true;
                        } else if (stackArray[1] === opreturnConfig.nftShowcasePrefixHex) {
                            nftShowcaseId = stackArray[2];
                            opReturnMessage = Buffer.from(stackArray[3], 'hex');
                            iseCashChatPost = true;
                        } else if (stackArray[1] === opreturnConfig.articlePrefixHex) {
                            opReturnMessage = Buffer.from(stackArray[2], 'hex');
                            isArticle = true;
                        } else if (stackArray[1] === opreturnConfig.articleReplyPrefixHex) {
                            articleTxid = stackArray[2];
                            opReturnMessage = Buffer.from(stackArray[3], 'hex');
                            isArticleReply = true;
                        } else if (stackArray[1] === opreturnConfig.xecTipPrefixHex) {
                            // This is an XEC tip tx
                            iseCashChatMessage = true;
                            isXecTip = true;
                            opReturnMessage = Buffer.from(stackArray[2], 'hex');
                        } else {
                            // Direct wallet to wallet message, check for encryption
                            if (stackArray[1] === opreturnConfig.encryptedMessagePrefixHex) {
                                opReturnMessage = Buffer.from(stackArray[2], 'hex');
                                iseCashChatMessage = true;
                                isEcashChatEncrypted = true;
                            } else {
                                opReturnMessage = Buffer.from(stackArray[1], 'hex');
                                iseCashChatMessage = true;
                            }
                        }
                    } else {
                        opReturnMessage = 'off-spec eCash Chat Msg';
                    }
                    break;
                }
                default: {
                    // utf8 decode
                    opReturnMessage = Buffer.from(
                        thisOutputReceivedAtHash160,
                        'hex',
                    );

                    break;
                }
            }
            // Continue to the next output, we do not need to parse values for OP_RETURN outputs
            continue;
        }
        // Find amounts at your wallet's address
        if (thisOutputReceivedAtHash160.includes(hash)) {
            // If incoming tx, this is amount received by the user's wallet
            // if outgoing tx (incoming === false), then this is a change amount
            const thisOutputAmount = new BN(thisOutput.value);
            xecAmount = incoming
                ? xecAmount.plus(thisOutputAmount)
                : xecAmount.minus(thisOutputAmount);

            // Parse token qty if token tx
            // Note: edge case this is a token tx that sends XEC to Cashtab recipient but token somewhere else
            if (isEtokenTx && !isTokenBurn) {
                try {
                    const thisEtokenAmount = new BN(
                        thisOutput.token.amount,
                    );

                    etokenAmount =
                        incoming || isGenesisTx
                            ? etokenAmount.plus(thisEtokenAmount)
                            : etokenAmount.minus(thisEtokenAmount);
                } catch (err) {
                    // edge case described above; in this case there is zero eToken value for this Cashtab recipient in this output, so add 0
                    etokenAmount.plus(new BN(0));
                }
            }
        }

        // Output amounts not at your wallet are sent amounts if !incoming
        // Exception for eToken genesis transactions
        if (!incoming) {
            const thisOutputAmount = new BN(thisOutput.value);
            xecAmount = xecAmount.plus(thisOutputAmount);
            if (isEtokenTx && !isGenesisTx && !isTokenBurn) {
                try {
                    const thisEtokenAmount = new BN(thisOutput.token.amount);
                    etokenAmount = etokenAmount.plus(thisEtokenAmount);
                } catch (err) {
                    // NB the edge case described above cannot exist in an outgoing tx
                    // because the eTokens sent originated from this wallet
                }
            }
        }
    }

    /* If it's an eToken tx that 
        - did not send any eTokens to the receiving Cashtab wallet
        - did send XEC to the receiving Cashtab wallet
       Parse it as an XEC received tx
       This type of tx is created by this swap wallet. More detailed parsing to be added later as use case is better understood
       https://www.youtube.com/watch?v=5EFWXHPwzRk
    */
    if (isEtokenTx && etokenAmount.isEqualTo(0)) {
        isEtokenTx = false;
        opReturnMessage = '';
    }
    // Convert from sats to XEC
    xecAmount = xecAmount.shiftedBy(-1 * appConfig.cashDecimals);

    // Convert from BigNumber to string
    xecAmount = xecAmount.toString();

    // Get decimal info for correct etokenAmount
    let genesisInfo = {};

    // Convert opReturnMessage to string
    opReturnMessage = Buffer.from(opReturnMessage).toString();

    if (isEtokenTx) {
        // Get token genesis info from cache
        let decimals = 0;
        try {
            genesisInfo = tx.tokenEntries[0];
            if (genesisInfo.txType === 'GENESIS') {
                genesisInfo.success = true;
            } else {
                genesisInfo = { success: false };
            }
        } catch (err) {
            console.log(
                `Error getting token info from cache in parseChronikTx for ${tx.txid}`,
                err,
            );
            // To keep this function synchronous, do not get this info from the API if it is not in cache
            // Instead, return a flag so that useWallet.js knows and can fetch this info + add it to cache
            genesisInfo = { success: false };
        }
    }
    etokenAmount = etokenAmount.toString();

    if (!isArticle && !isArticleReply) {
        // Parse the opReturn message output for media tags
        const {
            updatedOpReturn,
            updatedImageSrc,
            updatedVideoId,
            updatedTweetId,
            updatedUrl,
        } = parseMediaTags(opReturnMessage);
        opReturnMessage = updatedOpReturn;
        imageSrc = updatedImageSrc;
        videoId = updatedVideoId;
        tweetId = updatedTweetId;
        url = updatedUrl;
    }

    // Parse the tx's date and time
    let txDate, txTime;
    if (tx.timeFirstSeen === 0) {
        // If chronik does not have a timeFirstSeen for this tx
        if (!('block' in tx)) {
            // If it is also unconfirmed, we have nothing to go on here
            // Do not render txDate or txTime
            txDate = false;
            txTime = false;
        } else {
            // If it is confirmed, use the block timestamp
            txDate = formatDate(tx.block.timestamp, navigator.language);
            txTime = new Date(
                parseInt(`${tx.block.timestamp}000`),
            ).toLocaleTimeString();
        }
    } else {
        // If it is unconfirmed and we have data.timeFirstSeen, use that
        txDate = formatDate(tx.timeFirstSeen, navigator.language);
        txTime = new Date(
            parseInt(`${tx.timeFirstSeen}000`),
        ).toLocaleTimeString();
    }

    // Return eToken specific fields if eToken tx
    if (isEtokenTx) {
        return {
            txid,
            incoming,
            xecAmount,
            isEtokenTx,
            etokenAmount,
            isTokenBurn,
            genesisInfo,
            airdropFlag,
            airdropTokenId,
            opReturnMessage: '',
            isCashtabMessage,
            isCashtabEncryptedMessage,
            isEcashChatEncrypted,
            iseCashChatPost,
            replyAddress,
            recipientAddress,
            imageSrc,
            videoId,
            txDate,
            txTime,
            tweetId,
            replyTxid,
            url,
            isXecTip,
            nftShowcaseId,
            articleTxid,
            isArticle,
            isArticleReply,
        };
    }
    // Otherwise do not include these fields
    return {
        txid,
        incoming,
        xecAmount,
        isEtokenTx,
        airdropFlag,
        airdropTokenId,
        opReturnMessage,
        isCashtabMessage,
        isCashtabEncryptedMessage,
        isEcashChatEncrypted,
        iseCashChatMessage,
        iseCashChatPost,
        replyAddress,
        recipientAddress,
        aliasFlag,
        imageSrc,
        videoId,
        txDate,
        txTime,
        tweetId,
        replyTxid,
        url,
        isXecTip,
        nftShowcaseId,
        articleTxid,
        isArticle,
        isArticleReply,
    };
};
