import { fetchCategories } from "./api.js";
// this function is called in the quiz.js module why ?
document.addEventListener("DOMContentLoaded", async () => {
    // console.log("efefef");
    let catData = await fetchCategories();
    // console.log(catData);
    RenderCategories(catData);
})

function RenderCategories(catData) {
    let catContainer = document.getElementById("cat-container");
    // console.log(catContainer);
    let catTemplate = document.querySelector("#cat-template")
    catContainer.innerHTML = ""
    for (const [index, cat] of catData.entries()) {
        // create new card
        let newCard = catTemplate.content.cloneNode(true);
        //set card icon
        let cardIcon = newCard.querySelector(".cat-title i")
        cardIcon.className = `bi ${cat.icon} bg-hero d-block fs-3 mb-3 p-3 rounded text-white`;
        // set card title
        let catTitle = newCard.querySelector(".cat-title h3")
        catTitle.innerText = cat.title;
        // set card description
        newCard.querySelector(".cat-title p").innerText = cat.description;
        // set card info like n question , rating ,..
        let listItems = newCard.querySelectorAll(".cat-info li span")
        let listItemsType = ["questions","time","participants","rating"]
        listItems.forEach((liSpan, idx) => {
            // li.innerText = "";
            liSpan.innerText = cat[listItemsType[idx]];
            // console.log(li.innerText);
        });
        // give each btn a unique id
        let quizBtn = newCard.querySelector("button");
        quizBtn.dataset.catId = cat.id;
        quizBtn.addEventListener("click", (event) => {
            window.location.href = `quiz.html?catId=${event.target.dataset.catId}`;
        })
        catContainer.appendChild(newCard);
    }
}