interface VotingResultsVotingFormDetails {
  filename: string;
  file_sha256: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface VotingResultsUserListDetails {
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

interface ChoiceColumnResult {
  column_name: string;
  num_votes: number;
  num_abstain: number;
  counts: { choice: string, count: number }[];
}

export interface VotingResults {
  num_responses: number;
  num_valid_responses: number;
  voting_form: VotingResultsVotingFormDetails;
  user_list: VotingResultsUserListDetails | null;
  rank_column_results: RankColumnResult[];
  choice_column_results: ChoiceColumnResult[];
  warnings: string[];
  calculated_at: string;
  requested_by: string;
}
