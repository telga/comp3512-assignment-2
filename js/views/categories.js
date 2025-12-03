//called on any browse link click
async function loadBrowseCategoriesView() {
  const products = await loadProducts();

  const categories = new Set(products.map(p => p.category));
  const genders = new Set(products.map(p => p.gender));

  const container = document.getElementById("browse-category-list");

  container.innerHTML = `
      ${[...genders].map(g => categoryCard(g, "gender")).join("")}
      ${[...categories].map(c => categoryCard(c, "category")).join("")}
  `;
}

//render each category card.
function categoryCard(name, type) {
  return `
    <button 
      class="border p-4 shadow hover:bg-gray-100 transition category-select"
      data-type="${type}" 
      data-value="${name}">
      <h3 class="text-lg font-semibold">${formatLabel(name)}</h3>
    </button>
  `;
}

//click category to preload browse view
document.addEventListener("click", e => {
  if (e.target.closest(".category-select")) {
    const btn = e.target.closest(".category-select");
    const type = btn.dataset.type;  
    const value = btn.dataset.value;

    preloadBrowse(type, value);
    showView("browse-products");
  }
});

//STOP CP ROUNDED FROM PROFILE ITS FUCKING UGLY - this is a note to myself cus im stealing tailwind styles from my projects cus im lazy