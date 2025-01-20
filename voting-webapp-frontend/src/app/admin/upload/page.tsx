'use client';

import { UserContext } from "@/app/UserProvider";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { ActionIcon, Alert, Button, Card, Checkbox, Drawer, Group, InputBase, Pill, Table, Text, Title, Tooltip } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertTriangle, IconFileSpreadsheet, IconFileTypeTxt, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
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
    name: string;
    index: number;
  }

  interface Columns {
    default: ColumnNameIndex[];
    ranking: ColumnNameIndex[];
    choice_single_answer: ColumnNameIndex[];
  }

  interface VotingFormDetails {
    filename: string;
    columns: Columns;
    num_responses: number;
    file_sha256: string;
    uploaded_at: string;
    uploaded_by: string;
  }

  const columnsTypeKeyNames = [
    { 'key': 'ranking', 'name': 'Ranking Columns' },
    { 'key': 'default', 'name': 'Non-voting Columns' },
    { 'key': 'choice_single_answer', 'name': 'Choice (Single Answer) Columns' },
  ]
  const msFormsColumns = ['ID', 'Start time', 'Completion time', 'Email', 'Name']; // 'Last modified time' is also a default MS Forms column, but does not always exist

  const [user] = useContext(UserContext);
  const [userListDetails, setUserListDetails] = useState<UserListDetails | null>(null);
  const [votingFormDetails, setVotingFormDetails] = useState<VotingFormDetails | null>(null);
  const [columns, setColumns] = useState<Columns>({ 'default': [], 'ranking': [], 'choice_single_answer': [] });
  const [drawerOpened, drawerOpenClose] = useDisclosure(false);
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

  const handleCalculateResults = async (values: { checkUserList: boolean; }) => {
    if (!votingFormDetails) {
      return;
    }
    if (!user) {
      return;
    }
    const userListHash = userListDetails?.file_sha256;
    const votingFormHash = votingFormDetails.file_sha256;
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/admin/calculate-results`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_list_hash: userListHash,
          voting_form_hash: votingFormHash,
          check_user_list: values.checkUserList,
          columns: columns,
        }),
      });
      if (!result.ok) {
        const json = await result.json();
        throw new Error(json.detail);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        throw e;
      }
    }
  }

  const resetColumns = () => {
    const columnsCopy: Columns = { 'default': [], 'ranking': [], 'choice_single_answer': [] };
    if (votingFormDetails) {
      columnsTypeKeyNames.forEach((columnsTypeKeyName) => {
        columnsCopy[columnsTypeKeyName.key as keyof typeof columnsCopy] = [...votingFormDetails.columns[columnsTypeKeyName.key as keyof typeof columns]];
      });
    }
    setColumns(columnsCopy);
  };

  useEffect(() => {
    loadUserListDetails();
    loadVotingFormDetails();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculateResultsForm.setFieldValue('checkUserList', !!userListDetails);
  }, [userListDetails]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    resetColumns();
  }, [votingFormDetails]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {!msFormsColumns.every((msFormsColumn) => votingFormDetails.columns.default.map((column) => column.name).includes(msFormsColumn)) &&
        <Alert variant="light" color="yellow" title="Missing default column" icon={<IconAlertTriangle />} mt='xs'>
          Not all expected default columns (&quot;ID&quot;, &quot;Start time&quot;, &quot;Completion time&quot;, &quot;Email&quot;, &quot;Name&quot;, &quot;Last modified time&quot;) exist, and it is likely this file is not valid export from Microsoft Forms
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

  const calculateResultsFormComponent = (
    <>
      <form onSubmit={calculateResultsForm.onSubmit((values) => handleCalculateResults(values))}>
        <Tooltip
          label="User list not provided"
          events={{ hover: !userListDetails, focus: false, touch: !userListDetails }}
        >
          <Checkbox
            label='Check against user list'
            key={calculateResultsForm.key('checkUserList')}
            disabled={!userListDetails}
            {...calculateResultsForm.getInputProps('checkUserList', { type: 'checkbox' })}
          />
        </Tooltip>
        {votingFormDetails && (
          <>
            <Text mt='md'>
              The App has guessed the type of columns, if anything needs to be adjusted, drag the columns names to the correct box
            </Text>
            <Text size='sm' c='dimmed' mt='xs'>
              There is currently a UI bug makes it hard to rearrange the order of columns within the each box if the the column names showing in multiple rows in the box. You can still move the columns into a different box as needed. However, you can use a keyboard to move columns around smoothly. use (Tab-)Shift key to navigate columns, space bar to lift and place a column, arrow keys to move a column
            </Text>
            <Alert variant="light" color="yellow" title="Please make sure the column type is correct" icon={<IconAlertTriangle />}>
              Incorrect column type can break the app, prevent the app from calculating the results, or lead to unexpected results, and interpretation to the result may not make sense
            </Alert>
            <DragDropContext
              onDragEnd={({ destination, source }) => {
                if (!destination) {
                  return;
                }
                if (destination.droppableId == source.droppableId && destination.index == source.index) {
                  return;
                }
                const start = columns[source.droppableId as keyof typeof columns];
                const finish = columns[destination.droppableId as keyof typeof columns];
                const moved = start.splice(source.index, 1)[0]; // remove the element
                finish.splice(destination.index, 0, moved); // (remove 0 elements at the destination index, and) insert the removed element at new index
                const newColumns = { ...columns };
                setColumns(newColumns);
              }}
            >
              {columnsTypeKeyNames.map((columnsTypeKeyName) => (
                <div key={columnsTypeKeyName.key}>
                  <Title order={2}>{columnsTypeKeyName.name}</Title>
                  <InputBase component='div' multiline>
                    <Droppable direction='horizontal' droppableId={columnsTypeKeyName.key}>
                      {(provided) => (
                        <Pill.Group
                          mih='30'
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {columns[columnsTypeKeyName.key as keyof typeof columns].map((column, i) => (
                            <Draggable key={column.index} index={i} draggableId={column.index.toString()}>
                              {(provided) => (
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
                </div>
              ))}
            </DragDropContext>
            <div className="mt-3">
              <Button color="red" onClick={resetColumns}>Reset Column Types</Button>
            </div>
          </>
        )}
        <Group justify='center' mt='md'>
          <Tooltip
            label="Voting response not provided"
            events={{ hover: !votingFormDetails, focus: false, touch: !votingFormDetails }}
          >
            <Button type='submit' disabled={!votingFormDetails}>Calculate Results</Button>
          </Tooltip>
        </Group>
      </form>
    </>
  )

  return (
    <>
      <Title order={1}>Upload voting response and user list</Title>
      {userListComponent}
      {votingFormComponent}
      <Drawer size='80%' opened={drawerOpened} onClose={drawerOpenClose.close} title="Calculate Results">
        {calculateResultsFormComponent}
      </Drawer>
      <Group mt='md' justify='center'>
        <Tooltip
          label="Voting response not provided"
          events={{ hover: !votingFormDetails, focus: false, touch: !votingFormDetails }}
        >
          <Button onClick={drawerOpenClose.open} disabled={!votingFormDetails}>
            Calculate Results
          </Button>
        </Tooltip>
      </Group>
    </>
  )
}
