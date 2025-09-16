export async function fetchCategories() {
    let catData = [];
    try {
        catData = await fetch("../data/cat.json");
        catData = await catData.json();
    } catch (error) {
        console.log(error);
        return catData;
    }
    return catData;
}
