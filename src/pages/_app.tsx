import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { SideNav } from "~/components/SideNav";
import { Toaster } from "react-hot-toast";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Toaster />
      <Head>
        <title>Twitter Clone</title>
        <meta
          name="description"
          content="This is a Twitter Clone follow along tutorial created by Web Dev Simplified"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="align-items-start container mx-auto flex sm:pr-4">
        <SideNav />
        <div className="min-h-screen flex-grow border-x">
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
