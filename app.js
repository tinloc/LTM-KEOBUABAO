// always storage DOM elements in varibles on top because we won't need to repeat querySelector many times
const userScoreSpan = document.querySelector("#user-score");
const computerScoreSpan = document.querySelector("#computer-score");
const scoreBoardDiv = document.querySelector(".score-board");
const resultDiv = document.querySelector(".result > p"); // get the p tag inside the result class
const rockDiv = document.querySelector("#r");
const paperDiv = document.querySelector("#p");
const scissorsDiv = document.querySelector("#s");
// make computer's choice (random choice between those 3 options)
function getComputerChoice() {
    const choices = ["r", "p", "s"];
    const randomNumber = Math.floor(Math.random() * 3);
    //Math is a build-in object in JS and random() and floor() are methods that exists in Math object
    //random() gives random decimal numbers between 0 and 1
    // floor() give rounding Numbers 0,1,2 , because the array only has 3 elements
    return choices[randomNumber];
}
//console.log(getComputerChoice());