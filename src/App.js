import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

// stars display element
const StarDisplay = props => (
	utils.range(1, props.count).map(starId => 
		<div key={starId} className="star" />
	)
);

// nums button
const PlayNumber = props => (
	<button 
		className="number" 
		style={{ backgroundColor: colors[props.status] }}
		onClick={() => props.onClick(props.number, props.status)}>
		{props.number}
	</button>
);

// play again button
const PlayAgain = props => (
	<div className="game-done">
		<div className='message' style={{ color: props.gameStatus === 'lost' ? 'red' : 'green' }}>
			{props.gameStatus === 'lost' ? 'Game Over ' : 'Nice'}
		</div>
		<button onClick={props.onClick}>Play Again</button>
	</div>
);

// custom hook
const useGameState = () => {
	// all states
	const [stars, setStars] = useState(utils.random(1, 9));
	const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
	const [candidateNums, setCandidateNums] = useState([]);
	const [secondsLeft, setSecondsLeft] = useState(10);

	// setTimeout
	useEffect(() => {
		if(secondsLeft > 0 && availableNums.length > 0){
			const timerId = setTimeout(() => {
				setSecondsLeft(secondsLeft - 1);
			}, 1000);

			return () => clearTimeout(timerId);
		}
	});

	const setGameState = (newCandidateNums) => {
		if(utils.sum(newCandidateNums) !== stars){
			setCandidateNums(newCandidateNums);
		} else {
			const newAvialableNums = availableNums.filter(
				n => !newCandidateNums.includes(n)
			);

			// redraw stars 
			setStars(utils.randomSumIn(newAvialableNums, 9));
			setAvailableNums(newAvialableNums);
			setCandidateNums([]);
		}
	}

	return {stars, availableNums, candidateNums, secondsLeft, setGameState}
}

const Game = (props) => {

	const {
		stars, 
		availableNums, 
		candidateNums, 
		secondsLeft, 
		setGameState
	} = useGameState();

	// sum candidate 
	const candidateAreWrong = utils.sum(candidateNums) > stars;

	// game status
	const gameStatus = availableNums.length === 0 ? 'won' : secondsLeft === 0 ? 'lost' : 'active';

	// state of clicked numbers
	const numberStatus = (number) => {
		// checked if number is used
		if(!availableNums.includes(number)){
			return 'used';
		}

		if(candidateNums.includes(number)){
			return candidateAreWrong ? 'wrong' : 'candidate';
		}

		return 'available';
	}

	// onclick number event
	const onNumberClick = (number, currentStatus) => {
		if(gameStatus !== 'active' || currentStatus === 'used'){
			return;
		}

		// candidate numbers
		const newCandidateNums = currentStatus === 'available' ? 
			candidateNums.concat(number) : candidateNums.filter(cn => cn !== number);

		setGameState(newCandidateNums);
	}

	// return
	return (
		<div className="game">
			<div className="help">
				Pick 1 or more numbers that sum to the number of stars
			</div>
			<div className="body">
				<div className="left">
					{gameStatus !== 'active' ? (<PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />) : (<StarDisplay count={stars} />)}
				</div>
				<div className="right">
					{utils.range(1, 9).map(number => 
						<PlayNumber 
							key={number}
							status={numberStatus(number)}
							number={number}
							onClick={onNumberClick}
						/>
					)}
				</div>
			</div>
			<div className="timer">Time Remaining: {secondsLeft}</div>
		</div>
	);
}

const StarMatch = () => {
	const [gameId, setGameId] = useState(1);
	return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)} />;
}

// Color Theme
const colors = {
	available: 'lightgray',
	used: 'lightgreen',
	wrong: 'lightcoral',
	candidate: 'deepskyblue',
}

// Math science
const utils = {
	// Sum an array
	sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

	// create an array of numbers between min and max (edges included)
	range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

	// pick a random number between min and max (edges included)
	random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

	// Given an array of numbers and a max...
	// Pick a random sum (< max) from the set of all available sums in arr
	randomSumIn: (arr, max) => {
		const sets = [[]];
		const sums = [];
		for (let i = 0; i < arr.length; i++) {

			for (let j = 0, len = sets.length; j < len; j++) {
				const candidateSet = sets[j].concat(arr[i]);
				const candidateSum = utils.sum(candidateSet);
				if (candidateSum <= max) {
					sets.push(candidateSet);
					sums.push(candidateSum);
				}
			}
		}

		return sums[utils.random(0, sums.length - 1)];
	},
}

export default StarMatch;
