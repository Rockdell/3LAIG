:- use_module(library(lists)).

% Board piece.
bpiece/2.

% Player move.
pmove/3.

% empty_piece(-X)
% Returns an empty piece.

empty_piece(X) :-
    X = bpiece('-', ' ').

% create_board(-B)
% Creates a new empty board.

create_board(B) :-
    currentBoardLength(BL),
    length(B, BL),
    maplist(new_board_col(BL), B).

% new_board_col(+Length, -Col)
% Creates a new empty column.

new_board_col(Length, Col) :-
    length(Col, Length),
    maplist(empty_piece, Col).

% move(+Board, +Player, +Move, -NewBoard)
% Makes a move on the board.

move(Board, Player, Move, NewBoard) :-
    change_element(Board, Player, Move, NewBoard).

% validate_move(+Board, +LastMove, +NextMove)
% Validates a move.

validate_move(Board, LastMove, NextMove) :-
    validate_position(Board, LastMove, NextMove), !, validate_direction(Board, NextMove).

% validate_position(+Board, +LastMove, +Move)
% Validates the position of the piece given by the move.

validate_position(Board, LastMove, pmove(NextX, NextY, _)) :-
    check_line(Board, LastMove, Available), !, member([NextX, NextY], Available).

% validate_direction(+Board, +NextMove)
% Validates the direction of move.

validate_direction(Board, NextMove) :-
    check_line(Board, NextMove, Available), !, length(Available, L), L > 0.

% change_element(+Board, +Player, +Move, -NewBoard)
% Changes an element in the board.

change_element([[_|RowT]|BT], Player, pmove(0, 0, D), [[bpiece(Player, D)|RowT]|BT]).

change_element([[RowH|RowT]|BT], Player, pmove(X, 0, D), [[RowH|T]|RT]) :-
    X > 0,
    X1 is X - 1, change_element([RowT|BT], Player, pmove(X1, 0 , D), [T|RT]).

change_element([BH|BT], Player, pmove(X, Y, D), [BH|RT]) :-
    Y > 0,
    Y1 is Y - 1, change_element(BT, Player, pmove(X, Y1, D), RT).

% is_position_free(+Board, +Col, +Row)
% Checks if position is free.

is_position_free(Board, Col, Row) :-
    nth0(Row, Board, SubBoard),
    nth0(Col, SubBoard, bpiece(Player, _)), !, Player == '-'.

% check_line(+Board, ?Move, -Res)
% Returns list of available positions in the direction given by the move.

check_line(Board, pmove(X, Y, D), Res) :-
    D == '-', !,
    eval_hor(Board, 0, Y, [], Res1), 
    delete(Res1, [X, Y], Res)
    ;
    D == '|', !,
    eval_ver(Board, X, 0, [], Res1), 
    delete(Res1, [X, Y], Res)
    ;
    D == '/', !,
    Y1 is Y - 1, X1 is X + 1, eval_diag_up_top(Board, X1, Y1, [], Res1),
    Y2 is Y + 1, X2 is X - 1, eval_diag_up_bot(Board, X2, Y2, [], Res2),
    append(Res1, Res2, Res)
    ;
    D == '\\', !,
    X1 is X - 1, Y1 is Y - 1, eval_diag_down_top(Board, X1, Y1, [], Res1),
    X2 is X + 1, Y2 is Y + 1, eval_diag_down_bot(Board, X2, Y2, [], Res2),
    append(Res1, Res2, Res)
    ;
    eval_board(Board, 0, [], Res).

% eval_board(+Board, +Y, List, -Res)
% Evaluates board and returns list of available positions.

eval_board(Board, L, List, List) :- length(Board, L).

eval_board(Board, Y, List, Res) :-
    eval_hor(Board, 0, Y, [], Hor), append(List, Hor, List1),
    Y1 is Y + 1, eval_board(Board, Y1, List1, Res).

% eval_hor(+Board, +X, +Y, List, -Res)
% Evaluates horizontal line and returns list of available positions.

eval_hor(Board, L, _, List, List) :- length(Board, L).

eval_hor(Board, X, Y, List, Res) :-
    is_position_free(Board, X, Y), append(List, [[X, Y]], List1), 
    X1 is X + 1, eval_hor(Board, X1, Y, List1, Res)
    ;
    X1 is X + 1, eval_hor(Board, X1, Y, List, Res).

% eval_ver(+Board, +X, +Y, List, -Res)
% Evaluates vertical line and returns list of available positions.

eval_ver(Board, _, L, List, List) :- length(Board, L).

eval_ver(Board, X, Y, List, Res) :-
    is_position_free(Board, X, Y), append(List, [[X, Y]], List1), 
    Y1 is Y + 1, eval_ver(Board, X, Y1, List1, Res)
    ;
    Y1 is Y + 1, eval_ver(Board, X, Y1, List, Res).

% eval_diag_up_top(+Board, +X, +Y, List, -Res)
% Evaluates top part of positive diagonal line and returns list of available positions.

eval_diag_up_top(Board, L, _, List, List) :- length(Board, L).
eval_diag_up_top(_, _, -1, List, List).

eval_diag_up_top(Board, X, Y, List, Res) :-
    is_position_free(Board, X, Y), append(List, [[X, Y]], List1),
    X1 is X + 1, Y1 is Y - 1, eval_diag_up_top(Board, X1, Y1, List1, Res)
    ;
    X1 is X + 1, Y1 is Y - 1, eval_diag_up_top(Board, X1, Y1, List, Res).

% eval_diag_up_bot(+Board, +X, +Y, List, -Res)
% Evaluates bottom part of positive diagonal line and returns list of available positions.

eval_diag_up_bot(_, -1, _, List, List).
eval_diag_up_bot(Board, _, L, List, List) :- length(Board, L).

eval_diag_up_bot(Board, X, Y, List, Res) :-

    is_position_free(Board, X, Y), append(List, [[X, Y]], List1),
    X1 is X - 1, Y1 is Y + 1, eval_diag_up_bot(Board, X1, Y1, List1, Res)
    ;
    X1 is X - 1, Y1 is Y + 1, eval_diag_up_bot(Board, X1, Y1, List, Res).

% eval_diag_down_top(+Board, +X, +Y, List, -Res)
% Evaluates top part of negative diagonal and returns list of available positions.

eval_diag_down_top(_, -1, _, List, List).
eval_diag_down_top(_, _, -1, List, List).

eval_diag_down_top(Board, X, Y, List, Res) :-
    is_position_free(Board, X, Y), append(List, [[X, Y]], List1),
    X1 is X - 1, Y1 is Y - 1, eval_diag_down_top(Board, X1, Y1, List1, Res)
    ;
    X1 is X - 1, Y1 is Y - 1, eval_diag_down_top(Board, X1, Y1, List, Res).

% eval_diag_down_bot(+Board, +X, +Y, List, -Res)
% Evaluates bottom part of negative diagonal and returns list of available positions.

eval_diag_down_bot(Board, L, _, List, List) :- length(Board, L).
eval_diag_down_bot(Board, _, L, List, List) :- length(Board, L).

eval_diag_down_bot(Board, X, Y, List, Res) :-
    is_position_free(Board, X, Y), append(List, [[X, Y]], List1),
    X1 is X + 1, Y1 is Y + 1, eval_diag_down_bot(Board, X1, Y1, List1, Res)
    ;
    X1 is X + 1, Y1 is Y + 1, eval_diag_down_bot(Board, X1, Y1, List, Res).