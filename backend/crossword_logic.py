# backend/crossword_logic.py - FINAL VERIFIED VERSION
from typing import List, Tuple, Dict
from dataclasses import dataclass
import random
import re
import requests # Make sure this new import is included

@dataclass
class WordObject:
    word: str
    orientation: str
    start_row: int
    start_col: int
    number: int = 0

def generate_crossword(keywords: List[str]) -> Tuple[List[List[str]], List[WordObject]]:
    # This is your existing, advanced crossword generation logic.
    # It remains the same.
    size = 20
    valid_keywords = sorted(list(set(kw for kw in (keywords or []) if 3 <= len(kw) < 15)), key=len, reverse=True)
    words_to_place = valid_keywords[:30]
    
    grid = [["" for _ in range(size)] for _ in range(size)]
    placed_words = []

    def can_place(word, row, col, is_horizontal):
        if is_horizontal:
            if col < 0 or col + len(word) > size: return False
            for i in range(len(word)):
                if grid[row][col + i] not in ("", word[i]): return False
                if grid[row][col + i] == "" and ((row > 0 and grid[row - 1][col + i] != "") or (row < size - 1 and grid[row + 1][col + i] != "")): return False
            if (col > 0 and grid[row][col - 1] != "") or (col + len(word) < size and grid[row][col + len(word)] != ""): return False
        else: # Vertical
            if row < 0 or row + len(word) > size: return False
            for i in range(len(word)):
                if grid[row + i][col] not in ("", word[i]): return False
                if grid[row + i][col] == "" and ((col > 0 and grid[row + i][col - 1] != "") or (col < size - 1 and grid[row + i][col + 1] != "")): return False
            if (row > 0 and grid[row - 1][col] != "") or (row + len(word) < size and grid[row + len(word)][col] != ""): return False
        return True

    def place(word, row, col, is_horizontal):
        orientation = "across" if is_horizontal else "down"
        word_obj = WordObject(word, orientation, row, col)
        placed_words.append(word_obj)
        for i, char in enumerate(word):
            grid[row + (i if not is_horizontal else 0)][col + (i if is_horizontal else 0)] = char

    def calculate_score(word, row, col, is_horizontal):
        intersections = 0
        if is_horizontal:
            for i in range(len(word)):
                if grid[row][col + i] != "": intersections += 1
        else:
            for i in range(len(word)):
                if grid[row + i][col] != "": intersections += 1
        return intersections

    if words_to_place:
        first_word = words_to_place.pop(0)
        place(first_word, size // 2, (size - len(first_word)) // 2, True)

    for _ in range(5):
        words_to_place_copy = words_to_place[:]
        words_placed_in_pass = []
        for word in words_to_place_copy:
            if len(placed_words) >= 20: break
            best_placement, max_score = None, 0
            for p_word in placed_words:
                for i, char1 in enumerate(p_word.word):
                    for j, char2 in enumerate(word):
                        if char1 == char2:
                            if p_word.orientation == "across":
                                r, c = p_word.start_row - j, p_word.start_col + i
                                if can_place(word, r, c, False):
                                    score = calculate_score(word, r, c, False)
                                    if score >= max_score:
                                        max_score = score
                                        best_placement = (word, r, c, False)
                            else:
                                r, c = p_word.start_row + i, p_word.start_col - j
                                if can_place(word, r, c, True):
                                    score = calculate_score(word, r, c, True)
                                    if score >= max_score:
                                        max_score = score
                                        best_placement = (word, r, c, True)
            if best_placement:
                place(*best_placement)
                words_placed_in_pass.append(word)
        for word in words_placed_in_pass:
            words_to_place.remove(word)
    
    final_placed_words = placed_words[:20]
    final_placed_words.sort(key=lambda w: (w.start_row, w.start_col))
    
    numbered_cells, current_number = {}, 1
    for word_obj in final_placed_words:
        r, c = word_obj.start_row, word_obj.start_col
        is_start_of_across = word_obj.orientation == "across" and (c == 0 or grid[r][c-1] == "")
        is_start_of_down = word_obj.orientation == "down" and (r == 0 or grid[r-1][c] == "")
        if is_start_of_across or is_start_of_down:
            if (r, c) not in numbered_cells:
                numbered_cells[(r, c)] = current_number
                current_number += 1
            word_obj.number = numbered_cells.get((r, c), 0)

    return grid, [word for word in final_placed_words if word.number > 0]


# --- NEW AND IMPROVED CLUE GENERATION LOGIC ---
def generate_clues(extracted_text: str, keywords: List[str]) -> Dict[str, str]:
    clues: Dict[str, str] = {}
    
    for keyword in keywords:
        if not keyword: continue
        
        definition = ""
        try:
            # Call the free dictionary API
            response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{keyword}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                # Extract the first definition found
                definition = data[0]['meanings'][0]['definitions'][0]['definition']
        except Exception as e:
            # If API fails or word not found, use a fallback
            print(f"Could not find definition for {keyword}. Error: {e}")

        # If a definition was found, use it. Otherwise, use a simple fallback.
        if definition:
            clues[keyword] = definition
        else:
            clues[keyword] = f"A term related to {keyword.capitalize()}"
            
    return clues
