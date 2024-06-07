// GLOBAL VARIABLES ---------------------------------------------------------------------------------------------------------------------------------------- //
// The following variables have global scope so that they are accessible in every function without passing it as arguments from function to function

// Declare the global variable data which will store the fetched questions.
var data;

// Declare the global variable bestScore which will store the players' best score
var bestScore = 0;

// Create variables to track the number of correct and incorrect answers as well as a player's score
// Set them to zero as default
var correct = 0;
var wrong = 0;
var score = 0;

// Define a variable that tracks what quiz round the player is currently in within a game
var quizRound = 1;

// Declare the global variable chosenCategory which will store the selected bonus category
var chosenCategory;

// Define an array of objects storing difficulty levels. Set "random" to "true" as a default
const difficulties = [
    { level: "Random", property: true },
    { level: "Easy", property: false },
    { level: "Medium", property: false },
    { level: "Hard", property: false }
];

// FUNCTIONS ---------------------------------------------------------------------------------------------------------------------------------------------- //

window.onload = function() {
    // Add event listener to start button when the window is loaded
    document.getElementById("startBtn").onclick = selectCategory;
}

// Fetch questions
async function getQuestions() {
    try {
        // I am fetching 20 questions. I "need" only one per quiz round, but since I am sorting out questions with multiple correct answers and 
        // selecting for level of difficulty, I need to have enough alternatives. As "hard" questions are rare, the limit must be high. 
        var response = await fetch("https://quizapi.io/api/v1/questions?apiKey=Wztsr3Tk20xob6uYN3TO1vszQAf1jJF0Fj1ijKk1&limit=20")
        var questions = await response.json();
        // console.log("Quiz Questions", questions); 
        data = questions;
        //return questions
    } catch (err) {
            console.log("Could not get questions", err);
            document.getElementById("questionCard").innerHTML = "Could not get question.";
        };
};

// Select four random categories
function selectCategory() {

    // Clear the screen
    clearView();

    // Create description "choose bonus category"
    document.getElementById("questionCard").innerHTML = "Choose your BONUS category: Throughout the game, if you answer a question in this category correctly, you will receive double points for the question.";
    
    // // Fetch some category data and put it into an array to see what are the most common categories. 
    // // For development and testing purposes only:
    // getCat = [];
    // for (var i = 0; i < data.length; i++) {
    //     getCat.push(data[i].category);
    // }
    // console.log(getCat);

    // Build an array with the most common categories (from the previous step)
    categories = ["Code", "Linux", "DevOps", "Networking", "Cloud", "Docker", "Kubernetes", "SQL", "CMS"];

    // Create an array in which we will push four random indices
    let randomIndices = [];
    // Counter
    let i = 0;
    // Set the number of categories we will display to the user
    let numberOfCategories = 4;

    // Generate four random indices and push them into the randomIndices array
    while (i < numberOfCategories) {
        let randomIndex = Math.floor(Math.random() * categories.length);
        if (!randomIndices.includes(randomIndex)) {
            randomIndices.push(randomIndex);
            i++;
        }
        // If our array contains 4 elements, break out of the loop
        if (randomIndices.length === 4) {
            break;
        }
    }

    // console.log(randomIndices);

    // For every random index, pick the category with that index and create a label
    for (let i = 0; i < numberOfCategories; i++) {
        let categoryIndex = randomIndices[i];
        let randomCategory = categories[categoryIndex];
        createCategories(randomCategory);
    }

    // The "start new quiz" button should disapper when a new game starts. To prevent users from clicking the button
    // several times - and therefore being able to do some "cherry picking" with the categories which are generated new when hitting
    // the start button - I hide the start button directly after displaying the random categories
    document.getElementById("startBtn").style.display = "none";
}

// Display the four random categories to the user
function createCategories(randomCategory) {   
    // Create label for randomly selected category, set attributes id and attribute, add event listener, fill HTML tag with text
    let label = document.createElement("label");
    label.setAttribute("id", randomCategory);
    label.addEventListener("click", () => getCategory(randomCategory))
    answerDiv.appendChild(label);
    document.getElementById(randomCategory).setAttribute("class", "alert alert-success");
    document.getElementById(randomCategory).innerHTML = randomCategory;
}

// Get the chosen bonus category and start the game
function getCategory(randomCategory) {
    chosenCategory = randomCategory;
    //console.log("chosen category", chosenCategory);
    initialiseGame();
}

// Clear the screen, set tracking variables (back) to zero, display navigation elements and start a quiz round
function initialiseGame() {
    // Clear the screen
    clearView();

    // Set the number of correcty/incorrectly answered questions as well as the player's score back to zero
    correct = 0;
    wrong = 0;
    score = 0;

    // At the beginning of the game, display the info bar and all buttons that the player can use during a game
    // style.display taken from https://www.w3schools.com/jsref/prop_style_display.asp (last accessed 31/01/24)
    document.getElementById("info").style.display = "flex";
    document.getElementById("endQuiz").style.display = "inline";
    document.getElementById("50:50joker").style.display = "inline";
    document.getElementById("pauseTimer").style.display = "inline";
    document.getElementById("random").style.display = "inline";
    document.getElementById("easy").style.display = "inline";
    document.getElementById("medium").style.display = "inline";
    document.getElementById("hard").style.display = "inline";

    // Play a quiz round
    playQuizRound();
}

// Make sure that questions, answer choices etc. from previous quiz rounds are cleared
function clearView() {
    // Hide p elements (warnings, infos, questions etc.)
    document.getElementById("bonusCard").style.display = "none";
    document.getElementById("questionCard").style.display = "none";
    document.getElementById("warning").style.display = "none";

    // Define answerDiv
    let answerDiv = document.getElementById("answerDiv");

    // Remove all children elements of answerDiv
    while (answerDiv.firstChild) {
        answerDiv.removeChild(answerDiv.firstChild);
    }

    // Ensure all answers are made visible again
    let answerChoices = document.getElementsByClassName("answerchoice");
    for (let i = 0; i < answerChoices.length; i++) {
        answerChoices[i].style.display = "";
    }
}

// Show tracking information, start the timer and make sure that a question and its answer choices are created.
async function playQuizRound() {

    // Clear view
    clearView();

    // Display the quiz round, chosen bonus category, the number of correct and wrong answers, score and best score
    document.getElementById("quizRound").innerHTML = "Round "+quizRound;
    document.getElementById("chosenCategory").innerHTML = "Bonus Category: "+chosenCategory;
    document.getElementById("noOfCorrectAnswers").innerHTML = "Correct: "+correct;
    document.getElementById("noOfWrongAnswers").innerHTML = "Wrong: "+wrong;
    document.getElementById("currentScore").innerHTML = "Score: "+score;
    document.getElementById("bestScore").innerHTML = "Best Score: "+bestScore;

    // Make sure that warnings and bonus info that may have appeared in previous quiz rounds will be hidden when a new round starts
    document.getElementById("warning").style.display = "none";
    document.getElementById("bonusCard").style.display = "none";    

    // Start the countdown timer and store the interval ID
    let countdownInterval = setTimer();  

    // If there are less than 3 wrong answers, ...
    if (wrong < 3) {
        // Fetch new questions
        await getQuestions();
        // Figure out which question should be displayed
        let questionIndex = selectQuestions();
        let content = data[questionIndex];
        //console.log("index of question", questionIndex);

        // Based on that display a question on the question card
        createQuestion(content);    

        // Create the corresponding answer Choices to the above selected question
        // Pass countdownInterval to enable setting an event listener later
        createAnswerChoices(questionIndex, content, countdownInterval);

        // Add onclick property to End Quiz button to call endQuiz function when clicking
        document.getElementById("endQuiz").onclick = () => endQuiz(countdownInterval);
            
        // Add onclick property to 50:50 Joker button
        document.getElementById("50:50joker").onclick = () => fiftyFiftyJoker(questionIndex);

        // Add onclick property to the buttons that adjust the level of difficulty
        document.getElementById("random").onclick = () => updateDifficulty("Random");
        document.getElementById("easy").onclick = () => updateDifficulty("Easy");
        document.getElementById("medium").onclick = () => updateDifficulty("Medium");
        document.getElementById("hard").onclick = () => updateDifficulty("Hard");

        // Set the difficulties array back to default "Random"
        difficulties[0].property = true;
        for (let i = 1; i < difficulties.length; i++) {
            difficulties[i].property = false;
        }

        // Increment quizRound at the end of each round
        quizRound++;
         
    // If there are 3 (or more) wrong answers...
    } else {
        // Set the player's score back to zero and quit the game
        score = 0;
        endQuiz(countdownInterval);
    }   
}

// Select which of the fetched questions will be presented to the user
function selectQuestions() {
    // questionIndex variable refers to the index that a question has in the fetched data object. I define it so that I can select which question 
    // I will present and which question I might want to skip.
    let questionIndex = 0;

    // Find out which level of difficulty the player selected
    let chosenDifficulty = getDifficulty();
    console.log(chosenDifficulty);

    
    for (let i = 0; i < data.length; i++) {
        // Make sure that only "single" choice questions are presented: If a question with multiple correct answers is first 
        // in the object (questionIndex = 0), then I will skip it.
        if (data[i].multiple_correct_answers === "true") {
            //console.log("question with multiple correct answers skipped");
            questionIndex++;
            // Move on to the next question
            // continue taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/continue (last accessed 06/02/24)
            continue;
        }

        // Check if the difficulty of the question matches the chosen difficulty
        if (
            (chosenDifficulty === "Easy" && data[i].difficulty !== "Easy") ||
            (chosenDifficulty === "Medium" && data[i].difficulty !== "Medium") ||
            (chosenDifficulty === "Hard" && data[i].difficulty !== "Hard")
        ) {
            // If the difficulty doesn't match the chosen difficulty, I skip this question
            questionIndex++;
            continue; 
        }

        // If neither condition is met, this is a valid question. We can break out of the loop
        break;
    }

    console.log("question's difficulty", data[questionIndex].difficulty);
    console.log("questionIndex", questionIndex);

    return questionIndex;
}

// Find out which level of difficulty is currently set
function getDifficulty() {
    for (let i = 0; i < difficulties.length; i++) {
        if (difficulties[i].property === true) {
            return difficulties[i].level;
        }
    }
}

// Update the Boolean values in the difficulties array. This function is triggered by onclick events
function updateDifficulty(difficultyLevel) {
    // Loop through the difficulties array of objects
    for (let i = 0; i < difficulties.length; i++) {
        // If the current difficulty is the one to update, set its property to true
        // .key
        if (difficulties[i].level === difficultyLevel) {
            difficulties[i].property = true;
        } else {
            // Else, set its property to false
            difficulties[i].property = false;
        }
    }
}

// Get a question and display it
function createQuestion(content) {
    let input = content.question;
    console.log("Question", input);
    // Make sure HTML code is properly encoded and display it
    document.getElementById("questionCard").innerHTML = htmlEncode(input);
    // Style the element in which the question is shown
    document.getElementById("questionCard").style.display = "grid";

    if (content.category == chosenCategory) {
        // console.log("Bonus question");
        const bonusCard = document.getElementById("bonusCard");
        const textContent = "This is a BONUS question! You'll receive double points if your answer is correct."
        bonusCard.style.display = "grid";
        bonusCard.innerHTML = textContent;
    }
}

// Get answer choices and display them
function createAnswerChoices(questionIndex, content, countdownInterval) {
    let answerChoices = data[questionIndex].answers;
    
    // For every answer choice...
    for (let ans in answerChoices) {

        // if the value of that answer choice is not null, create a label and insert a linebreak

        if(answerChoices[ans] !== null) {
            // answerDiv is the div element in the DOM which is the parent element for all answer choices
            const answerDiv = document.getElementById("answerDiv");
            // create a label => as questions can have a varying amount of answer choices, I decided to create new elements for every 
            // question, depending on how many answer choices that particular question has
            let label = document.createElement("label");
            // set attribute "id"
            label.setAttribute("id", ans);
            // add event listener, call evaluation function when clicking on an answer choice
            label.addEventListener("click", () => evaluateAnswer(ans, content, countdownInterval))
            // append label to the DOM as a child element of "answerDiv"
            answerDiv.appendChild(label);
            // set attribute "class" for styling
            document.getElementById(ans).setAttribute("class", "alert alert-light answerchoice");

            // ensure that answer choices with HTML code are encoded properly
            let input = answerChoices[ans];
            document.getElementById(ans).innerHTML = htmlEncode(input);
            
            // create linebreak "br" element and append it after each answer choice
            let linebreak = document.createElement("br");
            answerDiv.appendChild(linebreak);

            // console.log(ans);
        }
    }
}

// Evaluate the chosen answer
function evaluateAnswer(ans, content, countdownInterval) {

    // Clear the timer
    clearInterval(countdownInterval);

    let correctAnswers = content.correct_answers
    let selectedCorrectOne = false; // false by default

    // Get the right answer by looping through correctAnswers and checking which one is "true"
    // and check if the user selected the correct answer
    for(let i in correctAnswers) {
        // If answer i is true...
        if(correctAnswers[i] === "true") {
            // ... then let it be the correct answer
            let theCorrectAnswer = i.substring(0,8);
            //console.log("The correct answer is: ", theCorrectAnswer);

            // Check if the correct answer was selected
            if(theCorrectAnswer === ans){
                selectedCorrectOne = true;
            }
  
            console.log("selected correct answer?", selectedCorrectOne);
        }
    }

    // If selected answer is the correct answer => award points 1 to 3 depending on difficulty
    if(selectedCorrectOne) {
        // Increment number of correct answers
        correct++;
        // Increment score depending on level of difficulty of the question
        let difficulty = content.difficulty
        let scoreIncrement = 0;

        if(difficulty === "Easy") {
            scoreIncrement++;
        } else if (difficulty === "Medium") {
            scoreIncrement += 2;
        } else if (difficulty === "Hard") {
            scoreIncrement += 3;
        }
        // Double the score if the correctly answered question was in the selected category
        if (chosenCategory === content.category) {
            scoreIncrement = scoreIncrement * 2;
            // console.log("Bonus category - double points granted");
        }
        // Increment the player's score by the calculated scoreIncrement
        score = score + scoreIncrement;

    // Else => award no point and count incorrect question 
    } else {
        wrong++;
    }

    // Start a new quiz round
    playQuizRound();
}

// Ensure that HTML questions are displayed correctly
// The following function is taken from https://jasonwatmore.com/vanilla-js-html-encode-in-javascript (last accessed 29/01/24)
function htmlEncode(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Show score and best score at the end of a game
function endQuiz(countdownInterval) {
    console.log("end quiz");
    // Clear the countdown/set it back
    clearInterval(countdownInterval);
    // Clear the screen
    clearView();
    
    // Update best score, if applicable, and inform the user that he/she set a new high score
    // Inform whether the user has wins or loses the game
    if (score > bestScore) {
        bestScore = score;
    }
    
    // If score is 0, display "You lose"
    if (score === 0) {
        document.getElementById("warning").style.display = "grid";
        //document.getElementById("questionCard").style.display = "none";
        document.getElementById("warning").innerHTML = "You lose...";
    // Else, display "You win!"
    } else {
        document.getElementById("questionCard").style.display = "grid";
        //document.getElementById("warning").style.display = "none";
        document.getElementById("questionCard").innerHTML = "You win!";
    }
    
    // Create a paragraph to display the player's score
    let answerDiv = document.getElementById("answerDiv");
    let showScore = document.createElement("p");
    let textContent = showScore.textContent = "Your Score: "+score;
    showScore.setAttribute("id", "showScore");
    answerDiv.appendChild(showScore);
    document.getElementById("showScore").innerHTML = textContent;

    // Create a paragraph to display the player's best score
    let showBestScore = document.createElement("p");
    let textContent2 = showBestScore.textContent = "Your Best Score: "+bestScore;
    showBestScore.setAttribute("id", "showBestScore");
    answerDiv.appendChild(showBestScore);
    document.getElementById("showBestScore").innerHTML = textContent2;

    // Hide the info bar and buttons
    let displayNone = "none";
    document.getElementById("info").style.display = displayNone;
    document.getElementById("endQuiz").style.display = displayNone;
    document.getElementById("50:50joker").style.display = displayNone;
    document.getElementById("pauseTimer").style.display = displayNone;
    document.getElementById("random").style.display = displayNone;
    document.getElementById("easy").style.display = displayNone;
    document.getElementById("medium").style.display = displayNone;
    document.getElementById("hard").style.display = displayNone;

    // Display start button to enable the player to begin a new quiz
    document.getElementById("startBtn").style.display = "inline";

    // Set quizRound back to 1
    quizRound = 1;
}

// 50:50 Joker
function fiftyFiftyJoker(questionIndex) {
    // Get the correct_answers object. It contains boolean values that indicate for each answer a to f whether they are true or false.
    // Note that non existent answer choices are classified as false (i.e., if a question has less than six answer choices).
    let correctAnswers = data[questionIndex].correct_answers;
    // console.log(correctAnswers);
    // Get the answers object. It contains for each answer a to f the answer text or null in case there are less than six answer choices.
    let answers = data[questionIndex].answers;
    // console.log(answers);

    // Set up an array that will contain all answer choices that will be hidden
    let hiddenAnswers = [];
    // Total number of answer choices of a question
    let numberOfAnswers = 0;
    // Number of deleted answer choices of that question
    let numberOfDeleted = 0;
    
    // Loop over the answers object. If an answer choice is not null, increment the number of answers.
    // We have to check for !null because not all questions have 6 answer choices
    for (let key in answers) {
        if (answers[key] !== null) {
          numberOfAnswers++;
        }
    }

    // console.log("number of answers", numberOfAnswers);

    // If there are more than two answer choices...
    if (numberOfAnswers > 2) {
        // ... figure out how many choices should be deleted. We devide the total number of answers by two (to get the half),
        // and round down, because for odd results we want less than half of the questions disappear
        numberOfDeleted = Math.floor(numberOfAnswers / 2);
        // console.log("number of deleted", numberOfDeleted);
        //console.log("number of answers", numberOfAnswers, "number of deleted answers", numberOfDeleted);

        // For every answer, check whether it is false. If it is false, push into hidden answers and hide it.
        // Break out of the loop if the length of the hiddenAnswers array is equal to the number of deleted answers =>
        // then we stop hiding answers.
        for (let key in correctAnswers) {
            if (correctAnswers[key] === "false") {
                let hiddenAnswer = key.substring(0,8);
                hiddenAnswers.push(hiddenAnswer);
                document.getElementById(hiddenAnswer).style.display = "none";
                if (hiddenAnswers.length === numberOfDeleted) break;
            }
        }
    
        // console.log("hidden answers", hiddenAnswers);

        // Hide the joker button so that users cannot use it again in this game
        document.getElementById("50:50joker").style.display = "none";

    } else {
        // If there are only two answer choices, display a warning
        const warning = document.getElementById("warning");
        const textContent = "You cannot use the 50:50 Joker for questions with only 2 answer choices."
        warning.style.display = "grid";
        warning.innerHTML = textContent;
        // console.log(warning.textContent);
    }
}

// Countdown/timer function
function setTimer() {
    // Set the initial countdown value
    let countdownSeconds = 20;

    // Change the color of the timer to white. This step is important here as the color of the timer will
    // change to red when the counter has only 3 seconds remaining. If the timer of the previous question passed 
    // the 3 seconds, it turned red. Here, I make sure the timer will always be white in the beginning:
    document.getElementById("timer").style.color = "white";

    // Update the countdown every second
    // setInterval() function taken from https://developer.mozilla.org/en-US/docs/Web/API/setInterval (last accessed 31/01/24)
    const countdownInterval = setInterval(() => updateCountdown(), 1000);

    // Function to update the countdown
    function updateCountdown() {
        // Display the current countdown value
        // console.log(countdownSeconds);
        document.getElementById("timer").innerHTML = countdownSeconds;

        // Decrease the countdown value by 1
        countdownSeconds--;

        // Change the color of the countdown to red when there are only 3 seconds left
        if (countdownSeconds === 2) {
            document.getElementById("timer").style.color = "red";
        }

        // If the countdown reaches 0 (-1 to get the full last second), the question will count as wrong and a new quiz round starts
        // clearInterval() function taken from https://developer.mozilla.org/en-US/docs/Web/API/setInterval (last accessed 31/01/24)
        if (countdownSeconds === -1) {
            // Set interval back/clear interval
            clearInterval(countdownInterval);
            // change the color of the timer back to white
            document.getElementById("timer").style.color = "white";
            // console.log("Countdown is over!");
            // Increment the number of incorrect answers
            wrong++;
            // Start new quiz round
            playQuizRound();
        }
    }

    // Add onclick property to "Pause Timer" function
    document.getElementById("pauseTimer").onclick = () => pauseTimer(countdownSeconds, countdownInterval);

    // Return the interval ID
    return countdownInterval;
}

// Pause the above timer/set a timeout
function pauseTimer(countdownSeconds, countdownInterval) {
    console.log("timeout for 60 seconds");

    // Remove the "Pause Timer" button to allow using it only once per game
    document.getElementById("pauseTimer").style.display = "none";

    // Store the remaining time to resume countdown later
    let remainingCountdown = countdownSeconds
    // console.log("Remaining time in countdown timer:", remainingCountdown);

    // Clear the original countdown interval
    clearInterval(countdownInterval); 

    // Set timeout value. Add the remaining countdown from the regular countdown on top.
    let timeout = 60 + remainingCountdown;

    // Define Boolean variable to distinguish between the regular countdown and the timeout countdown
    let isPaused = true;

    // Update the timeout countdown every second
    const timeoutInterval = setInterval(updateTimeout, 1000);

    // Function to update the timeout countdown
    function updateTimeout() {
        console.log(timeout);

        // Display the current countdown value to the user if not paused (i.e., if the timeout is over)
        if (!isPaused) {
            document.getElementById("timer").innerHTML = remainingCountdown;

            // Decrease the remaining time by 1 second
            remainingCountdown--;

            // Change the color of the countdown to red when there are only 3 seconds left
            if (remainingCountdown === 2) {
                document.getElementById("timer").style.color = "red";
            }

            // If the remaining time reaches 0, clear the timeout interval and resume the original timer
            if (remainingCountdown === -1) {
                clearInterval(timeoutInterval);
                // change the color of the timer back to white
                document.getElementById("timer").style.color = "white"; 
                // console.log("Timeout and countdown over!");
                // Increment the number of incorrect answers
                wrong++;
                // Start a new quiz round
                playQuizRound();
            }
        }

        // If timeout interval is over, set isPaused to false. The timeout countdown ends, the remaining seconds on the regular timer resume counting down.
        if (timeout === remainingCountdown) {
            // console.log("Pause over");
            isPaused = false;
        }

        // Decrease the timeout countdown by 1 every second
        timeout--;

        // Get all elements with class "answerchoice"
        // querySelectorAll taken from https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll (last accessed 04/02/24)
        // document.getElementByClassName does not work in the forEach function. This seems to be the case because querySelectorAll returns a NodeList 
        // while getElementByClassName returns an HTMLCollection (see https://stackoverflow.com/questions/14377590/queryselector-and-queryselectorall-vs-getelementsbyclassname-and-getelementbyid, last accessed 04/02/24)
        const answerElements = document.querySelectorAll(".answerchoice");

        // Add eventlistener to all answer choices, so that the clearTimeout(timeoutIntervall) function is called when clicking an answer choice
        answerElements.forEach(element => {
            element.onclick = () => {
                clearTimeout(timeoutInterval);
            };
        });
    }
}

// Clear the timeout countdown
function clearTimeout(timeoutInterval) {
    // console.log("clearTimeout activated");
    clearInterval(timeoutInterval);
}



