'use client';

import { Button, Card, Center, Container, Group, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  return (
    <>
      <Title order={1}>Admin Login</Title>
      <Button variant="subtle" component={Link} href={`${process.env.NEXT_PUBLIC_API_SERVER}/api/auth/google`} rightSection={<IconArrowRight />}>
        Login
      </Button>
    </>
  )
}
