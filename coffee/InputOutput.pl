:- use_module(library(lists)).

% Accepted letters
letter('A', 0).
letter('B', 1).
letter('C', 2).
letter('D', 3).
letter('E', 4).
letter('F', 5).
letter('G', 6).
letter('a', 0).
letter('b', 1).
letter('c', 2).
letter('d', 3).
letter('e', 4).
letter('f', 5).
letter('g', 6).

% Accepted numbers
number('1', 0).
number('2', 1).
number('3', 2).
number('4', 3).
number('5', 4).
number('6', 5).
number('7', 6).

% Accepted directions
dir('-', '-').
dir('|', '|').
dir('/', '/').  
dir('\\', '\\').

% Convert char to number
char_to_number('2', 2).
char_to_number('3', 3).
char_to_number('4', 4).
char_to_number('5', 5).
char_to_number('6', 6).
char_to_number('7', 7).

% read_input(-Input)
% Reads input from user.

read_input(Input) :-
    get_char(Input), skip_line, nl.

% player_won(+Player)
% Displays winning player.

player_won(Player) :-
    translatePlayer(Player, X), nl, write(' '), write(X), write(' has Won!'), nl,
    write(' Press any key to continue...'), nl, get_char(_).

% display_game(+Board, +LastMove, +Player)
% Displays the game, possible next positions and the next player.

display_game(Board, LastMove, Player) :-
	check_line(Board, LastMove, ListOfMoves),
	add_possible_positions(Board, ListOfMoves, NewBoard),
	print_tab(NewBoard, 1),
	print_player(Player).

% print_player(+Player)
% Prints the current player.

print_player(Player) :-
	translatePlayer(Player, X), nl, write(' '), write(X), write('\'s move'), nl.

% add_possible_positions(+Board, +ListOfPositions, -NewBoard).
% Adds possible positions to board.

add_possible_positions(B, [], B).

add_possible_positions(B, [[X,Y]|T], NB) :-
	change_element(B, '.', pmove(X,Y,' '), B2),
	add_possible_positions(B2, T, NB).

% print_hor_coords(+NumberPieces)
% Prints the horizontal coordinates.

print_hor_coords(H) :-
	write('  '),
	print_hor_coords(H, 65), nl.
	
print_hor_coords(0 , _).

print_hor_coords(P, I) :-
	I >= 65, I =< 72,
	write('   '),
	put_code(I),
	write('  '),
	I2 is I + 1,
	P2 is P - 1,
	print_hor_coords(P2, I2).
		
% print_tab(+Board, +Index)
% Prints the board, its pieces (each one in a 3x3 matrix), as well as the coordinates.

print_tab([],I) :-
	currentBoardLength(Length), print_row_separators(Length),
	I2 is I - 1,
	print_hor_coords(I2).
		
print_tab([L|T],I) :-
	currentBoardLength(Length), print_row_separators(Length),
	print_line(L,I),
	I2 is I + 1,
	print_tab(T,I2).

% print_index(+Index)
% Prints the index of the current line.

print_index(I) :-
	write(I).

% print_line(+Line, +Index)
% Prints one line of the board.

print_line([]).		

print_line([C|L],I) :-
	write('  |'), print_line1([C|L]), write('\n'),
	print_index(I), write(' |'), print_line2([C|L]), write('\n'),
	write('  |'), print_line3([C|L]), write('\n').
	
% print_line1(+Piece)
% Prints the first line of a piece

print_line1([]).

print_line1([C|L]) :-
	print_cell1(C), write('|'),
	print_line1(L).
	
% print_line2(+Piece)
% Prints the second line of a piece

print_line2([]).

print_line2([C|L]) :-
	print_cell2(C), write('|'),
	print_line2(L).
	
% print_line3(+Piece)
% Prints the third line of a piece

print_line3([]).

print_line3([C|L]) :-
	print_cell3(C), write('|'),
	print_line3(L).

% print_cell1(+Cell)
% Prints the first cell of the board.

print_cell1(C) :-
	translatePiece1(C,V),
	write(V).
	
% print_cell2(+Cell)
% Prints the second cell of the board.

print_cell2(C) :-
	translatePiece2(C,V),
	write(V).

% print_cell3(+Cell)
% Prints the third cell of the board.

print_cell3(C) :-
	translatePiece3(C,V),
	write(V).

% print_row_separators(+Length)
% Prints row separators.

print_row_separators(Length) :-
	write('  -------'),
	L2 is Length - 1,
	print_row_separators2(L2), nl.

% print_row_separators2(+Length)
% Prints row separators.

print_row_separators2(0).

print_row_separators2(Length) :-
	write('------'),
	L2 is Length - 1,
	print_row_separators2(L2).

% tranlatePiece1(+Piece, -String)
% Translates the first line of a piece.

translatePiece1(bpiece(Color, Dir), Str) :-
	Color == '.', Str = '     ';
	Color == '-', Str = '     ';
	Dir == '|', Str = '  |  ';
	Dir == '/', Str = '    /';
	Dir == '-', Str = '     ';
	Dir == '\\', Str = '\\    '.

% tranlatePiece2(+Piece, -String)
% Translates the second line of a piece.

translatePiece2(bpiece(Color, Dir), Str) :-
	Color == '.', Str = '  @  ';
	Color == '-', Str = '     ';
	Color == 'b', (Dir \== '-', Str = '  B  ' ; Str = '- B -') ;
	Color == 'o', (Dir \== '-', Str = '  O  ' ; Str = '- O -') .
	
% tranlatePiece3(+Piece, -String)
% Translates the third line of a piece.

translatePiece3(bpiece(Color, Dir), Str) :-
	Color == '.', Str = '     ';
	Color == '-', Str = '     ';
	Dir == '|', Str = '  |  ' ;
	Dir == '/', Str = '/    ' ;
	Dir == '-', Str = '     ' ;
	Dir == '\\', Str = '    \\'.

% translatePlayer(?Piece, ?Player)
% Returns either the piece or the player.

translatePlayer('b', 'Brown').
translatePlayer('o', 'Orange').