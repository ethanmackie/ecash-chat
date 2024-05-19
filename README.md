# ecash-chat


## Key Features

- One-click metamask-like login experience
- Direct wallet to wallet and an all-in townhall forum
- Message encryption option via AES 256 CBC algorithm
- Full length articles
- NFT showcase
- Displays only messaging transactions
- Real time address specific filtering
- XEC Tipping on addresses
- Integrated with the eCash Alias protocol
- Enables embedding of images, Youtube videos, Twitter tweets and emojis in messages
- Powered by In-Node Chronik and Cashtab Extensions

## Specifications

The eCash Chat protocol adopts the following onchain hex prefixes:
- Send a wallet to wallet message = 63686174 (chat) + [utf-8 message]
- Send an encrypted wallet to wallet message = 63686174 (chat) + 70617373 (pass) + [utf-8 message]
- Tipping XEC to another wallet = 63686174 (chat) + 74697073 (tips) + [optional utf-8 message]
- Post an article = 63686174 (chat) + 626c6f67 (blog) + [utf-8 article]
- Reply to an article = 63686174 (chat) + 726c6f67 (reply to article) + [txid of original article] + [utf-8 reply message]
- Post to townhall = 63686174 (chat) + 706f7374 (post) + [utf-8 message]
- Reply to a townhall post = 63686174 (chat) + 68617368 (reply) + [txid of original post] + [utf-8 reply message]
- Showcase an NFT to townhall = 63686174 (chat) + 6e667473 (nfts) + [txid of nft] + [utf-8 reply message]
- Set profile pic = 63686174 (chat) + 70696373 (pics) + [utf-8 NFT id] (not implemented yet)

To assist with web apps in rendering these actions accordingly, here are some example breakdowns:

**Send a direct wallet to wallet message**
```
OP_RETURN Hex
6a04636861742a6a7573742061206e6f726d616c2077616c6c657420746f2077616c6c6574206d657373616765f09f918d

Hex breakdown
- 6a (OP_RETURN)
- 04 (pushdata byte indicating 4 bytes / 8 chars)
- 63686174 (eCash Chat's protocol prefix)
- 2a (pushdata byte indicating 42 bytes / 84 chars)
- 6a7573742061206e6f726d616c2077616c6c657420746f2077616c6c6574206d657373616765f09f918d (the utf8 message)
```

**Send an encrypted direct wallet to wallet message**
```
OP_RETURN Hex
6a04636861740470617373203165376334343363336363346365633338326562343733303839366238313433

Hex breakdown
- 6a (OP_RETURN)
- 04 (pushdata byte indicating 4 bytes / 8 chars)
- 63686174 (eCash Chat's protocol prefix)
- 04 (pushdata byte indicating 4 bytes / 8 chars)
- 70617373 (eCash Chat's encryption prefix)
- 20 (pushdata byte indicating 32 bytes / 64 chars)
- 3165376334343363336363346365633338326562343733303839366238313433 (the encrypted utf8 message)
```

**Post a message to townhall**
```
OP_RETURN Hex
6a046368617404706f737423636865636b2074686973206f7574205b79745d74416c367350524651676b5b2f79745d

Hex breakdown
- 6a (OP_RETURN)
- 04 (pushdata byte indicating 4 bytes / 8 chars)
- 63686174 (eCash Chat's protocol prefix)
- 04 (pushdata byte indicating 4 bytes / 8 chars)
- 706f7374 (eCash Chat's townhall post prefix)
- 23 (pushdata byte indicating 35 bytes / 70 chars)
- 636865636b2074686973206f7574205b79745d74416c367350524651676b5b2f79745d (the post content)
```

**Post a reply to an existing message on townhall**
```
OP_RETURN Hex
6a046368617404686173682087928ef3d1c89be1a0e961b45a27680d96258b7b3a05d36115381739b335df943754686973206973206d79207265706c7920746f2074686520654361736820696e74726f20766964656f202d20636f6f6c20737475666621

Hex breakdown
- 6a (OP_RETURN)
- 04 (pushdata byte indicating 4 bytes / 8 chars)
- 63686174 (eCash Chat's protocol prefix)
- 04 (pushdata byte indicating 4 bytes / 8 chars)
- 68617368 (eCash Chat's townhall reply post prefix)
- 20 (pushdata byte indicating 32 bytes / 64 chars)
- 87928ef3d1c89be1a0e961b45a27680d96258b7b3a05d36115381739b335df94 (txid of original post)
- 37 (pushdata byte indicating 55 bytes / 110 chars)
- 54686973206973206d79207265706c7920746f2074686520654361736820696e74726f20766964656f202d20636f6f6c20737475666621 (the reply message)
```

## Development

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

Runs the app in development mode.

The page will reload if you make edits.
You will also see any lint errors in the console.

## Testing

```bash
npm run test
```

## Deploy on Vercel

The easiest way to deploy to the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Production

In the project directory, run:

```bash
npm run build
```

Builds the app for production to the `build` folder.
