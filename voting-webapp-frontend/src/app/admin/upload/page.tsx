'use client';

import { UserContext } from "@/app/UserProvider";
import { ActionIcon, Card, FileInput, Group, Table, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { use, useContext, useEffect, useState } from "react";

export default function AdminUpload() {
  interface UserListDetails {
    filename: string;
    num_users: number;
    file_sha256: string;
    uploaded_at: string;
    uploaded_by: string;
  }

  const [user] = useContext(UserContext);
  const [userListDetails, setUserListDetails] = useState<UserListDetails | null>(null);

  const loadUserListDetails = async () => {
    if (!user) {
      return;
    }
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/admin/user-list`, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
      },
    });
    if (!result.ok) {
      return;
    }
    const data = await result.json();
    setUserListDetails(data);
  }

  const handleUserListChange = async (file: File | null) => {
    if (!file) {
      return;
    }
    if (!user) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/admin/user-list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: formData,
      });
      if (!result.ok) {
        throw new Error('Failed to upload user list');
      }
      loadUserListDetails();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  }

  const handleDeleteUserList = async () => {
    const confirm = window.confirm('Are you sure you want to delete the user list?');
    if (!confirm) {
      return;
    }
    if (!user) {
      return;
    }
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/admin/user-list`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
      });
      if (!result.ok) {
        throw new Error('Failed to delete user list');
      }
      setUserListDetails(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  }

  useEffect(() => {
    loadUserListDetails();
  }, [user]);

  const userListComponent = userListDetails ? (
    <Card mt='md' withBorder>
      <Group justify="space-between">
        <Title order={2}>User List</Title>
        <ActionIcon variant='filled' aria-label="Delete user list" color="red" onClick={handleDeleteUserList}>
          <IconTrash />
        </ActionIcon>
      </Group>
      <Table variant="vertical">
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Filename</Table.Td>
            <Table.Td>{userListDetails.filename}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Number of users</Table.Td>
            <Table.Td>{userListDetails.num_users}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>SHA256</Table.Td>
            <Table.Td>{userListDetails.file_sha256}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Uploaded at</Table.Td>
            <Table.Td>{userListDetails.uploaded_at}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Uploaded by</Table.Td>
            <Table.Td>{userListDetails.uploaded_by}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Card>
  ) : (
    <Card mt='md' withBorder>
      <FileInput
        label="User list"
        description="To verify users. A list of usernames (without email domain), one per line. Obtained from the membership list"
        placeholder="Select file"
        onChange={handleUserListChange}
      />
    </Card>
  );

  return (
    <>
      <Title order={1}>Upload Voting Forms and User List</Title>
      {userListComponent}
      <FileInput
        label="Voting form"
        description="Main voting form for authenticated users. Downloaded from Microsoft Forms"
        placeholder="Select file"
      />
      <FileInput
        label="Axillary voting form"
        description="Voting form for users who could not access the main voting form, voted in person. Downloaded from Microsoft Forms"
        placeholder="Select file"
      />
    </>
  )
}
