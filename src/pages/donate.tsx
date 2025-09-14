import {useState, useEffect} from "react";
import PageLoading from "~/component/loadingPage";
import Navigation from "~/component/navigationTab";

export default function Donate(){
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return(
    <div className="h-full w-full flex flex-col bg-[#fffbf5]">
      {isLoading && <PageLoading />}
      <Navigation isSignedIn={false} />
    </div>
  )
}