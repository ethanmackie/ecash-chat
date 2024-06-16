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
        <path fill="#09090b" d="M2 12C2 11.4477 2.44772 11 3 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H3C2.44772 13 2 12.5523 2 12Z" clipRule="evenodd" fillRule="evenodd" undefined="1"></path>
        <path fill="#09090b" d="M14.2929 5.29289C14.6834 4.90237 15.3166 4.90237 15.7071 5.29289L21.7071 11.2929C22.0976 11.6834 22.0976 12.3166 21.7071 12.7071L15.7071 18.7071C15.3166 19.0976 14.6834 19.0976 14.2929 18.7071C13.9024 18.3166 13.9024 17.6834 14.2929 17.2929L19.5858 12L14.2929 6.70711C13.9024 6.31658 13.9024 5.68342 14.2929 5.29289Z" clipRule="evenodd" fillRule="evenodd" undefined="1"></path>
        </svg>
         
   );
};

export const CrossIcon = () => {
    return (
        <svg className="h-8 w-8 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
    );
};

export const UnlockIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" stroke="#221b38" d="M11 21C6 21 2 17 2 12C2 7 6 3 11 3C16 3 20 7 20 12V13"></path>
        <path stroke-width="1" stroke="#221b38" d="M20 13L21.25 11H18.75L20 13Z"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M14 9V9C14 7.34315 12.6569 6 11 6V6C9.34315 6 8 7.34315 8 9V11"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1" stroke="#221b38" fill="#C4B6FF" d="M7 12C7 11.4477 7.44772 11 8 11H14C14.5523 11 15 11.4477 15 12V16C15 16.5523 14.5523 17 14 17H8C7.44772 17 7 16.5523 7 16V12Z"></path>
        </svg>
    )
}

export const EcashchatIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 270 258" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_bddd_635_16)">
        <path d="M134.835 224.901C179.982 189.833 180.781 260.857 235.961 203.481M33.7087 224.852L64.346 224.899C68.7218 224.906 70.9096 224.909 72.9688 224.438C74.7945 224.021 76.5399 223.33 78.1408 222.392C79.9465 221.334 81.4935 219.853 84.5877 216.891L230.359 77.3419C236.315 71.6405 237.795 62.8255 233.258 55.8591C227.773 47.4377 220.271 40.1963 211.541 34.8201C204.544 30.5111 195.356 31.4548 189.472 37.0868L42.809 177.49C39.8262 180.345 38.3348 181.773 37.2531 183.435C36.2938 184.909 35.5749 186.514 35.1209 188.195C34.6089 190.091 34.5566 192.109 34.4521 196.146L33.7087 224.852Z" stroke="black" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
        <filter id="filter0_bddd_635_16" x="-20" y="-20" width="309.67" height="297.029" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
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

export const LoadingSpinner = () => {
    return (
        <>
        <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status">
        <span
            className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Loading...</span>
        </div>
        &emsp;Chronikfying data...
        </>
    );
};


export const Home3Icon = () => {
    return (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5">
<path d="M15 20.9999V16C15 14.3431 13.6569 13 12 13C10.3431 13 9 14.3431 9 16V20.9999M15 20.9999C16.9767 20.9983 18.0128 20.9732 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C21 17.9603 21 16.8402 21 14.6V12.7587C21 11.7418 21 11.2334 20.8813 10.7571C20.7761 10.3349 20.6028 9.93275 20.3681 9.56641C20.1033 9.15313 19.7337 8.80402 18.9944 8.1058L16.3944 5.65025C14.8479 4.18966 14.0746 3.45937 13.1925 3.18385C12.416 2.94132 11.584 2.94132 10.8075 3.18385C9.92537 3.45937 9.15211 4.18966 7.60561 5.65025L5.00561 8.1058C4.26632 8.80402 3.89667 9.15313 3.63191 9.56641C3.39721 9.93275 3.22385 10.3349 3.11866 10.7571C3 11.2334 3 11.7418 3 12.7587V14.6C3 16.8402 3 17.9603 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.98717 20.9732 7.0233 20.9983 9 20.9999M15 20.9999C13 21.0014 11 21.0014 9 20.9999" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
   );
};

export const File3Icon = () => {
    return (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5">
<path d="M20 11C20 9.34315 18.6569 8 17 8L16.4 8C16.0284 8 15.8426 8 15.6871 7.97538C14.8313 7.83983 14.1602 7.16865 14.0246 6.31287C14 6.1574 14 5.9716 14 5.6V5C14 3.34315 12.6569 2 11 2M20 10V18C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18V6C4 3.79086 5.79086 2 8 2H12C16.4183 2 20 5.58172 20 10Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
   );
};

export const Nft3Icon = () => {
    return (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5">
<path d="M21.9989 10H21C19.607 10 18.9104 10 18.324 10.0603C12.9031 10.6176 8.61758 14.9031 8.06029 20.324C8.03963 20.5249 8.02605 20.7388 8.01712 20.9893M21.9989 10C22 10.3123 22 10.6449 22 11V13C22 15.8003 22 17.2004 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.2004 21 16.8003 21 14 21H10C9.24401 21 8.59006 21 8.01712 20.9893M21.9989 10C21.9912 7.84993 21.9309 6.66397 21.455 5.73005C20.9757 4.78924 20.2108 4.02433 19.27 3.54497C18.2004 3 16.8003 3 14 3H10C7.19974 3 5.79961 3 4.73005 3.54497C3.78924 4.02433 3.02433 4.78924 2.54497 5.73005C2 6.79961 2 8.19974 2 11V13C2 15.8003 2 17.2004 2.54497 18.27C3.02433 19.2108 3.78924 19.9757 4.73005 20.455C5.51086 20.8529 6.46784 20.9603 8.01712 20.9893M7.5 9.5C6.94772 9.5 6.5 9.05228 6.5 8.5C6.5 7.94772 6.94772 7.5 7.5 7.5C8.05228 7.5 8.5 7.94772 8.5 8.5C8.5 9.05228 8.05228 9.5 7.5 9.5Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
   );
};

export const Inbox3Icon = () => {
    return (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5">
<path d="M21.8032 7.76159L16.295 11.2668C14.7385 12.2573 13.9602 12.7526 13.1238 12.9455C12.3843 13.1161 11.6157 13.1161 10.8762 12.9455C10.0398 12.7526 9.26153 12.2573 7.70499 11.2668L2.19678 7.76159M21.8032 7.76159C22 8.72189 22 10.006 22 12C22 14.8003 22 16.2004 21.455 17.27C20.9757 18.2108 20.2108 18.9757 19.27 19.455C18.2004 20 16.8003 20 14 20H10C7.19974 20 5.79961 20 4.73005 19.455C3.78924 18.9757 3.02433 18.2108 2.54497 17.27C2 16.2004 2 14.8003 2 12C2 10.006 2 8.72189 2.19678 7.76159M21.8032 7.76159C21.7237 7.37332 21.6119 7.03798 21.455 6.73005C20.9757 5.78924 20.2108 5.02433 19.27 4.54497C18.2004 4 16.8003 4 14 4H10C7.19974 4 5.79961 4 4.73005 4.54497C3.78924 5.02433 3.02433 5.78924 2.54497 6.73005C2.38807 7.03798 2.27634 7.37332 2.19678 7.76159" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
   );
};

export const Send3Icon = () => {
    return (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5">
<path d="M4.93367 12L3.08987 5.73239C2.60867 4.09667 4.14094 2.58539 5.75514 3.10362C10.2067 4.53274 14.4553 6.53713 18.3948 9.06662C19.5259 9.79292 21 10.4417 21 12C21 13.5583 19.5259 14.2071 18.3948 14.9334C14.4553 17.4629 10.2067 19.4673 5.75514 20.8964C4.14094 21.4146 2.60867 19.9033 3.08987 18.2676L4.93367 12ZM4.93367 12H9.83493" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
   );
};

export const Info3icon = () => {
    return (
<svg width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5">
<path d="M8 18H8.01M7.4 21H8.6C10.8402 21 11.9603 21 12.816 20.564C13.5686 20.1805 14.1805 19.5686 14.564 18.816C15 17.9603 15 16.8402 15 14.6V7.4C15 5.15979 15 4.03968 14.564 3.18404C14.1805 2.43139 13.5686 1.81947 12.816 1.43597C11.9603 1 10.8402 1 8.6 1H7.4C5.15979 1 4.03968 1 3.18404 1.43597C2.43139 1.81947 1.81947 2.43139 1.43597 3.18404C1 4.03968 1 5.15979 1 7.4V14.6C1 16.8402 1 17.9603 1.43597 18.816C1.81947 19.5686 2.43139 20.1805 3.18404 20.564C4.03968 21 5.15979 21 7.4 21Z" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
   );
};


export const User3icon = () => {
    return (
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 14.5V11C2 8.19974 2 6.79961 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.79961 3 7.19974 3 10 3H13.5C14.8978 3 15.5967 3 16.1481 3.22836C16.8831 3.53284 17.4672 4.11687 17.7716 4.85195C17.979 5.35251 17.9981 5.97475 17.9998 7.1313M2 14.5C2 15.8297 2 16.9946 2.3806 17.9134C2.88807 19.1386 3.86144 20.1119 5.08658 20.6194C6.00544 21 7.17029 21 9.5 21H14.5C16.8297 21 17.9946 21 18.9134 20.6194C20.1386 20.1119 21.1119 19.1386 21.6194 17.9134C22 16.9946 22 15.8297 22 14.5C22 12.1703 22 11.0054 21.6194 10.0866C21.1119 8.86144 20.1386 7.88807 18.9134 7.3806C18.639 7.26693 18.3426 7.18721 17.9998 7.1313M2 14.5C2 12.1703 2 11.0054 2.3806 10.0866C2.88807 8.86144 3.86144 7.88807 5.08658 7.3806C6.00544 7 7.17029 7 9.5 7H14.5C16.1339 7 17.1949 7 17.9998 7.1313M14 12H17" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

   );
};


export const QrcodeIcon = () => {
    return (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
<path stroke-linejoin="round" stroke-linecap="round" stroke-width="1" stroke="#221b38" fill="none" d="M9 14H4C3.44772 14 3 14.4477 3 15L3 20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V15C10 14.4477 9.55228 14 9 14Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M7 17H6V18H7V17Z"></path>
<path stroke-linejoin="round" stroke-linecap="round" stroke-width="1" stroke="#221b38" fill="none" d="M20 3L15 3C14.4477 3 14 3.44772 14 4V9C14 9.55228 14.4477 10 15 10H20C20.5523 10 21 9.55228 21 9V4C21 3.44772 20.5523 3 20 3Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M18 6H17V7H18V6Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M7 6H6V7H7V6Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M4 9H3V10H4V9Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M10 9H9V10H10V9Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M4 3H3V4H4V3Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M10 3H9V4H10V3Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M18 17H17V18H18V17Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M15 20H14V21H15V20Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M21 20H20V21H21V20Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M15 14H14V15H15V14Z"></path>
<path stroke-linecap="round" stroke-width="1" stroke="#221b38" d="M21 14H20V15H21V14Z"></path>
</svg>

   );
};

export const Logout3Icon = () => {
    return (
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.1885 9C19.1755 9.74024 20.0668 10.599 20.8426 11.5564C20.9475 11.6859 21 11.843 21 12M18.1885 15C19.1755 14.2598 20.0668 13.401 20.8426 12.4436C20.9475 12.3141 21 12.157 21 12M21 12H8M13 4.52779C11.9385 3.57771 10.5367 3 9 3C5.68629 3 3 5.68629 3 9V15C3 18.3137 5.68629 21 9 21C10.5367 21 11.9385 20.4223 13 19.4722" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

   );
};





