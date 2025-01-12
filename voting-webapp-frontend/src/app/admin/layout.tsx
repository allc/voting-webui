'use client';

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { UserContext } from "../UserProvider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [user, auth] = useContext(UserContext);

  useEffect(() => {
    if (user === false) {
      router.push('/');
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    auth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <>
      {children}
    </>
  );
}