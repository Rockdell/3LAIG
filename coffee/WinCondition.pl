:- use_module(library(lists)).
:- use_module(library(between)).

% game_over(+Board, +CurrMove, +Player, ?Consecutive).
% Checks if the game is over.

game_over(Board, CurrMove, Player, Consecutive) :-
    (number(Consecutive) ; currentConsecutive(Consecutive)),
    (opponent_has_zero_moves(Board, CurrMove)
    ;
    in_a_row(Player, Board, Consecutive)
    ;
    in_a_col(Player, Board, Consecutive)
    ;
    in_a_diagonal(Player, Board, Consecutive)).

% opponent_has_zero_moves(+Board, +CurrMove)
% Checks if the opponent has any moves to make. If not, the current player wins.

opponent_has_zero_moves(Board, CurrMove) :-
    valid_moves(Board, CurrMove, ListOfMoves), !, length(ListOfMoves, 0).

% in_a_col(+Player, +Board, +Consecutive)
% Checks if there are any consecutive pieces in a column.

in_a_col(Player, Board, Consecutive) :-
    transpose(Board, NewBoard),
    in_a_row(Player, NewBoard, Consecutive).

% in_a_row(+Player, +Board, +Consecutive)
% Checks if there are any consecutive pieces in a row.

in_a_row(Player, [Row|Rest], Consecutive) :-
    check_single_row(Player, Row, Consecutive, 0);
    in_a_row(Player, Rest, Consecutive).

% in_a_diagonal(+Player, +Board, +Consecutive)
% Checks if there are any consecutive pieces in any diagonal.

in_a_diagonal(Player, Matrix, Consecutive) :-
    length(Matrix, L),
    (diagonals(Player, Matrix, L, 0, Consecutive)
    ;
    transpose(Matrix, M2), diagonals(Player, M2, L, 1, Consecutive)
    ;
    reverse(Matrix, M3), diagonals(Player, M3, L, 0, Consecutive)
    ;
    reverse(Matrix, M3), transpose(M3, M4), !, diagonals(Player, M4, L, 1, Consecutive)).

% diagonals(+Player, +Matrix, +Length, +Count, +Consecutive)
% Calculates the down diagonals on the lower left part of the matrix.

diagonals(Player, Matrix, L, Count, Consecutive) :-

    % To not over calculate diagonals with less pieces than the number of consecutives pieces needed to win
    !, Consecutive < L - (Count - 1), 
    (findall(Row, (between(Count,L,RowIndex), nth0(RowIndex, Matrix, Row)), Rows),
    length(Rows, MaxCol),
    findall(B2, (between(0,MaxCol,ColIndex), nth0(ColIndex, Rows, Row), nth0(ColIndex, Row, B2)), DiagTmp),
    check_single_row(Player, DiagTmp, Consecutive, 0)
    ;
    Count2 is Count + 1, diagonals(Player, Matrix, L, Count2, Consecutive)).

% check_single_row(+Player, +Board, +Consecutives, +Count)
% Determines it there are sufficient consecutives pieces

check_single_row(_, _, Win, Win).

check_single_row(P, [bpiece(Color,_)|RT], Cons, Count) :-
    is_equal_color(Color, P, Count, Count2),
    length(RT,Remaining), Count2 + Remaining >= Cons,
    check_single_row(P, RT, Cons, Count2).

% is_equal_color(+Color, +Player, +Count, -Res)
% Check if color is the same.

is_equal_color(Color, P, Count, Res) :-
    Color == P, !, Res is Count + 1.

is_equal_color(_,_,_,Res) :-
    Res = 0.