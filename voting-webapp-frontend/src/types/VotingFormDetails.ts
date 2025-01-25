interface ColumnNameIndex {
  name: string;
  index: number;
}

export interface Columns {
  default: ColumnNameIndex[];
  ranking: ColumnNameIndex[];
  choice_single_answer: ColumnNameIndex[];
}

export interface VotingFormDetails {
  filename: string;
  columns: Columns;
  num_responses: number;
  file_sha256: string;
  uploaded_at: string;
  uploaded_by: string;
}
