// wait till DOM is loaded before running js.
document.addEventListener("DOMContentLoaded", () => {

    //spa view containers.
    const views = document.querySelectorAll(".view");

    //get the about dialog and close buttons.
    const aboutDialog = document.getElementById("about-dialog");
    const aboutX = document.getElementById("about-x");
    const aboutClose = document.getElementById("about-close");

    //routing function, hides views and shows when requested.
    function showView(viewName) {

        if (viewName === "about") {
            if (typeof loadAboutView === "function") {
                loadAboutView();
            }
            aboutDialog.showModal();
            return;
        }

        //hides all views.
        views.forEach(v => v.classList.add("hidden"));

        //select view by id.
        const active = document.getElementById(`view-${viewName}`);

        //show if it exists.
        if (active) active.classList.remove("hidden");

        //load content for views. WILL ADD MORE LATER
        if (viewName === "home") loadHomeView();
        if (viewName === "browse") loadBrowseCategoriesView();
        if (viewName === "browse-products") loadBrowseView();
    }

    window.showView = showView;

    //attatch click listener to nav buttons. - any .route button now not just nav bar, needed for home view button.
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".route");
        if (!btn) return;

        const view = btn.dataset.view;
        showView(view);
    });
    
    //about modal x button close.
    if (aboutX) {
        aboutX.addEventListener("click", () => {
            aboutDialog.close();
        });
    }
    
  //about modal close button close.
    if (aboutClose) {
        aboutClose.addEventListener("click", () => {
            aboutDialog.close();
        });
    }

    //default to home view on load.
    showView("home");
});
