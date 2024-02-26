import Image from "next/image";

export default function Home() {
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
        </div>
        <p>
          eCash Social - onchain social platform (we'll work on the slogan later)&nbsp;
        </p>
      </div>
    </main>
  );
}
