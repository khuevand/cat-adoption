import { useState, useEffect} from "react";
import Image from "next/image";
import Head from "next/head";
import Footer from "~/component/footer";
import Navigation from "~/component/navigationTab";
import PageLoading from "~/component/loadingPage";
import { api } from "~/utils/api";

export default function Application(){
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
      <>
      <Head>
        <title>Adopt a Cat</title>
        <link rel="icon" href="/ava.png"/>
      </Head>

      <main className="h-full w-full flex flex-col bg-[#fffbf5] gap-10">
        {isLoading && <PageLoading />}
        <Navigation/>
      </main>
    </>
  )
}