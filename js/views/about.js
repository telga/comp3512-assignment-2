//func to load content for about dialog.
function loadAboutView() {
  
  //get the about content and also dialog content inside index.html
  const content = document.getElementById("about-content");
  const dialog = document.getElementById("about-dialog");
  
  //inject html inside the dialog.
  content.innerHTML = `
    <div class="space-y-3 text-sm text-gray-800">
      <p>gonna put some about stuff here</p> 
    </div>
  `;

  //adds click listener to x and close button to close dialog.
  const xBtn = document.getElementById("about-x");
  const closeBtn = document.getElementById("about-close");
  
  //x top right to close.
  if (xBtn) {
    xBtn.addEventListener("click", () => {
      dialog.close();
    });
  }

  //close button.
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      dialog.close();
    });
  }
}
