% Player type
:- dynamic ptype/2.

% First player
:- dynamic firstPlayer/1.

% Opponents
opponent('o', 'b').
opponent('b', 'o').

% start_game()
% Starts the game.

start_game :-
    create_board(Board), firstPlayer(FP), game_loop(Board, _, FP).

% start_pvp()
% Starts a PvP game.

start_pvp :-
    asserta(ptype('o', 'User')), asserta(ptype('b', 'User')),
    start_game,
    retractall(ptype(_, _)).

% start_pvb(+Difficulty)
% Stars a PvB game.

start_pvb(Difficulty) :-
    Difficulty == 'Easy',
    asserta(ptype('o', 'EasyBot')), asserta(ptype('b', 'User')),
    start_game,
    retractall(ptype(_, _))
    ;
    Difficulty == 'Hard',
    asserta(ptype('o', 'HardBot')), asserta(ptype('b', 'User')),
    start_game,
    retractall(ptype(_, _)).

% start_bvb(+Difficulty)
% Starts a BvB game.

start_bvb(Difficulty) :-
    Difficulty == 'Easy',
    asserta(ptype('o', 'EasyBot')), asserta(ptype('b', 'EasyBot')),
    start_game,
    retractall(ptype(_, _))
    ;
    Difficulty == 'Hard',
    asserta(ptype('o', 'HardBot')), asserta(ptype('b', 'HardBot')),
    start_game,
    retractall(ptype(_, _)).

% game_loop(+Board, +LastMove, +CurrentPlayer)
% Game loop

game_loop(Board, LastMove, CurrentPlayer) :-
    clear_screen,
    display_game(Board, LastMove, CurrentPlayer),
    
    evaluate_input(Board, LastMove, CurrentPlayer, NextMove, NewBoard),
    
    next_loop(NewBoard, NextMove, CurrentPlayer).

% evaluate_input(+Board, +LastMove, +CurrentPlayer, -NextMove, -NewBoard)
% Evaluates input and, if valid, performs a move.

evaluate_input(Board, LastMove, CurrentPlayer, NextMove, NewBoard) :-
    ptype(CurrentPlayer, PlayerType),

    repeat,
        choose_move(Board, PlayerType, LastMove, NextMove),
        validate_move(Board, LastMove, NextMove),
        move(Board, CurrentPlayer, NextMove, NewBoard).

% next_loop(+Board, +NextMove, +Player)
% Evaluates the current state of the board, ending the game or continuing to the next loop.

next_loop(Board, NextMove, Player) :-
    game_over(Board, NextMove, Player, _), 
    clear_screen, display_game(Board, NextMove, Player), player_won(Player)
    ;
    opponent(Player, NextPlayer), game_loop(Board, NextMove, NextPlayer).