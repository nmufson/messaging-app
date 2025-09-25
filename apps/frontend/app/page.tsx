import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-brand-dark w-full h-64">
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-white text-center m-0">
          Welcome to Quick Chat
        </h1>
        <div className="flex flex-col justify-center border border-solid border-black p-4">
          <p className="text-red-500">
            Sign Up or Log In to start messaging your friends and creating group
            chats!
          </p>
          <div>
            <Link href="/signup">
              <button className="px-4 py-2 text-white ">Sign Up</button>
            </Link>
            <Link href="/login">
              <button className="px-4 py-2 rounded">Log In</button>
            </Link>
          </div>
          <div>
            <p>Or, continue as guest</p>
          </div>
        </div>
      </div>
    </main>
  );
}
