//ADD BROWSE ALL BUTTON FOR NO FILTER PRESET
//ADD SAVE STATE OF COLLAPSABLES - CURERNTLY ANY CHANGE IN FILTER WILL OPEN A COLLAPSED FILTERBOX

//called when cat card is clicked.
async function preloadBrowse(type, value) {
  //wipe filters.
  activeFilters = { gender: [], category: [], size: [], color: [] };

  //preselect main filter from category clicked.
  activeFilters[type] = [value];

  //load the browse view with the filter preset.
  await loadBrowseView();
}

//helper to capitalize men and women due to api data set having men and women uncappped.
function formatLabel(label) {
  if (label.toLowerCase() === "womens") return "Womens";
  if (label.toLowerCase() === "mens") return "Mens";
  return label;
}

//holds all current filters.
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
  const products = await loadProducts();

  //shrink dataset only using gender and category (drive size and color options).
  const baseFiltered = filterByBase(products);

  cleanupDependentFilters(baseFiltered); //remove color and size filters that no longer apply.
  renderSortDropdown(); //render sort dropdown menu.
  renderFilters(products);  //render the filter sidebar.
  applyFiltersAndRender(products); //edraw grid from active filters.
}

//render the sort cat dropdown.
function renderSortDropdown() {
  const sortBox = document.getElementById("browse-sort");
  if (!sortBox) return;

  //run only once (didnt set the condition before and it bogged up the sort speed as it always kept growing).
  if (!sortBox.dataset.initialized) {
    sortBox.innerHTML = `
      <option value="pop">Popularity</option>
      <option value="name">Product Name (A–Z)</option>
      <option value="price">Price (Low → High)</option>
      <option value="price-rev">Price (High → Low)</option>
      <option value="category">Category</option>
    `;

    //reload on change.
    sortBox.addEventListener("change", () => {
      currentSort = sortBox.value;
      loadBrowseView();
    });

    sortBox.dataset.initialized = "true";
  }

  //keep dropwon showing the current sort state.
  sortBox.value = currentSort;
}

//build the filter list from dataset.
function buildFilterLists(products) {
  const genders = new Set();
  const categories = new Set();
  const sizes = new Set();
  const colors = new Set();

  //loop all products and get all possible filter vals
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

  return {
    genders: [...genders],
    categories: [...categories],
    sizes: [...sizes],
    colors: [...colors],
  };
}

//only use gender and category to get options for sizes and colors.
function filterByBase(products) {
  let result = [...products];

  if (activeFilters.gender.length > 0) {
    result = result.filter(p => activeFilters.gender.includes(p.gender));
  }

  if (activeFilters.category.length > 0) {
    result = result.filter(p => activeFilters.category.includes(p.category));
  }

  return result;
}

//group sizes by cat.
function buildCategorySizeMap(products) {
  const map = {};

  products.forEach(p => {
    if (!p.category) return;
    if (!Array.isArray(p.sizes)) return;
    if (!map[p.category]) map[p.category] = new Set();
    p.sizes.forEach(s => map[p.category].add(s));
  });

  //convert sets to normal arrays.
  Object.keys(map).forEach(cat => {
    map[cat] = [...map[cat]];
  });

  return map;
}

//render the filter list from buildFilterLists.
function renderFilters(allProducts) {
  const filterBox = document.getElementById("browse-filters");
  if (!filterBox) return;

  //full dataset options.
  const fullFilters = buildFilterLists(allProducts);

  //base filtered options - gender and cat applied.
  const filteredProducts = filterByBase(allProducts);
  const filteredFilters = buildFilterLists(filteredProducts);

  //size groups based on cats.
  const sizeGroups = buildCategorySizeMap(filteredProducts);

  //gender and cat always full but size and color dynamic.
  filterBox.innerHTML = `
    <h3 class="text-xl font-semibold mb-4 flex items-center justify-between">
      Filters
      <button id="clear-filters" class="text-sm text-blue-600 hover:underline">
        Clear All
      </button>
    </h3>

    ${collapsible("Gender", "gender", fullFilters.genders)}
    ${collapsible("Category", "category", fullFilters.categories)}
    ${groupedSizeSection(sizeGroups)}
    ${collapsible("Colors", "color", filteredFilters.colors)}
  `;

  //heckbox listeners for every filter option.
  filterBox.querySelectorAll(".filter-check").forEach(chk => {
    chk.addEventListener("change", () => {
      const type = chk.dataset.type;
      const value = chk.dataset.value;

      //toggle filter.
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
    Object.keys(activeFilters).forEach(k => activeFilters[k] = []);
    loadBrowseView();
  });

  //collapsable toggles.
  filterBox.querySelectorAll(".collapsible-header").forEach(header => {
    header.addEventListener("click", () => {
      header.nextElementSibling.classList.toggle("hidden");
    });
  });

  // sub-collapsible groups inside Sizes
  filterBox.querySelectorAll(".size-group-header").forEach(header => {
    header.addEventListener("click", () => {
      header.nextElementSibling.classList.toggle("hidden");
    });
  });
}

//big collapsible group with checkboxes.
function collapsible(label, type, values) {
  const selectedValues = activeFilters[type];

  return `
    <div class="mb-4 border">
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
            <span>${formatLabel(v)}</span>
          </label>`
          )
          .join("")}
      </div>
    </div>
  `;
}

//sizes grouped by cats.
function groupedSizeSection(sizeGroups) {
  return `
    <div class="mb-4 border">
      <button class="collapsible-header w-full text-left px-3 py-2 bg-gray-100 font-semibold">
        Sizes
      </button>

      <div class="collapsible-body px-3 py-2 space-y-3">

        ${Object.entries(sizeGroups).map(([groupName, sizes]) => `
          <div class="ml-4">
            <button class="size-group-header text-left w-full underline font-medium py-1">
              ${groupName} Sizes
            </button>

            <div class="size-group-body ml-4 space-y-1">
              ${sizes.map(size => `
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    class="filter-check"
                    data-type="size"
                    data-value="${groupName}:${size}"
                    ${activeFilters.size.includes(`${groupName}:${size}`) ? "checked" : ""}
                  >
                  <span>${size}</span>
                </label>
              `).join("")}
            </div>
          </div>
        `).join("")}

      </div>
    </div>
  `;
}

//rm size and color filters that depend on a bigger scope if the bigger scope is rm'd.
function cleanupDependentFilters(products) {
  const valid = buildFilterLists(products);

  activeFilters.size = activeFilters.size.filter(s => {
    const size = s.split(":")[1];
    return valid.sizes.includes(size);
  });

  activeFilters.color = activeFilters.color.filter(c =>
    valid.colors.includes(c)
  );
}

//helper func to create dropdown sections.
function dropdown(label, type, values) {
  const active = activeFilters[type];
  const highlight = active ? "bg-gray-200" : "";

  return `
    <div class="mb-4 p-2 ${highlight}">
      <p class="font-medium mb-1">${label}</p>
      <select class="filter-select w-full border px-2 py-1"
              data-type="${type}">
        <option value="">All ${label}</option>
        ${values
          .map(v => `<option value="${v}" ${active === v ? "selected" : ""}>${v}</option>`)
          .join("")}
      </select>
    </div>
  `;
}

//render browse with filters and sort.
function applyFiltersAndRender(products) {
  let filtered = [...products];

  //loop active filters and apply.
  Object.entries(activeFilters).forEach(([type, values]) => {
    if (!values || values.length === 0) return;

    filtered = filtered.filter(p => {
      if (type === "gender") return values.includes(p.gender);
      if (type === "category") return values.includes(p.category);
      if (type === "size") {
        return Array.isArray(p.sizes) && values.some(v => {
          const size = v.split(":")[1];
          return p.sizes.includes(size);
        });
      }
      if (type === "color") return Array.isArray(p.color) && values.some(v => p.color.some(c => c.name === v));
      return true;
    });
  });

  //sort logic.
  if (currentSort === "pop") {
    filtered.sort((a, b) => (b.sales?.total || 0) - (a.sales?.total || 0));
  }

  if (currentSort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (currentSort === "price") {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (currentSort === "price-rev") {
    filtered.sort((a, b) => b.price - a.price);
  }

  if (currentSort === "category") {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  //update the chips and grid.
  renderActiveFilters();
  renderProducts(filtered);
}

//render the current active filter chips.
function renderActiveFilters() {
  const box = document.getElementById("active-filters");
  if (!box) return;

  box.innerHTML = "";

  //loop active filters and draw chips
  Object.entries(activeFilters).forEach(([type, values]) => {
    if (!Array.isArray(values) || values.length === 0) return;

    //create one chip per selected value.
    values.forEach(value => {
      const chip = document.createElement("button");
      chip.className =
        "flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition";

      chip.innerHTML = `
        <span>${formatLabel(value)}</span>
        <span class="font-bold text-gray-600 hover:text-gray-900">×</span>
      `;

      chip.addEventListener("click", () => {
        //remove only this specific value.
        activeFilters[type] = activeFilters[type].filter(v => v !== value);
        loadBrowseView();
      });

      box.appendChild(chip);
    });
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
      "border shadow p-3 bg-white hover:shadow-md transition flex flex-col";

    //placeholder - if i have time might do something funny here lol
    const imgUrl = `https://placehold.co/600x800?text=${encodeURIComponent(p.name)}`;

    card.innerHTML = `
      <img src="${imgUrl}" class="w-full h-40 object-cover mb-3 cursor-pointer">
      <h3 class="font-semibold cursor-pointer">${p.name}</h3>
      <p class="text-gray-700 mb-3">$${p.price}</p>

      <button class="add-to-cart mt-auto bg-gray-900 text-white px-3 py-1 hover:bg-gray-700">
        Add to Cart
      </button>
    `;

    resultsBox.appendChild(card);
  });
}

