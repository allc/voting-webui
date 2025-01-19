'use client';

import { UserContext } from "@/app/UserProvider";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Accordion, ActionIcon, Alert, Badge, Button, Card, Checkbox, Drawer, FileInput, Group, InputBase, Modal, Pill, Spoiler, Table, Text, Title, Tooltip } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useDisclosure, useListState } from "@mantine/hooks";
import { IconAlertTriangle, IconFileSpreadsheet, IconFileTypeTxt, IconFileTypeXls, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";

export default function AdminUpload() {
  interface UserListDetails {
    filename: string;
    num_users: number;
    file_sha256: string;
    uploaded_at: string;
    uploaded_by: string;
  }

  interface ColumnNameIndex {
    name: string,
    index: number,
  }

  interface VotingFormDetails {
    filename: string;
    columns: {
      'default': ColumnNameIndex[],
      'custom': ColumnNameIndex[],
    },
    num_responses: number;
    file_sha256: string;
    uploaded_at: string;
    uploaded_by: string;
  }

  const [user] = useContext(UserContext);
  const [userListDetails, setUserListDetails] = useState<UserListDetails | null>(null);
  const [votingFormDetails, setVotingFormDetails] = useState<VotingFormDetails | null>(null);
  const [customColumns, customColumnsHandlers] = useListState<ColumnNameIndex>([]);
  const calculateResultsForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      'checkUserList': !!userListDetails,
    }
  })


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

  const handleUserListUpload = async (file: File | null) => {
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
    handleUserListUpload(files[0]);
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

  const ms_forms_columns = ['ID', 'Start time', 'Completion time', 'Email', 'Name']; // 'Last modified time' is also a default MS Forms column, but does not always exist

  const loadVotingFormDetails = async () => {
    if (!user) {
      return;
    }
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/admin/voting-form`, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
      },
    });
    if (!result.ok) {
      return;
    }
    const data = await result.json();
    setVotingFormDetails(data);
  }

  const handleVotingFormUpload = async (file: File | null) => {
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
      loadVotingFormDetails();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  }

  const handleVotingFormDrop = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    handleVotingFormUpload(files[0]);
  }

  const handleDeleteVotingForm = async () => {
    const confirm = window.confirm('Are you sure you want to delete the voting response?');
    if (!confirm) {
      return;
    }
    if (!user) {
      return;
    }
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/admin/voting-form`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
      });
      if (!result.ok) {
        throw new Error('Failed to delete voting response');
      }
      setVotingFormDetails(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  }

  const handleCalculateResults = () => {
    console.log(votingFormDetails?.columns);
    console.log(customColumns);
  }

  useEffect(() => {
    loadUserListDetails();
    loadVotingFormDetails();
  }, [user]);

  useEffect(() => {
    calculateResultsForm.setFieldValue('checkUserList', !!userListDetails);
  }, [userListDetails]);

  useEffect(() => {
    customColumnsHandlers.setState(votingFormDetails?.columns.custom || []);
  }, [votingFormDetails]);

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
        mt='md'
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
        <Title order={2}>Voting Response</Title>
        <ActionIcon variant='filled' aria-label="Delete user list" color="red" onClick={handleDeleteVotingForm}>
          <IconTrash />
        </ActionIcon>
      </Group>
      {!votingFormDetails.columns.default.map((column) => column.name).includes('Email') &&
        <Alert variant="light" color="red" title="No Email column" icon={<IconAlertTriangle />}>
          Email column does not exist, it will not be able to validate against user list, and it is likely this file is not valid export from Microsoft Forms
        </Alert>
      }
      {!ms_forms_columns.every((ms_forms_column) => votingFormDetails.columns.default.map((column) => column.name).includes(ms_forms_column)) &&
        <Alert variant="light" color="yellow" title="Missing default column" icon={<IconAlertTriangle />} mt='xs'>
          Not all expected default columns ("ID", "Start time", "Completion time", "Email", "Name", "Last modified time") exist, and it is likely this file is not valid export from Microsoft Forms
        </Alert>
      }
      <Table variant="vertical">
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Filename</Table.Td>
            <Table.Td>{votingFormDetails.filename}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>SHA256</Table.Td>
            <Table.Td>{votingFormDetails.file_sha256}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Number of responses</Table.Td>
            <Table.Td>{votingFormDetails.num_responses}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Uploaded at</Table.Td>
            <Table.Td>{votingFormDetails.uploaded_at}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Uploaded by</Table.Td>
            <Table.Td>{votingFormDetails.uploaded_by}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Card>
  ) : (
    <Card mt='md' withBorder>
      <Title order={2}>Voting response</Title>
      <Dropzone
        mt='md'
        onDrop={handleVotingFormDrop}
        maxFiles={1}
        accept={[MIME_TYPES.xlsx]}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFileSpreadsheet size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag voting response file here or click to select files
            </Text>
            <Dropzone.Reject>
              <Text size="xl" inline mt={7}>
                Must be .xlsx file
              </Text>
            </Dropzone.Reject>
            <Text size="sm" c="dimmed" inline mt={7}>
              Voting response file for authenticated users. Downloaded from Microsoft Forms. Must be in .xlsx format
            </Text>
          </div>
        </Group>
      </Dropzone>
    </Card>
  );

  return (
    <>
      <Title order={1}>Upload voting response and user list</Title>
      {userListComponent}
      {votingFormComponent}
      <Card mt='md' withBorder>
        <Title order={2}>Calculate Results</Title>
        <Text size='sm' c='dimmed'>
          Reloading the page will reset this form
        </Text>
        <form onSubmit={calculateResultsForm.onSubmit(() => handleCalculateResults())}>
          <Tooltip
            label="User list not provided"
            events={{ hover: !userListDetails, focus: false, touch: !userListDetails }}
          >
            <Checkbox
              label='Check against user list'
              key={calculateResultsForm.key('checkUserList')}
              disabled={!userListDetails}
              mt='md'
              {...calculateResultsForm.getInputProps('checkUserList', { type: 'checkbox' })}
            />
          </Tooltip>
          {votingFormDetails && (
            <>
              <Text mt='md'>
                The App has guessed the type of columns, if anything needs to be adjusted, drag the columns names to the correct box
              </Text>
              <Text size='sm' c='dimmed' mt='xs'>
                There is currently a UI bug makes it hard to rearrange the order of columns within the each box if the the column names showing in multiple rows in the box. You can still move the columns into a different box as needed
              </Text>
              <DragDropContext
                onDragEnd={({ destination, source }) =>
                  customColumnsHandlers.reorder({ from: source.index, to: destination?.index || 0 })
                }
              >
                <Title order={2}>Custom Columns</Title>
                <InputBase component='div' multiline>
                  <Droppable direction='horizontal' droppableId="columns">
                    {(provided) => (
                      <Pill.Group {...provided.droppableProps} ref={provided.innerRef}>
                        {customColumns.map((column, i) => (
                          <Draggable key={column.index} index={i} draggableId={column.index.toString()}>
                            {(provided, snapshot) => (
                              <Pill
                                key={column.index}
                                size="lg"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                              >
                                {column.name}
                              </Pill>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Pill.Group>)}
                  </Droppable>

                </InputBase>
                <Title order={2} mt='md'>Non-voting Columns</Title>
                <InputBase component='div' multiline>
                  <Pill.Group>
                    {votingFormDetails.columns.default.map((column) => (
                      <Pill key={column.index} size="lg">{column.name}</Pill>
                    ))}
                  </Pill.Group>
                </InputBase>
              </DragDropContext>
            </>
          )}
          <Tooltip
            label="Voting response not provided"
            events={{ hover: !votingFormDetails, focus: false, touch: !votingFormDetails }}
          >
            <Button type='submit' mt='md' disabled={!votingFormDetails}>Calculate Results</Button>
          </Tooltip>
        </form>
      </Card>
    </>
  )
}
