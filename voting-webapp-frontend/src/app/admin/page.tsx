'use client';

import { Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Admin() {
  const router = useRouter();
  useEffect(() => {
    router.push('/admin/upload');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Text>Redirecting...</Text>
    </>
  )
}
