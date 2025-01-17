'use client';

import { UserContext } from "@/app/UserProvider";
import { ActionIcon, Card, FileInput, Group, Table, Text, Title } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconFileTypeTxt, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";

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
  const [votingFormDetails, setVotingFormDetails] = useState<UserListDetails | null>(null);

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
        const json = await result.json();
        throw new Error(json.detail);
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

  const handleUserListDrop = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    handleUserListChange(files[0]);
  }

  const handleVotingFormChange = async (file: File | null) => {
    if (!file) {
      return;
    }
    if (!user) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/admin/voting-form`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: formData,
      });
      if (!result.ok) {
        const json = await result.json();
        throw new Error(json.detail);
      }
      // loadUserListDetails();
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
      <Title order={2}>User List</Title>
      <Dropzone
        onDrop={handleUserListDrop}
        maxFiles={1}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
          <IconFileTypeTxt size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag user list here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
            To verify users. A list of usernames (without email domain), one per line. Obtained from the membership list
            </Text>
          </div>
        </Group>
      </Dropzone>
    </Card>
  );

  const votingFormComponent = votingFormDetails ? (
    <Card mt='md' withBorder>
      <Group justify="space-between">
        <Title order={2}>User List</Title>
        <ActionIcon variant='filled' aria-label="Delete user list" color="red" onClick={handleDeleteUserList}>
          <IconTrash />
        </ActionIcon>
      </Group>
    </Card>
  ) : (
    <Card mt='md' withBorder>
      <FileInput
        label="Voting form"
        description="Main voting form for authenticated users. Downloaded from Microsoft Forms"
        placeholder="Select file"
        accept=".xlsx"
        onChange={handleVotingFormChange}
      />
    </Card>
  );

  return (
    <>
      <Title order={1}>Upload Voting Forms and User List</Title>
      {userListComponent}
      {votingFormComponent}
    </>
  )
}
