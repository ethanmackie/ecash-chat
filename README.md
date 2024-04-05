# ecash-chat


## Key Features

- One-click metamask-like login experience
- Direct wallet to wallet and an all-in townhall forum
- Displays only messaging transactions
- Real time address specific filtering
- XEC Tipping on addresses
- Integrated with the eCash Alias protocol
- Enables embedding of images, Youtube videos, Twitter tweets and emojis in messages
- Powered by In-Node Chronik and Cashtab Extensions

## Specifications

The eCash Chat protocol adopts the following onchain hex prefixes:
- Post a message = 63686174 (chat) + 706f7374 (post) + [utf-8 message]
- Reply to post = 63686174 (chat) + 68617368 (reply) + [txid of original post] + [utf-8 reply message]
- Set profile pic = 63686174 (chat) + 70696373 (pics) + [utf-8 NFT id] (not implemented yet)

To assist with web apps in rendering these actions accordingly, here are some examples:

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


## Implementation Roadmap

**V1**
- [x] Address retrieval via extension under NextJs framework
- [x] Retrieve single page tx history data via chronik
- [x] Switch to ChronikClientNode and use the new address() API
- [x] Standalone Tx History component
- [ ] Work with UI SME to modernize the app's UI/UX
- [x] Pagination for tx history
- [x] Add eslint and apply to codebase
- [x] Parsing of tx history to render all OP_RETURN messages
- [x] Implement Jest + add unit tests for chronik, alias-server & utils
- [x] Add input validation + unit tests
- [x] Retrieve registered and pending aliases for extension wallet
- [x] Wallet Messaging: Send Message feature which sends a query string to Cashtab Extensions using the nominal 5.5 XEC as amount
- [x] Wallet Messaging: Optional send value with message tx
- [x] Wallet Messaging: Enables the use of alias as a destination address
- [x] Real time filter on tx history for a specific address
- [x] Integrate emoji picker into the message input field
- [x] Embed images and video thumbnails into messages via [img] and [video] tags
- [x] Unique rendering of own address as sender or receiver
- [x] Tipping function
- [x] Add eCash Chat protocol identifier to outbound messages
- [x] Add QR code next to wallet address
- [x] Add timestamps to messages
- [x] Log in and log out functionality
- [x] Detect extension status and render accordingly
- [x] Add avatars to each address
- [x] Enable embedding of tweets in messages
- [x] Embedding markup buttons for image, youtube video and tweet markups in messages
- [x] Export chat history
- [x] Sharing of chat content with other social platforms
- [ ] Add integration tests
- [ ] Implement google analytics
- [ ] Explore File sharing feasibility

**V2**
- [x] Public Town Hall: Basic posting and history parsing functions
- [x] Public Town Hall: Implement onchain reply post protocol
- [ ] Implement DDOS mitigations
- [ ] Follow function
- [ ] Like function for the post which will be factored to a post's rating
- [ ] Public go live
