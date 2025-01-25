from dataclasses import dataclass
from openpyxl.worksheet.worksheet import Worksheet

@dataclass
class Ballot:
    ranking: list[str]

def calculate_ranking_results(ws: Worksheet, col_i: int):
    pass