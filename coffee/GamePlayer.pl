:- use_module(library(random)).

% Player to maximize.
:- dynamic maxPlayer/1.

% Player to minimize.
:- dynamic minPlayer/1.

% valid_moves(+Board, ?LastMove, -ListOfMoves)
% Returns a list of valid moves for a given board.

valid_moves(Board, LastMove, ListOfMoves) :-
    check_line(Board, LastMove, Free),
    iterate_moves(Board, Free, ['h', 'v', 'du', 'dd'], [], ListOfMoves).

% iterate_moves(+Board, +ListOfPositions, +ListOfDirections, +List, -ListOfMoves)
% Iterates through the positions given and returns a list of moves.

iterate_moves(_, [], _, List, List).

iterate_moves(Board, [_|PT], [], List, Res) :-
    iterate_moves(Board, PT, ['h', 'v', 'du', 'dd'], List, Res).

iterate_moves(Board, [[X,Y]|PT], [DH|DT], List, Res) :-
    validate_direction(Board, pmove(X, Y, DH)),
    append(List, [pmove(X, Y, DH)], List1), iterate_moves(Board, [[X, Y]|PT], DT, List1, Res)
    ;
    iterate_moves(Board, [[X, Y]|PT], DT, List, Res).    

% value(+Board, +LastMove, +Player, -Val)
% Evaluates a board.

value(Board, LastMove, Player, Val) :-
    currentConsecutive(C), iter_value(Board, LastMove, Player, Val, C).

iter_value(Board, LastMove, Player, C, C) :- 
    game_over(Board, LastMove, Player, C).

iter_value(Board, LastMove, Player, Val, C) :-
    C1 is C - 1, iter_value(Board, LastMove, Player, Val, C1).

% minimax(+Depth, +Board, ?LastMove, +Player, -BestMove, -BestVal)
% Computes the minimax the best move for a player.

minimax(Depth, Board, LastMove, Player, BestMove, BestVal) :-

    Depth > 0,
    valid_moves(Board, LastMove, ListOfMoves),
    best_move(Depth, Board, LastMove, Player, ListOfMoves, BestMove, BestVal)
    ;    
    best_move(_, Board, LastMove, Player, [], BestMove, BestVal).

% best_move(+Depth, +Board, ?LastMove, +Player, +ListOfMoves, -BestMove, -BestVal)
% Computes the best move for the player given, according to the board given.

best_move(_, Board, LastMove, Player, [], LastMove, BestVal) :-
    move(Board, Player, LastMove, NewBoard),
    value(NewBoard, LastMove, Player, BestVal).

best_move(Depth, Board, _, Player, [Move], Move, BestVal) :-

    % Make move and minimax best move from next player
    opponent(Player, NextPlayer),
    move(Board, Player, Move, NewBoard), 
    Depth1 is Depth - 1, minimax(Depth1, NewBoard, Move, NextPlayer, _, BestVal).

best_move(Depth, Board, LastMove, Player, [Move|RestMoves], BestMove, BestVal) :-

    % Make move and minimax best move from next player
    opponent(Player, NextPlayer),
    move(Board, Player, Move, NewBoard), 
    Depth1 is Depth - 1, minimax(Depth1, NewBoard, Move, NextPlayer, _, NextBestVal),

    % Compute best move from the remaining moves
    best_move(Depth, Board, LastMove, Player, RestMoves, RestBestMove, RestBestVal),

    % Compare moves
    compare_moves(Player, Move, NextBestVal, RestBestMove, RestBestVal, BestMove, BestVal).

% compare_moves(+Player, +MoveA, +ValA, +MoveB, +ValB, -BestMove, -BestVal)
% Compares two moves and chooses the best, according to the player given.

compare_moves(Player, MoveA, ValA, _, ValB, MoveA, ValA) :-
    minPlayer(Player),
    ValA > ValB, !.

compare_moves(Player, MoveA, ValA, _, ValB, MoveA, ValA) :-
    maxPlayer(Player),
    ValA < ValB, !.

compare_moves(_, _, _, MoveB, ValB, MoveB, ValB).   

% choose_move(+Board, +PlayerType, +LastMove, -NextMove)
% Chooses the next move.

choose_move(_, 'user', _, NextMove) :-
    !,
    write(' Col: '),
    read_input(C1),
    letter(C1, Col),

    currentBoardLength(BL),
    Col > -1, Col < BL,

    write(' Row: '),
    read_input(C2), 
    number(C2, Row),

    currentBoardLength(BL),
    Row > -1, Row < BL,

    write(' Dir: '),
    read_input(C3),
    dir(C3, Dir),

    NextMove = pmove(Col, Row, Dir).

choose_move(Board, 'easybot', LastMove, NextMove) :-
    !,
    valid_moves(Board, LastMove, ListOfMoves),
    random_member(NextMove, ListOfMoves),
    sleep(1).

choose_move(Board, HardBot, LastMove, NextMove) :-
    !,
    % If bot is first player, then choose random
    (LastMove = pmove(X, _, _), number(X),
    ptype(Player, HardBot), opponent(Player, NextPlayer),
    asserta(maxPlayer(Player)), asserta(minPlayer(NextPlayer)),
    minimax(3, Board, LastMove, Player, NextMove, _),
    retractall(maxPlayer(_)), retractall(minPlayer(_))
    ;
    valid_moves(Board, _, ListOfMoves),
    random_member(NextMove, ListOfMoves)),
    sleep(1).