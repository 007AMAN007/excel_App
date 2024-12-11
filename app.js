const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const filterInput = document.getElementById("filterInput");
const dataTable = document.getElementById("dataTable");
const tableHead = dataTable.querySelector("thead");
const tableBody = dataTable.querySelector("tbody");
const loadingDiv = document.getElementById("loading");

let dataset = []; // Stores the original dataset
let filteredData = []; // Stores filtered data
let sortState = {}; // Stores sorting state for columns
let columnFilters = {}; // Store current filter values for each column

// Parse CSV data into a 2D array
function parseCSV(data) {
  return data
    .trim()
    .split("\n")
    .map((row) => row.split(","));
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

  const headers = data[0];

  // Create header row with sorting functionality
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

  // Add filter row
  const filterRow = document.createElement("tr");
  headers.forEach((_, index) => {
    const filterCell = document.createElement("th");
    const filterInput = document.createElement("input");
    filterInput.type = "text";
    filterInput.placeholder = "Filter...";
    filterInput.dataset.index = index;

    // Restore existing filter value for the column
    filterInput.value = columnFilters[index] || "";

    // Add event listener for filtering
    filterInput.addEventListener("input", (e) => {
      columnFilters[index] = e.target.value; // Save the filter value
      filterByColumn(index, e.target.value);
    });

    filterCell.appendChild(filterInput);
    filterRow.appendChild(filterCell);
  });
  tableHead.appendChild(filterRow);

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
  Object.keys(sortState).forEach((index) => {
    if (index != columnIndex) {
      sortState[index] = null;
    }
  });

  sortState[columnIndex] = sortState[columnIndex] === "asc" ? "desc" : "asc";
  const direction = sortState[columnIndex] === "asc" ? 1 : -1;

  showLoading();

  setTimeout(() => {
    filteredData.sort((a, b) => {
      let valA = a[columnIndex] || "";
      let valB = b[columnIndex] || "";

      if (!isNaN(valA) && !isNaN(valB)) {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
        return (valA - valB) * direction;
      }
      return valA.toString().localeCompare(valB.toString()) * direction;
    });

    renderTable([dataset[0], ...filteredData]);
    hideLoading();
  }, 200);
}

// Filter table globally
function filterTable(query) {
  filteredData = dataset
    .slice(1)
    .filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(query.toLowerCase()))
    );
  renderTable([dataset[0], ...filteredData]);
}

// Filter by column with value
function filterByColumn(columnIndex, query) {
  filteredData = dataset
    .slice(1)
    .filter(
      (row) =>
        row[columnIndex] &&
        row[columnIndex].toLowerCase().includes(query.toLowerCase())
    );
  renderTable([dataset[0], ...filteredData]);
}

// Handle file parsing
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    dataset = parseCSV(e.target.result);
    filteredData = dataset.slice(1); // Exclude headers
    columnFilters = {};
    sortState = {};
    renderTable(dataset);
  };
  reader.readAsText(file);
}

// Drag-and-drop functionality
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "text/csv") {
    handleFile(file);
  } else {
    alert("Please drop a valid CSV file.");
  }
});

// Handle file input change
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) handleFile(file);
});

// Global filter
filterInput.addEventListener("input", (e) => {
  filterTable(e.target.value);
});
