:- consult('GamePlayer.pl').
:- consult('GameLogic.pl').
:- consult('GameLoop.pl').
:- consult('GameMenu.pl').
:- consult('InputOutput.pl').
:- consult('WinCondition.pl').

% play()
% Launches the game.

play :-
    % Default settings
    retractall(currentBoardLength(_)), retractall(currentConsecutive(_)),
    asserta(currentBoardLength(5)), asserta(currentConsecutive(4)),
    
    % Default first player
    retractall(firstPlayer(_)),
    asserta(firstPlayer('b')),

    % Starts main menu
    main_menu.