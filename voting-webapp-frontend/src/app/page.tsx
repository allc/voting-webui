'use client';

import { Button, Card, Center, Container, Group, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const handleAdminLoginButtonClick = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/auth/google`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      console.log(json);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  }

  return (
    <>
      <Title order={1}>Admin Login</Title>
      <Button variant="subtle" rightSection={<IconArrowRight />} onClick={handleAdminLoginButtonClick}>
        Login
      </Button>
    </>
  )
}
