'use client';

import { Alert, Anchor, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function SetupInstructions() {
  return (
    <>
      <Title order={1}>Setup Instructions</Title>
      <Alert variant="light" color="yellow" title="Please avoid modifying the voting form after it being shared" icon={<IconAlertTriangle />} mt='md'>
        Please ensure form setup correctly before sharing. Inconsistent response data may break the app and lead to unexpected results. Users might already have the old form loaded, and they may still be able to submit the data for before the changes to the updated form
      </Alert>
      <Alert variant="light" color="yellow" title="Do NOT use semicolon &quot;;&quot; in ranking candidate names" icon={<IconAlertTriangle />} mt='md'>
        Using semicolon in candidate names will break the app and lead to unexpected results. If all non-empty responses to a question ends with a semicolon, it may be guessed as a ranking question
      </Alert>
      <div>
        <Anchor href='https://docs.google.com/document/d/1kigaB21ccfpu9L-0dmraBEwQgRBVMbvdGfhnug17d_M/edit?usp=sharing' target='_blank'>Read instructions</Anchor>
      </div>
      <div>
        <Anchor href='https://github.com/allc/voting-webui' target='_blank'>View source code</Anchor>
      </div>
    </>
  )
}
