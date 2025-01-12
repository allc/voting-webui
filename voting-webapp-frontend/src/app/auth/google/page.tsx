'use client';

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      console.log(json);
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
    // localStorage.removeItem('state');
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
