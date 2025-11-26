//func to load content for home view.
function loadHomeView() {

    //get the article for home view in index.html.
    const home = document.getElementById("view-home");

    //inject the html
    home.innerHTML = `
        <section class="max-w-3xl mx-auto text-center mt-10">

            <h2 class="text-3xl font-bold mb-4">Welcome to Brian's Goods</h2>

            <p class="text-gray-700 text-lg mb-6">
                COMP 3512 - Assignment 2 Site
            </p>

            <div class="bg-white shadow-md p-6 border border-gray-200">
                <p class="text-gray-800 mb-4">
                    Uhh put something here idk an image or something.
                </p>

                <button class="route px-6 py-3 bg-gray-900 text-white" data-view="browse">
                    Browse Now
                </button>
            </div>
        </section>
    `;
}
