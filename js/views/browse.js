//set active filters to an empty array.
let activeFilters = {
  gender: [],
  category: [],
  size: [],
  color: [],
};

//keep current sort selection/default by name.
let currentSort = "name";

//main load function for the browse page.
async function loadBrowseView() {
  const products = await loadProducts(); //from data.js.
  renderSortDropdown();
  renderFilters(products);
  applyFiltersAndRender(products);
}

//render the sort cat dropdown.
function renderSortDropdown() {
  const sortBox = document.getElementById("browse-sort");
  if (!sortBox || sortBox.dataset.initialized) return; //prevent rebuild.

  sortBox.innerHTML = `
    <option value="name">Product Name (A–Z)</option>
    <option value="price">Price (Low → High)</option>
    <option value="category">Category</option>
  `;

  sortBox.value = currentSort;
  sortBox.dataset.initialized = "true";

  sortBox.addEventListener("change", () => {
    currentSort = sortBox.value;
    loadBrowseView();
  });
}

//build the filter list from dataset.
function buildFilterLists(products) {
  const genders = new Set();
  const categories = new Set();
  const sizes = new Set();
  const colors = new Set();
  
  products.forEach(p => {
    if (p.gender) genders.add(p.gender);
    if (p.category) categories.add(p.category);

    if (Array.isArray(p.sizes)) {
      p.sizes.forEach(s => sizes.add(s));
    }

    if (Array.isArray(p.color)) {
      p.color.forEach(c => colors.add(c.name));
    }
  });
  
  //returns all cats per main section.
  return {
    genders: [...genders],
    categories: [...categories],
    sizes: [...sizes],
    colors: [...colors],
  };
}

//render the filter list from buildFilterLists.
function renderFilters(products) {
  const filterBox = document.getElementById("browse-filters");
  if (!filterBox) return;

  const f = buildFilterLists(products);

  filterBox.innerHTML = `
    <h3 class="text-xl font-semibold mb-4 flex items-center justify-between">
      Filters
      <button id="clear-filters" class="text-sm text-blue-600 hover:underline">
        Clear All
      </button>
    </h3>

    ${collapsible("Gender", "gender", f.genders)}
    ${collapsible("Category", "category", f.categories)}
    ${collapsible("Sizes", "size", f.sizes)}
    ${collapsible("Colors", "color", f.colors)}
  `;

  //checkbox click events.
  filterBox.querySelectorAll(".filter-check").forEach(chk => {
    chk.addEventListener("change", () => {
      const type = chk.dataset.type;
      const value = chk.dataset.value;
      
      //if checkbox for filter is checked, add value to filter list if its not alr there.
      //if  unchecked then remove the value from list then reload broswse view.
      if (chk.checked) {
        if (!activeFilters[type].includes(value)) {
          activeFilters[type].push(value);
        }
      } else {
        activeFilters[type] = activeFilters[type].filter(v => v !== value);
      }

      loadBrowseView();
    });
  });

  //clear all filters.
  document.getElementById("clear-filters").addEventListener("click", () => {
    Object.keys(activeFilters).forEach(k => (activeFilters[k] = []));
    loadBrowseView();
  });

  //collapsible section toggle.
  filterBox.querySelectorAll(".collapsible-header").forEach(header => {
    header.addEventListener("click", () => {
      header.nextElementSibling.classList.toggle("hidden");
    });
  });
}

//collapsible group with checkboxes.
function collapsible(label, type, values) {
  const selectedValues = activeFilters[type];

  return `
    <div class="mb-4 border rounded">
      <button class="collapsible-header w-full text-left px-3 py-2 bg-gray-100 font-semibold">
        ${label}
      </button>

      <div class="collapsible-body px-3 py-2 space-y-1">
        ${values
          .map(
            v => `
          <label class="flex items-center gap-2">
            <input 
              type="checkbox" 
              class="filter-check"
              data-type="${type}"
              data-value="${v}"
              ${selectedValues.includes(v) ? "checked" : ""}
            >
            <span>${v}</span>
          </label>`
          )
          .join("")}
      </div>
    </div>
  `;
}

//helper func to create dropdown sections.
function dropdown(label, type, values) {
  const active = activeFilters[type];
  const highlight = active ? "bg-gray-200" : "";

  return `
    <div class="mb-4 p-2 rounded ${highlight}">
      <p class="font-medium mb-1">${label}</p>
      <select class="filter-select w-full border rounded px-2 py-1"
              data-type="${type}">
        <option value="">All ${label}</option>
        ${values
          .map(v => `<option value="${v}" ${active === v ? "selected" : ""}>${v}</option>`)
          .join("")}
      </select>
    </div>
  `;
}

//render browse with filters.
function applyFiltersAndRender(products) {
  let filtered = [...products];

  Object.entries(activeFilters).forEach(([type, values]) => {
    if (values.length === 0) return;

    filtered = filtered.filter(p => {
      if (type === "gender") return values.includes(p.gender);
      if (type === "category") return values.includes(p.category);
      if (type === "size")
        return Array.isArray(p.sizes) && values.some(v => p.sizes.includes(v));
      if (type === "color")
        return Array.isArray(p.color) && values.some(v => p.color.some(c => c.name === v));
      return true;
    });
  });

  //sorting.
  if (currentSort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (currentSort === "price") filtered.sort((a, b) => a.price - b.price);
  if (currentSort === "category") filtered.sort((a, b) => a.category.localeCompare(b.category));

  renderActiveFilters();
  renderProducts(filtered);
}

//render the current active filter tags.
function renderActiveFilters() {
  const box = document.getElementById("active-filters");
  if (!box) return;

  box.innerHTML = "";

  Object.entries(activeFilters).forEach(([type, value]) => {
    //check for empty filters, string OR array OR null.
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return; 
    } 

    const chip = document.createElement("button");
    chip.className =
      "flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition";

    chip.innerHTML = `
      <span>${value}</span>
      <span class="font-bold text-gray-600 hover:text-gray-900">×</span>
    `;

    chip.addEventListener("click", () => {
      activeFilters[type] = null;
      loadBrowseView();
    });

    box.appendChild(chip);
  });
}

//render the actual product grid.
function renderProducts(list) {
  const resultsBox = document.getElementById("browse-results");
  if (!resultsBox) return;

  resultsBox.innerHTML = "";

  if (list.length === 0) {
    resultsBox.innerHTML = `<p>No matching products found.</p>`;
    return;
  }

  list.forEach(p => {
    const card = document.createElement("div");

    card.className =
      "border rounded-lg shadow p-3 bg-white hover:shadow-md transition flex flex-col";

    const imgUrl = `https://placehold.co/600x800?text=${encodeURIComponent(p.name)}`;

    card.innerHTML = `
      <img src="${imgUrl}" class="w-full h-40 object-cover rounded mb-3 cursor-pointer">
      <h3 class="font-semibold cursor-pointer">${p.name}</h3>
      <p class="text-gray-700 mb-3">$${p.price}</p>

      <button class="add-to-cart mt-auto bg-gray-900 text-white px-3 py-1 rounded hover:bg-gray-700">
        +
      </button>
    `;

    resultsBox.appendChild(card);
  });
}

