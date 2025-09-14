import { type AppType } from "next/app";
import React from "react";
import {ToastContainer} from 'react-toastify';
import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider
      appearance={{
        theme: 'simple',
      }}
    >
      <div>
        <Component {...pageProps} />
        <ToastContainer autoClose={3000} pauseOnHover position="bottom-left" />
      </div>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);