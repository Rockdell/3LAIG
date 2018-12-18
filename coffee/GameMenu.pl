:- use_module(library(system)).

% Current board length.
:- dynamic currentBoardLength/1.

% Current consecutive pieces.
:- dynamic currentConsecutive/1.

% main_menu()
% Opens main menu.

main_menu :-
    clear_screen,
    write_logo,

    write(' [1] Player vs Player'), nl,
    write(' [2] Player vs Bot'), nl,
    write(' [3] Bot vs Bot'), nl,
    write(' [4] Settings'), nl,
    write(' [5] Exit'), nl,
    nl, nl, nl,

    read_input(Input),
    handle_input('Main', Input).

% pvb_menu()
% Opens the PvB menu.

pvb_menu :-
    clear_screen,
    write_logo,

    write(' [1] Easy bot'), nl,
    write(' [2] Hard bot'), nl,
    write(' [3] Back'), nl,
    nl, nl, nl,

    read_input(Input),
    handle_input('PvB', Input).

% bvb_menu()
% Opens the BvB menu.

bvb_menu :-
    clear_screen,
    write_logo,

    write(' [1] Easy bot'), nl,
    write(' [2] Hard bot'), nl,
    write(' [3] Back'), nl,
    nl, nl, nl,

    read_input(Input),
    handle_input('BvB', Input).

% order_menu()
% Opens the order menu.

order_menu :-
    clear_screen,
    write_logo,
    nl, nl, nl,

    repeat,
        write(' First player (o or b): '),

        read_input(FP),

        (FP == 'o' ; FP == 'b'),

        retractall(firstPlayer(_)),
        asserta(firstPlayer(FP)).

% settings_menu()
% Opens the settings menu.

settings_menu :-
    clear_screen,
    write_logo,
    nl, nl, nl,

    repeat,
        write(' Board length (5..7): '), 

        read_input(BL),
        char_to_number(BL, BoardLength),

        BoardLength > 4, BoardLength < 8,
        
        retractall(currentBoardLength(_)),
        asserta(currentBoardLength(BoardLength)),

    repeat,
        write(' Consecutive pieces to win (3..'), 
        MaxPieces is BoardLength, write(MaxPieces), write('): '),
        
        read_input(CP),
        char_to_number(CP, ConsecutivePieces),

        ConsecutivePieces > 2, ConsecutivePieces =< BoardLength,

        retractall(currentConsecutive(_)),
        asserta(currentConsecutive(ConsecutivePieces)).

% handle_input(+State, +Input)
% Handles the input from the menus.

handle_input(State, Input) :-

    State == 'Main',
    (
        Input == '1', !, start_pvp, !, main_menu
        ;
        Input == '2', !, pvb_menu
        ;
        Input == '3', !, bvb_menu
        ;
        Input == '4', !, settings_menu, !, main_menu
        ;
        Input == '5', !
        ;
        main_menu
    );
    State == 'PvB',
    (
        Input == '1', order_menu, start_pvb('Easy'), !, main_menu
        ;
        Input == '2', order_menu, start_pvb('Hard'), !, main_menu
        ;
        Input == '3', main_menu
        ;
        pvb_menu
    );
    State == 'BvB',
    (
        Input == '1', start_bvb('Easy'), !, main_menu
        ;
        Input == '2', start_bvb('Hard'), !, main_menu
        ;
        Input == '3', main_menu
        ;
        bvb_menu
    ).

% write_logo()
% Writes logo.

write_logo :-
    write('           _             _            _          _          _            _      '), nl,
    write('         /\\ \\           /\\ \\         /\\ \\       /\\ \\       /\\ \\         /\\ \\    '), nl,
    write('        /  \\ \\         /  \\ \\       /  \\ \\     /  \\ \\     /  \\ \\       /  \\ \\   '), nl,
    write('       / /\\ \\ \\       / /\\ \\ \\     / /\\ \\ \\   / /\\ \\ \\   / /\\ \\ \\     / /\\ \\ \\  '), nl,
    write('      / / /\\ \\ \\     / / /\\ \\ \\   / / /\\ \\_\\ / / /\\ \\_\\ / / /\\ \\_\\   / / /\\ \\_\\ '), nl,
    write('     / / /  \\ \\_\\   / / /  \\ \\_\\ / /_/_ \\/_// /_/_ \\/_// /_/_ \\/_/  / /_/_ \\/_/ '), nl,
    write('    / / /    \\/_/  / / /   / / // /____/\\  / /____/\\  / /____/\\    / /____/\\    '), nl,
    write('   / / /          / / /   / / // /\\____\\/ / /\\____\\/ / /\\____\\/   / /\\____\\/    '), nl,
    write('  / / /________  / / /___/ / // / /      / / /      / / /______  / / /______    '), nl,
    write(' / / /_________\\/ / /____\\/ // / /      / / /      / / /_______\\/ / /_______\\   '), nl,
    write(' \\/____________/\\/_________/ \\/_/       \\/_/       \\/__________/\\/__________/   '), nl, 
    nl, 
    write(' Board length:       '), currentBoardLength(BL), write(BL), nl,
    write(' Consecutive pieces: '), currentConsecutive(C), write(C),
    nl, nl, nl.

% clear_screen()
% Clears screen.

clear_screen :- write('\33\[2J').