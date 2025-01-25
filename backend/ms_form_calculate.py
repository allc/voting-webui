from collections import Counter
import random
import networkx as nx
from pydantic import BaseModel

class Ballot(BaseModel):
    ranking: list[str]

class Pair(BaseModel):
    winner: str
    winner_votes: int
    non_winner: str
    non_winner_votes: int


def get_pairs(ballots: list[Ballot]) -> tuple[list[Pair], list[str], list[str]]:
    '''
    Get the pairs of candidates and their votes.
    '''
    warnings = []
    errors = []

    candidates = set(ballots[0].ranking)
    assert all(set(ballot.ranking) == candidates for ballot in ballots), 'Not all ballots have the same candidates set'

    table = Counter()
    for ballot in ballots:
        for i, ballot_winner in enumerate(ballot.ranking):
            for ballot_non_winner in ballot.ranking[i+1:]:
                table[(ballot_winner, ballot_non_winner)] += 1
    pairs = []
    candidates = list(candidates)
    for i, candidate1 in enumerate(candidates):
        for candidate2 in candidates[i+1:]:
            if table[(candidate1, candidate2)] > table[(candidate2, candidate1)]:
                pairs.append(Pair(winner=candidate1, winner_votes=table[(candidate1, candidate2)], non_winner=candidate2, non_winner_votes=table[(candidate2, candidate1)]))
            elif table[(candidate1, candidate2)] < table[(candidate2, candidate1)]:
                pairs.append(Pair(winner=candidate2, winner_votes=table[(candidate2, candidate1)], non_winner=candidate1, non_winner_votes=table[(candidate1, candidate2)]))
            else:
                pairs.append(Pair(winner=candidate1, winner_votes=table[(candidate1, candidate2)], non_winner=candidate2, non_winner_votes=table[(candidate2, candidate1)]))
                warnings.append(f'Tie between {candidate1} and {candidate2} (does not necessarily affect the result, manual check recommanded)')
    return pairs, warnings, errors

def sort_pairs(pairs: list[Pair], ballots: list[Ballot]) -> tuple[list[Pair], list[str], list[str]]:
    '''
    ballots: list[Ballot] for tie-breaking

    Sort the pairs by the margin of victory.
    '''
    warnings = []
    errors = []

    candidates = set(ballots[0].ranking)
    assert all(set(ballot.ranking) == candidates for ballot in ballots), 'Ballots do not have the same set of candidates'
    candidates_from_pairs = set(pair.winner for pair in pairs) | set(pair.non_winner for pair in pairs)
    assert candidates == candidates_from_pairs, 'Pairs do not have the same set of candidates as the ballots'

    pairs = sorted(pairs, key=lambda pair: pair.winner_votes - pair.non_winner_votes, reverse=True)

    # tie-breaking
    # group pairs with the same margin of victory
    margin_tie = False
    pairs_group = [[pairs[0]]]
    for pair in pairs[1:]:
        if pair.winner_votes - pair.non_winner_votes == pairs_group[-1][0].winner_votes - pairs_group[-1][0].non_winner_votes:
            pairs_group[-1].append(pair)
            margin_tie = True
        else:
            pairs_group.append([pair])
    if margin_tie:
        warnings.append('Tie in margin of victory (does not necessarily affect the result, manual check the pairs order recommanded)')
    # tie-breaking within each group
    # add pairs whose non-winner exists in previous pairs' non-winner first
    # tie-breaking using a random ballot adding the pair with the non-winner ranked lower
    # if the non-winners are the same in the pairs, sort by the winner ranked higher
    pairs = []
    non_winners = set()
    for group in pairs_group:
        while group:
            group1 = [pair for pair in group if pair.non_winner in non_winners] # non-winners in previous pairs' non-winner
            if len(group1) > 0:
                ballot = random.choice(ballots)
                pair = max(group1, key=lambda pair: (ballot.ranking.index(pair.non_winner), -ballot.ranking.index(pair.winner)))
                group1.remove(pair)
            else:
                ballot = random.choice(ballots)
                pair = max(group, key=lambda pair: (ballot.ranking.index(pair.non_winner), -ballot.ranking.index(pair.winner)))
            pairs.append(pair)
            group.remove(pair)
            non_winners.add(pair.non_winner)
    return pairs, warnings, errors

def build_lock_graph(pairs: list[Pair]) -> nx.DiGraph:
    '''
    Build the lock graph.
    '''
    G = nx.DiGraph()
    for pair in pairs:
        if pair.winner in G and pair.non_winner_votes in nx.ancestors(G, pair.winner):
            continue
        G.add_edge(pair.winner, pair.non_winner)
    return G

def get_winners_from_graph(graph: nx.DiGraph) -> list[str]:
    '''
    Get the winner from the graph.
    '''
    winner_list = [node for node, out_degree in graph.in_degree() if out_degree == 0]
    return winner_list

def calculate_ranking_result(column_responses: list[tuple[int, str | None]]):
    errors = []
    warnings = []
    num_abstain = 0
    num_invalid = 0
    num_votes = 0

    if len(column_responses) < 1:
        errors.append('No valid responses')
        return None, warnings, errors

    # remove empty response
    column_responses2 = [(row_number, value) for row_number, value in column_responses if value is not None and value.strip()]
    num_abstain += len(column_responses) - len(column_responses2)

    if len(column_responses2) < 1:
        errors.append('All abstain')
        return None, warnings, errors

    # remove non-ranking response
    column_responses_ = []
    for row_number, value in column_responses2:
        if value[-1] != ';':
            warnings.append(f'Row {row_number} does not appear to be a ranking response. Invalid and ignored')
            num_invalid += 1
        else:
            column_responses_.append((row_number, value))
    column_responses2 = column_responses_

    if len(column_responses2) < 1:
        errors.append('No valid non empty response')
        return None, warnings, errors

    # get candidate set
    candidate_sets = Counter()
    for row_number, value in column_responses2:
        candidates = value[:-1].split(';')
        candidates.sort()
        candidates = tuple(candidates)
        candidate_sets[candidates] += 1
    most_common_candidate_set = candidate_sets.most_common(1)[0][0]
    if len(most_common_candidate_set) < 2:
        errors.append(f'No valid non-empty response has more than 1 candidates')
        return None, warnings, errors

    # remove responses with candidates set different from the most common candidate set
    column_responses_ = []
    for row_number, value in column_responses2:
        candidates = value[:-1].split(';')
        candidates.sort()
        candidates = tuple(candidates)
        if candidates == most_common_candidate_set:
            column_responses_.append((row_number, value))
        else:
            warnings.append(f'Row {row_number} has a candidate sets differs from the most common candidate set. Invalid and ignored')
            num_invalid += 1
    column_responses2 = column_responses_

    if len(column_responses2) < 1: # not necessary as guaranteed will have at least one element, but I still keep it here
        errors.append('No valid non empty response')
        return None, warnings, errors
    
    num_votes = len(column_responses2)
    
    ballots = []
    for row_number, value in column_responses2:
        ballots.append(Ballot(ranking=value[:-1].split(';')))

    try:
        pairs, warnings_, errors_ = get_pairs(ballots)
    except AssertionError as e:
        errors.append(str(e))
        return None, warnings, errors
    warnings += warnings_
    errors += errors_

    try:
        pairs, warnings_, errors_ = sort_pairs(pairs, ballots)
    except AssertionError as e:
        errors.append(str(e))
        return None, warnings, errors
    warnings += warnings_
    errors += errors_

    lock_graph = build_lock_graph(pairs)
    winners = get_winners_from_graph(lock_graph)
    if len(winners) != 1:
        warnings.append('No unique winner')

    return (winners, pairs, lock_graph, num_votes, num_abstain, num_invalid), warnings, errors
