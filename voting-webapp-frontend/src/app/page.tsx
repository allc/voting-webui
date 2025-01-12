'use client';

import { Button, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { use, useContext, useEffect } from "react";
import { UserContext } from "./UserProvider";

export default function Home() {
  const router = useRouter();
  const [user] = useContext(UserContext);

  const handleAdminLoginButtonClick = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/auth/google`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      const { url, state } = json;
      localStorage.setItem('state', state);
      router.push(url);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  }

  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user]);

  return (
    <>
      <Title order={1}>Admin Login</Title>
      <Button variant="subtle" rightSection={<IconArrowRight />} onClick={handleAdminLoginButtonClick}>
        Login
      </Button>
    </>
  )
}
