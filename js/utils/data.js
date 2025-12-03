//product data api url
const DATA_URL = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";

async function loadProducts() {
  
  //check if profucts are saved in local storage already.
  let cached = localStorage.getItem("products");

  //if it exists in cache then use that instead of fetching it again.
  if (cached) {
    return JSON.parse(cached);
  }
  
  //if no cache, fetch from api url
  const response = await fetch(DATA_URL);
  const data = await response.json();
  
  //store the downloaded data in local storage for next time.
  localStorage.setItem("products", JSON.stringify(data));
  return data;
}
