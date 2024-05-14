export const AnonAvatar = () => {
    return (
      <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
          <svg className="absolute w-12 h-12 text-blue-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
          </svg>
      </div>
    );
};

export const ShareIcon = () => {
    return (
        <svg className="w-8 h-8 text-blue-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M7.926 10.898 15 7.727m-7.074 5.39L15 16.29M8 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm12 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm0-11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
        </svg>
    );
};

export const ReplyIcon = () => {
    return (
        <svg className="w-8 h-8 text-blue-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.5 8.046H11V6.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49c.624.556 1.524.027 1.524-.893v-1.928h2a3.023 3.023 0 0 1 3 3.046V19a5.593 5.593 0 0 0-1.5-10.954Z"/>
        </svg>
    );
};

export const EmojiIcon = () => {
    return (
        <svg className="h-6 w-6 text-white-500" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
    );
};

export const SearchIcon = () => {
    return (
        <svg className="h-4 w-4 text-white-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z"/>
            <circle cx="10" cy="10" r="7" />
            <line x1="21" y1="21" x2="15" y2="15" />
        </svg>
    );
};

export const ResetIcon = () => {
    return (
        <svg className="h-4 w-4 text-white-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
    );
};

export const ExportIcon = () => {
    return (
        <svg className="h-4 w-4 text-white-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
};

export const SendIcon = () => {
    return (
        <svg className="h-6 w-6 text-white-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    );
};

export const PostIcon = () => {
    return (
        <svg className="h-6 w-6 text-white-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
        </svg>
    );
};

export const LogoutIcon = () => {
    return (
        <svg className="h-6 w-6 text-white-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z"/>
            <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
            <path d="M7 12h14l-3 -3m0 6l3 -3" />
        </svg>
    );
};

export const ImageIcon = () => {
    return (
        <svg className="h-6 w-6 text-white-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z"/>
            <line x1="15" y1="8" x2="15.01" y2="8" />
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <path d="M4 15l4 -4a3 5 0 0 1 3 0l 5 5" />
            <path d="M14 14l1 -1a3 5 0 0 1 3 0l 2 2" />
        </svg>
    );
};

export const AliasIcon = () => {
    return (
        <svg className="h-6 w-6 text-white-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
    );
};

export const EncryptionIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
        <path fill="#4382FF" d="M12 4C10.3423 4 9 5.34228 9 7V13.54H7V7C7 4.23772 9.23772 2 12 2C13.3783 2 14.6264 2.56465 15.5322 3.45803L15.542 3.46772C16.4354 4.37351 17 5.62167 17 7V13.54H15V7C15 6.18076 14.6666 5.43086 14.1229 4.87712C13.5691 4.33336 12.8192 4 12 4Z" clipRule="evenodd" fillRule="evenodd" undefined="1"></path>
        <path fill="#4382FF" d="M12 22C8.69 22 6 19.31 6 16C6 12.69 8.69 10 12 10C15.31 10 18 12.69 18 16C18 19.31 15.31 22 12 22Z" undefined="1"></path>
        <path strokeLinejoin="round" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1" stroke="#000000" d="M12 15.75C12.2761 15.75 12.5 15.5261 12.5 15.25C12.5 14.9739 12.2761 14.75 12 14.75C11.7239 14.75 11.5 14.9739 11.5 15.25C11.5 15.5261 11.7239 15.75 12 15.75Z"></path>
        <path strokeLinejoin="round" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="1" stroke="#000000" d="M12 17.25V15.75"></path>
        </svg>
    );
};

export const DecryptionIcon = () => {
    return (
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
        </svg>
    );
};

export const MoneyIcon = () => {
    return (
        <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
    );
};

export const YoutubeIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
        <path strokeLinejoin="round" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1" stroke="#221b38" fill="none" d="M19.57 20H4.43C3.09 20 2 18.87 2 17.46V6.53C2 5.13 3.09 4 4.43 4H19.58C20.91 4 22 5.13 22 6.53V17.46C22 18.87 20.91 20 19.57 20Z"></path>
        <path strokeLinejoin="round" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1" stroke="#221b38" fill="none" d="M9 8V16L16 11.56L9 8Z"></path>
        </svg>
   );
};


export const AlitacoffeeIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="#111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v-.066c0-.375.188-.726.5-.934.312-.208.5-.559.5-.934V2m3 2v-.066c0-.375.188-.726.5-.934.312-.208.5-.559.5-.934V2m3 2v-.066c0-.375.188-.726.5-.934.312-.208.5-.559.5-.934V2" opacity=".28"/>
        <path stroke="#09090B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.916 16c.012-.072.023-.144.033-.217C18 15.393 18 14.93 18 14v-2.8c0-.498 0-.886-.02-1.2m-.064 6a6 6 0 0 1-5.133 4.949C12.393 21 11.93 21 11 21c-.929 0-1.393 0-1.783-.051a6 6 0 0 1-5.166-5.166C4 15.393 4 14.93 4 14v-2.8c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C5.52 8 6.08 8 7.2 8h7.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874c.121.238.175.516.199.908m-.065 6H19a3 3 0 1 0 0-6h-1.02"/>
      </svg>
      
   );
};

export const DefaultavatarIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="#111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.995 19.147C18.893 17.393 17.367 16 15.5 16h-7c-1.867 0-3.393 1.393-3.495 3.147m13.99 0A9.97 9.97 0 0 0 22 12c0-5.523-4.477-10-10-10S2 6.477 2 12a9.97 9.97 0 0 0 3.005 7.147m13.99 0A9.967 9.967 0 0 1 12 22a9.967 9.967 0 0 1-6.995-2.853M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
      </svg>    
   );
};

export const ReplieduseravatarIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="#111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15H8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 4 4 0 0 0-4-4Z" opacity=".28"/>
        <path stroke="#111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>
        </svg>   
   );
};

export const Arrowright2Icon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
        <path fill="#09090b" d="M2 12C2 11.4477 2.44772 11 3 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H3C2.44772 13 2 12.5523 2 12Z" cliprule="evenodd" fillrule="evenodd" undefined="1"></path>
        <path fill="#09090b" d="M14.2929 5.29289C14.6834 4.90237 15.3166 4.90237 15.7071 5.29289L21.7071 11.2929C22.0976 11.6834 22.0976 12.3166 21.7071 12.7071L15.7071 18.7071C15.3166 19.0976 14.6834 19.0976 14.2929 18.7071C13.9024 18.3166 13.9024 17.6834 14.2929 17.2929L19.5858 12L14.2929 6.70711C13.9024 6.31658 13.9024 5.68342 14.2929 5.29289Z" clip-rule="evenodd" fill-rule="evenodd" undefined="1"></path>
        </svg>
         
   );
};

export const EcashchatIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 270 258" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_bddd_635_16)">
        <path d="M134.835 224.901C179.982 189.833 180.781 260.857 235.961 203.481M33.7087 224.852L64.346 224.899C68.7218 224.906 70.9096 224.909 72.9688 224.438C74.7945 224.021 76.5399 223.33 78.1408 222.392C79.9465 221.334 81.4935 219.853 84.5877 216.891L230.359 77.3419C236.315 71.6405 237.795 62.8255 233.258 55.8591C227.773 47.4377 220.271 40.1963 211.541 34.8201C204.544 30.5111 195.356 31.4548 189.472 37.0868L42.809 177.49C39.8262 180.345 38.3348 181.773 37.2531 183.435C36.2938 184.909 35.5749 186.514 35.1209 188.195C34.6089 190.091 34.5566 192.109 34.4521 196.146L33.7087 224.852Z" stroke="black" stroke-width="22" strokelinecap="round" strokelinejoin="round"/>
        </g>
        <defs>
        <filter id="filter0_bddd_635_16" x="-20" y="-20" width="309.67" height="297.029" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feGaussianBlur in="BackgroundImageFix" stdDeviation="10"/>
        <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_635_16"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="10"/>
        <feGaussianBlur stdDeviation="5"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="effect1_backgroundBlur_635_16" result="effect2_dropShadow_635_16"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
        <feBlend mode="normal" in2="effect2_dropShadow_635_16" result="effect3_dropShadow_635_16"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="1"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
        <feBlend mode="normal" in2="effect3_dropShadow_635_16" result="effect4_dropShadow_635_16"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_635_16" result="shape"/>
        </filter>
        </defs>
        </svg>        
   );
};











