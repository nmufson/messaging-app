import Link from 'next/link';
export default function Home() {
    return (<main className="w-full h-screen h-64 p-4 flex flex-col items-center justify-center bg-brand-light">
      <div className="flex flex-col items-center justify-center">
        <h1 className="font-bold text-center m-0">Welcome to Quick Chat</h1>
        <div className="flex flex-col justify-center text-center border border-solid border-black p-4 mt-4">
          <p className="">
            Sign Up or Log In to start messaging your friends and creating group
            chats!
          </p>
          <div className="flex gap-2 justify-center my-3">
            <Link href="/signup">
              <button className="px-4 py-2 text-white">Sign Up</button>
            </Link>
            <Link href="/login">
              <button className="px-4 py-2 rounded text-white">Log In</button>
            </Link>
          </div>
          <div>
            <p>
              Or, continue as{' '}
              <Link href="/messages" className="text-blue-600 hover:underline">
                guest
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>);
}
