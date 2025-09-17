import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SignInButton, SignOutButton, SignedOut } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { LogOut, File, User } from "lucide-react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function Navigation(){
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // useEffect(() => {
  //   if (!isLoaded || !isSignedIn){
  //     return;
  //   }
  // })

  const {data: me} = api.user.me.useQuery(undefined, {enabled: isLoaded, retry: false, refetchOnWindowFocus: false,});
  
  return(
    <div className="flex items-center justify-between p-4 bg-[#fab24e]">
      <div className="flex items-center gap-5">
        <button className="flex items-center gap-2 cursor-pointer"
          onClick={() => {void router.push("/")}}>
          <Image
            src="/ava.png"
            alt="Clementine Cat Logo"
            className="rounded-full"
            width={40}
            height={40}
          />
          <span className="text-[20px] font-medium"> Clementine Cat</span>
        </button>

        <div className="flex justify-center text-[15px] gap-3">
          <Link
            href="/donate"
            className={`flex items-center font-medium ${router.pathname === "/donate" ? "underline underline-offset-4" : ""} hover:text-gray-700 hover:underline cursor-pointer`}
          >
            <span>Donate</span>
            <ChevronRight className="ml-1 h-3 w-3 shrink-0" />
          </Link>

          <Link
            href="/adopt"
            className={`flex items-center font-medium ${router.pathname === "/adopt" ? "underline underline-offset-4" : ""} hover:text-gray-700 hover:underline cursor-pointer`}
          >
            <span>Adopt</span>
            <ChevronRight className="ml-1 h-3 w-3 shrink-0" />
          </Link>
          
          <Link
            href="/lost"
            className={`flex items-center font-medium ${router.pathname === "/lost" ? "underline underline-offset-4" : ""} hover:text-gray-700 hover:underline cursor-pointer`}
          >
            <span>Lost cat</span>
            <ChevronRight className="ml-1 h-3 w-3 shrink-0" />
          </Link>

          <Link
            href="/contact"
            className={`flex items-center font-medium ${router.pathname === "/contact" ? "underline underline-offset-4" : ""} hover:text-gray-700 hover:underline cursor-pointer`}
          >
            <span>Contact</span>
            <ChevronRight className="ml-1 h-3 w-3 shrink-0" />
          </Link>

          <Link
            href="/information"
            className={`flex items-center font-medium ${router.pathname === "/information" ? "underline underline-offset-4" : ""} hover:text-gray-700 hover:underline cursor-pointer`}
          >
            <span>About us</span>
            <ChevronRight className="ml-1 h-3 w-3 shrink-0" />
          </Link>

          {me?.role === "ADMIN" && (
            <>
              <Link 
                href="/uploadCat"
                className={`flex items-center font-medium ${router.pathname === "/uploadCat" ? "underline underline-offset-4" : ""} hover:text-gray-700 hover:underline cursor-pointer`}
              >
                <span>Upload Cat</span>
                <ChevronRight className="ml-1 h-3 w-3 shrink-0" />
              </Link>

              <Link 
                href="/application"
                className={`flex items-center font-medium ${router.pathname === "/application" ? "underline underline-offset-4" : ""} hover:text-gray-700 hover:underline cursor-pointer`}
              >
                <span>Application</span>
                <ChevronRight className="ml-1 h-3 w-3 shrink-0" />
              </Link>
            </>
          )}
        </div>
      </div>

      {isSignedIn ? (
        <div className="relative inline-block">
          <button onClick={toggleMenu}>
            {user?.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="User avatar"
                className="rounded-full hover:ring-gray-100 hover:border-gray-100 cursor-pointer"
                width={32}
                height={32}
              />
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 z-10 w-75 text-[13px] rounded-lg bg-white shadow-lg mt-2 border border-gray-300 ring-opacity-1">
              <div className='px-5 py-4'>
                <p className='font-medium mb-0.5'>{user?.fullName}</p>
                <p className=''>{user?.primaryEmailAddress?.emailAddress}</p>
              </div>

              <div className='mx-4 border-b border-gray-100'/>
              
              <div className="px-3 py-2">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>My profile</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <File className="w-3.5 h-3.5 text-amber-600" />
                  <span>My applications</span>
                </div>
                <SignOutButton redirectUrl="/">
                  <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <LogOut className="w-3.5 h-3.5 text-amber-600" />
                    Log out
                  </button>
                </SignOutButton>
                </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-[15px] text-white font-medium rounded-xl px-3 py-2 bg-black hover:bg-gray-700 hover:text-white cursor-pointer">
                Sign up
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="text-[15px] font-medium rounded-xl px-3 py-2 bg-white hover:bg-gray-100 hover:text-gray-800 cursor-pointer">
                Log in
              </button>
            </SignInButton>
          </SignedOut>
        </div> 
      )}
    </div>
  )
}