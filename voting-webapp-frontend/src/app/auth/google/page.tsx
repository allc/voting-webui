'use client';

import { UserContext } from "@/app/UserProvider";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, auth] = useContext(UserContext);

  const login = async (code: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        alert('Failed to login');
        router.push('/');
      }
      const json = await response.json();
      const accessToken = json.access_token;
      localStorage.setItem('access_token', accessToken);
      auth();
      router.push('/admin');
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  };

  useEffect(() => {
    const storedState = localStorage.getItem('state');
    const state = searchParams.get('state');
    localStorage.removeItem('state');
    if (storedState && storedState === state) {
      const code = searchParams.get('code');
      if (code) {
        login(code);
      } else {
        alert('Invalid code');
        router.push('/');
      }
    } else {
      alert('Invalid state');
      router.push('/');
    }
  }, []);

  return (
    <>
      <p>Please wait...</p>
    </>
  )
}
