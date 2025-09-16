import { fetchCategories } from "./api.js";
/************** Global variables ********* */
let questionsData = [];
let currQuestionIdx = -1;
let scoreTracker = 0;
let timerId = 0;
/****************************  handling question fetching *****************************************/
function getCategoryId() {
    let searchParms = new URLSearchParams(window.location.search)
    return searchParms.get("catId")
}
async function fetchCategoryQuestions(catId,nQuestions,difficulty) {
    try {
        let response = await fetch(`https://opentdb.com/api.php?amount=${nQuestions}&category=${catId}&difficulty=${difficulty}&type=multiple`);
        if (!response.ok)
            throw new Error(`HTTP Error Status : ${response.status}`)
        let questions = await response.json()
        // console.log(questions);
        return questions.results;
    } catch (error) {
        console.log(error);
    }
}
// (async function () {
//   let data = await fetchCategoryQuestions(9, 10, "easy"); // 9 = General Knowledge
//   console.log("Fetched questions:", data.results);
// })();
/************************ handling timer ************************** */
function setTimer(Minutes , callBackFunc) {
    let targetTime = new Date();
    targetTime.setMinutes(targetTime.getMinutes() + Minutes);
    let intervalId = setInterval(() => {
        let remaingMs = targetTime - new Date();
        if (remaingMs <= 0) {
            clearInterval(intervalId);
            callBackFunc();
            return;
        }
        let remaingMinutes = Math.floor(remaingMs /  (1000*60) );
        let remaingSec = Math.floor((remaingMs / 1000) % 60);
        let countDownStr = `${remaingMinutes
            .toString()
            .padStart(2, "0")} : ${remaingSec.toString().padStart(2, "0")}`;
        showRemainingTime(countDownStr);
        // console.log(targetTime - new Date());
    },1000)
    return intervalId;
}
function showRemainingTime(str) {
    document.querySelector(".timer .remaing-time").innerText = str
}
/*******************Answer Validation ****************** */
function validateAnswer(event) {
    // now we have a problem the target may be the span inside the li
    // but we need the li itself so we check the target 
    let targetLi = event.target;
    let correctli;
    let correctAnswer = questionsData[currQuestionIdx].correct_answer;

    if (event.target.localName == "span")
        targetLi = event.target.parentElement;
    let chosesAnswer = targetLi.querySelector(".choice-text").innerText;
    // remove hover from all li
    let allchoices = Array.from(targetLi.parentElement.children);
    allchoices.forEach((li) => {
        li.classList.remove("hover-enable")
        if (li.querySelector(".choice-text").innerText == correctAnswer)
            correctli = li;
    });
    // console.log(targetLi === correctli);
    // get the li that contain correct answer

    correctli.classList.replace("alert-light", "alert-success");
    let feedbackDiv = document.querySelector(".question-result .feed-back");
    if (chosesAnswer != correctAnswer) {
        targetLi.classList.replace("alert-light", "alert-danger");
        feedbackDiv.innerText = "✗ Incorrect";
        feedbackDiv.classList.add("text-danger")
    }
    else {
        scoreTracker++;
        feedbackDiv.innerText = "✓ Correct!";
        feedbackDiv.classList.add("text-success");
    }
}
/******************************** rendering **************************************** */
function showQuizResult() {
    let quizContainer = document.querySelector(".quiz .container");

    // calculate percentage
    let percentage = Math.round((scoreTracker / questionsData.length) * 100);

    quizContainer.innerHTML = `
        <div class="text-center my-5">
        <h2 class="mb-4">🎉 Quiz Finished! 🎉</h2>
        <p class="lead">Here’s how you did:</p>

        <div class="alert alert-light border rounded-3 shadow-sm py-4 fs-3">
            <div class="row text-center pt-5 pb-5">
            <div class="col-12 col-md-4 mb-3 mb-md-0">
                <h5 class="mb-1 text-success fs-3"><i class="bi bi-check-circle fs-3"></i> ${scoreTracker}</h5>
                <small class="text-muted fs-3">Correct Answers</small>
            </div>
            <div class="col-12 col-md-4 mb-3 mb-md-0">
                <h5 class="mb-1 text-primary fs-3"><i class="bi bi-list-ol fs-3"></i> ${questionsData.length}</h5>
                <small class="text-muted">Total Questions</small>
            </div>
            <div class="col-12 col-md-4 ">
                <h5 class="mb-1 fs-3"><span id="percent-holder">${percentage}%</span></h5>
                <small class="text-muted">Score</small>
            </div>
            </div>
        </div>

        <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
            <button id="retakeBtn" class="btn btn-outline-primary btn-lg rounded-3 p-3 w-100 w-sm-auto">
            <i class="bi bi-arrow-clockwise"></i> Retake Quiz
            </button>
            <button id="newBtn" class="btn gradient-btn btn-lg rounded-3 text-white p-3 w-100 w-sm-auto">
            <i class="bi bi-star"></i> Try New Quiz
            </button>
            <button id="homeBtn" class="btn btn-outline-secondary btn-lg rounded-3 p-3 w-100 w-sm-auto">
            <i class="bi bi-house"></i> Home
            </button>
        </div>
        </div>
    `;

  // 🎨 add dynamic percentage color
    let holder = document.getElementById("percent-holder");
    if (percentage < 50) {
        holder.classList.add("text-danger");
    } else if (percentage < 75) {
        holder.classList.add("text-warning");
    } else {
        holder.classList.add("text-success");
    }

    // add actions
    document.getElementById("retakeBtn").addEventListener("click", () => {
        window.location.reload();
    });

    document.getElementById("homeBtn").addEventListener("click", () => {
        window.location.href = "index.html";
    });

    document.getElementById("newBtn").addEventListener("click", () => {
        window.location.href = "getStart.html";
    });
}

function renderQuizDescription(catData) {
    let quizTitle = document.querySelector(".quiz-title h5");
    quizTitle.innerText = catData.title;
    let quizDesc = document.querySelector(".quiz-title p");
    quizDesc.innerText = catData.description;
    let nQuestions = document.querySelector(".quiz-info .top-tracker .question-tracker");
    nQuestions.innerHTML = `Question <span class="curr-question">1</span> of ${catData.questions}`;
}
function updateQuestionsTrackers(){
    let topTracker = document.querySelector(".top-tracker .question-tracker .curr-question");
    topTracker.innerText = currQuestionIdx + 1;
    let bottomProgress = document.querySelector(".progress .progress-bar");
    let currProgress = ( (currQuestionIdx + 1 ) / questionsData.length) * 100;
    currProgress = Math.floor(currProgress);
    bottomProgress.style.width = `${currProgress}%`;
    bottomProgress.innerText = `${currProgress}%`
}
function cloneQuestionTemplate(){
    let dynamicTemplate = document.querySelector(".quiz .dynamic-template")
    let questionArea = document.querySelector(".quiz .question-area");
    questionArea.innerHTML = "";
    questionArea.appendChild(dynamicTemplate.content.cloneNode(true));
};

function renderNextQuestion(questionsData) {
    currQuestionIdx++;
    // check if the questions if finished
    if(currQuestionIdx == questionsData.length){
        showQuizResult();
        clearInterval(timerId)
        return;
    }
    // clone question-area template
    cloneQuestionTemplate();
    let currQuestion = questionsData[currQuestionIdx];
    let question = document.querySelector(".question-text .question-name");
    question.innerHTML = currQuestion.question;
    let choices = [...currQuestion.incorrect_answers, currQuestion.correct_answer];
    // shuffling
    let shuffledChoices = shuffleArray(choices);
    /** */
    let choicesSpans = document.querySelectorAll(".question-text .choices .choice-text");
    choicesSpans.forEach((span,idx) => {
        span.innerText = shuffledChoices[idx];
        // add hover-class
        span.parentElement.classList.add("hover-enable")
        // add events just one time
        // add click event 
        span.parentElement.addEventListener("click",validateAnswer)    
    });
    let nextQuestionBtn = document.querySelector(".question-result .btn");
    if(currQuestionIdx == questionsData.length - 1)
        nextQuestionBtn.innerText = "Submit Answers"
    nextQuestionBtn.addEventListener("click", () => {
        renderNextQuestion(questionsData);
    });
    updateQuestionsTrackers();

}
(async function renderQuizMain() {
    let catId = getCategoryId();
    let catData = await fetchCategories();
    catData = catData.filter((cat) => cat.id == catId)[0];
    renderQuizDescription(catData);
    timerId = setTimer(parseInt(catData.time),showQuizResult)
    questionsData = await fetchCategoryQuestions(catId, catData.questions, catData.difficulty[0])
    renderNextQuestion(questionsData);
    // showQuizResult();
})();

/******************** Helping functions *********************** */
function shuffleArray(arr) {
    let array = [...arr]; // copy to avoid mutating original
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index 0..i
        [array[i], array[j]] = [array[j], array[i]]; // swap
    }
    return array;
}
