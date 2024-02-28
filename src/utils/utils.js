import cashaddr from 'ecashaddrjs';

export const getHashFromAddress = async (address) => {
    let hash;
    try {
        const {hash } = cashaddr.decode(address, true);
        return hash;
    } catch (err) {
        console.log('Error in getHashFromAddress(): ', err);
        return 'Invalid address';
    }
};
