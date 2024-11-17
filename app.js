const pasteArea = document.getElementById("pasteArea");
const loadDataButton = document.getElementById("loadData");
const filterInput = document.getElementById("filterInput");
const dataTable = document.getElementById("dataTable");
const tableHead = dataTable.querySelector("thead");
const tableBody = dataTable.querySelector("tbody");
const loadingDiv = document.getElementById("loading");

let dataset = []; // Stores the original dataset
let filteredData = []; // Stores filtered data
let sortState = {}; // Stores sorting state for columns

// Parse pasted data into a 2D array
function parseData(data) {
  return data
    .trim()
    .split("\n")
    .map((row) => row.split("\t"));
}

// Show loading spinner
function showLoading() {
  loadingDiv.style.display = "block";
}

// Hide loading spinner
function hideLoading() {
  loadingDiv.style.display = "none";
}

// Render the dataset into a table
function renderTable(data) {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (data.length === 0) return;

  // Render headers
  const headers = data[0];
  const headerRow = document.createElement("tr");
  headers.forEach((header, index) => {
    const th = document.createElement("th");
    th.textContent = header;
    th.dataset.index = index;

    // Add sorting functionality
    th.addEventListener("click", () => sortTable(index));

    // Add sort icon
    const icon = document.createElement("span");
    icon.classList.add("sort-icon");
    icon.textContent =
      sortState[index] === "asc"
        ? "▲"
        : sortState[index] === "desc"
        ? "▼"
        : "⇅";
    th.appendChild(icon);

    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  // Render body rows
  data.slice(1).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// Sort table by column
function sortTable(columnIndex) {
  // Reset sort state for all columns except the current one
  Object.keys(sortState).forEach((index) => {
    if (index != columnIndex) {
      sortState[index] = null; // Reset sorting state
    }
  });

  // Toggle sort direction for the clicked column
  sortState[columnIndex] = sortState[columnIndex] === "asc" ? "desc" : "asc";

  const direction = sortState[columnIndex] === "asc" ? 1 : -1;

  showLoading();

  setTimeout(() => {
    filteredData.sort((a, b) => {
      let valA = a[columnIndex] || ""; // Default to empty string if undefined
      let valB = b[columnIndex] || ""; // Default to empty string if undefined

      // Handle numeric and string sorting
      if (!isNaN(valA) && !isNaN(valB)) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
        return (valA - valB) * direction;
      }
      return valA.toString().localeCompare(valB.toString()) * direction;
    });

    renderTable([dataset[0], ...filteredData]);
    hideLoading();
  }, 200); // Simulate loading time
}

// Filter table by input
function filterTable(query) {
  filteredData = dataset
    .slice(1)
    .filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(query.toLowerCase()))
    );
  renderTable([dataset[0], ...filteredData]);
}

// Event listeners
loadDataButton.addEventListener("click", () => {
  showLoading();

  setTimeout(() => {
    dataset = parseData(pasteArea.value);
    filteredData = dataset.slice(1); // Exclude headers for filtering
    sortState = {}; // Reset sort state
    renderTable(dataset);
    hideLoading();
  }, 200); // Simulate loading time
});

filterInput.addEventListener("input", (e) => {
  filterTable(e.target.value);
});
