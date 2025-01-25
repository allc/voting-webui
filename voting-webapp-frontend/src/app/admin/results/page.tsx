'use client';

import { UserContext } from "@/app/UserProvider";
import { Accordion, Anchor, Button, Card, Group, Image, Table, Text, Title } from "@mantine/core";
import { useContext, useEffect, useState } from "react";

export default function Results() {
  interface VotingFormDetails {
    filename: string;
    file_sha256: string;
    uploaded_at: string;
    uploaded_by: string;
  }

  interface UserListDetails {
    filename: string;
    file_sha256: string;
    uploaded_at: string;
    uploaded_by: string;
  }

  interface Pairs {
    winner: string;
    winner_votes: number;
    non_winner: string;
    non_winner_votes: number;
  }

  interface RankColumnResult {
    column_name: string;
    winners: string[] | null;
    num_votes: number;
    num_abstain: number;
    num_invalid: number;
    pairs: Pairs[] | null;
    graph_url: string | null;
    warnings: string[];
    errors: string[];
  }

  interface VotingResults {
    num_responses: number;
    num_valid_responses: number;
    voting_form: VotingFormDetails;
    user_list: UserListDetails | null;
    rank_column_results: RankColumnResult[];
    warnings: string[];
  }

  const [user] = useContext(UserContext);
  const [votingResults, setvotingResults] = useState<VotingResults | null>(null);
  const [showResults, setShowResults] = useState<string[]>([]);

  const loadResults = async () => {
    if (!user) {
      return;
    }
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/api/admin/results`, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
      },
    });
    if (!result.ok) {
      return;
    }
    const data = await result.json();
    setvotingResults(data);
    console.log(data);
  }

  const showAll = () => {
    if (!votingResults) {
      return;
    }
    const columnNames = votingResults.rank_column_results.map((rankColumnResult) => rankColumnResult.column_name);
    setShowResults(columnNames);
  }

  useEffect(() => {
    loadResults();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const overview = votingResults ? (
    <>
      <Card withBorder mt='md'>
        <Table variant="vertical">
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Number of responses</Table.Td>
              <Table.Td>{votingResults.num_responses}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Number of responses from valid user</Table.Td>
              <Table.Td>{votingResults.num_valid_responses}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Number of responses from invalid user</Table.Td>
              <Table.Td className={votingResults.num_responses - votingResults.num_valid_responses !== 0 ? 'text-red-500 font-bold' : ''}>{votingResults.num_responses - votingResults.num_valid_responses}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
      <Card withBorder mt='md'>
        <Table variant="vertical">
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Voting response</Table.Td>
              <Table.Td>{votingResults.voting_form.filename}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Voting response SHA256</Table.Td>
              <Table.Td>{votingResults.voting_form.file_sha256}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Voting response uploaded at</Table.Td>
              <Table.Td>{votingResults.voting_form.uploaded_at}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Voting response uploaded by</Table.Td>
              <Table.Td>{votingResults.voting_form.uploaded_by}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
      <Card withBorder mt='md'>
        {votingResults.user_list ? (
          <Table variant="vertical">
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>User list</Table.Td>
                <Table.Td>{votingResults.user_list.filename}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>User list SHA256</Table.Td>
                <Table.Td>{votingResults.user_list.file_sha256}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>User list uploaded at</Table.Td>
                <Table.Td>{votingResults.user_list.uploaded_at}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>User list uploaded by</Table.Td>
                <Table.Td>{votingResults.user_list.uploaded_by}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        ) : (
          <Text c='red'>Did not check against a users list</Text>
        )}
      </Card>
    </>
  ) : null;

  const rankedColumnResults = votingResults && votingResults.rank_column_results.map((rankColumnResult) => (
    <Accordion.Item key={rankColumnResult.column_name} value={rankColumnResult.column_name}>
      <Accordion.Control icon={rankColumnResult.errors.length > 0 ? '❌' : rankColumnResult.warnings.length > 0 ? '⚠' : null}><Text fw={700}>{rankColumnResult.column_name}</Text></Accordion.Control>
      <Accordion.Panel>
        {rankColumnResult.errors.map((error, index) => (
          <Text key={index} c='red'>{error}</Text>
        ))}
        {rankColumnResult.warnings.map((warning, index) => (
          <Text key={index} c='yellow'>{warning}</Text>
        ))}
        {rankColumnResult.winners && rankColumnResult.pairs ? (
          <>
            <Text><span className='font-bold'>Winners: </span>{rankColumnResult.winners.join(', ')}</Text>
            <Text>Number of votes: {rankColumnResult.num_votes} | Number of abstain: {rankColumnResult.num_abstain} | Number of invalid: <span className={rankColumnResult.num_invalid !== 0 ? 'text-red-500 font-bold' : ''}>{rankColumnResult.num_invalid}</span></Text>
            <Card mt='md' withBorder>
              <Table variant="vertical">
                <Table.Tbody>
                  {rankColumnResult.pairs.map((pair, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{pair.winner}</Table.Td>
                      <Table.Td>{pair.winner_votes}</Table.Td>
                      <Table.Td>{pair.non_winner}</Table.Td>
                      <Table.Td>{pair.non_winner_votes}</Table.Td>
                      <Table.Td>Margin: {pair.winner_votes - pair.non_winner_votes}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
            {rankColumnResult.graph_url && (
              <Image
                src={rankColumnResult.graph_url}
                alt={`Graph for ${rankColumnResult.column_name} result`}
                fit='contain'
                mah={400}
              />
            )}
          </>) : (
          <>
            <Text c='red'>Could not calculate ranking result. Please check the column is a ranking column and responses are checked against the correct users list</Text>
          </>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  ));

  if (!votingResults) {
    return (
      <>
        <Text mt='md'>
          No results calculated yet, visit the <Anchor href="/admin/upload">upload</Anchor > page to upload voting responses and calculate results
        </Text>
      </>
    )
  }

  return (
    <>
      {overview}
      <Group justify='space-between' mt='md'>
        <Title order={1}>Results</Title>
        <Button onClick={showAll}>Show all</Button>
      </Group>
      <Accordion mt='md' variant='separated' multiple value={showResults} onChange={setShowResults}>
        {rankedColumnResults}
      </Accordion>
    </>
  )
}
