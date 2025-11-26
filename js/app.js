// wait till DOM is loaded before running js.
document.addEventListener("DOMContentLoaded", () => {

    //spa view containers.
    const views = document.querySelectorAll(".view");

    //routing function, hides views and shows when requested.
    function showView(viewName) {

        //hides all views.
        views.forEach(v => v.classList.add("hidden"));

        //select view by id.
        const active = document.getElementById(`view-${viewName}`);

        //show if it exists.
        if (active) active.classList.remove("hidden");

        //load content for views. WILL ADD MORE LATER
        if (viewName === "home") loadHomeView();
    }

    //attatch click listener to nav buttons.
    document.querySelectorAll(".route").forEach(btn => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view;
            showView(view);
        });
    });

    //default to home view on load.
    showView("home");
});
