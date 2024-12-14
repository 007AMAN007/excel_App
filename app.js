const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const filterInput = document.getElementById("filterInput");
const dataTable = document.getElementById("dataTable");
const tableHead = dataTable.querySelector("thead");
const tableBody = dataTable.querySelector("tbody");
const loadingDiv = document.getElementById("loading");
const columnSelect = document.getElementById("columnSelect");
const countButton = document.getElementById("countButton");
const sumButton = document.getElementById("sumButton");
const calculationResult = document.getElementById("calculationResult");
const pasteArea = document.getElementById("pasteArea");
const pasteButton = document.getElementById("pasteButton");

let dataset = []; // Stores the original dataset
let filteredData = []; // Stores filtered data
let sortState = {}; // Stores sorting state for columns
let columnFilters = {}; // Store current filter values for each column

// Parse CSV data into a 2D array
// Parse CSV using a robust method to handle quoted values with commas or newlines
function parseCSV(data) {
  const rows = [];
  const lines = data.split("\n");

  lines.forEach((line) => {
    const row = [];
    let cell = "";
    let inQuotes = false;

    for (let char of line) {
      if (char === '"' && !inQuotes) {
        // Start of a quoted value
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        // End of a quoted value
        inQuotes = false;
      } else if (char === "," && !inQuotes) {
        // Add the cell to the row and reset
        row.push(cell.trim());
        cell = "";
      } else {
        // Append the character to the current cell
        cell += char;
      }
    }

    // Add the last cell to the row
    if (cell) row.push(cell.trim());

    // Only push non-empty rows
    if (row.length > 0) rows.push(row);
  });

  return rows;
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

// Handle XLSX file parsing
function parseXLSX(data) {
  const workbook = XLSX.read(data, { type: "binary" });
  const sheetName = workbook.SheetNames[0]; // Assume first sheet
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert to 2D array
}

// Handle file parsing
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const fileData = e.target.result;

    if (file.name.endsWith(".csv")) {
      dataset = parseCSV(fileData);
    } else if (file.name.endsWith(".xlsx")) {
      dataset = parseXLSX(fileData);
    }

    filteredData = dataset.slice(1);
    columnFilters = {};
    sortState = {};
    renderTable(dataset);
  };
  reader.readAsBinaryString(file);
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

// Populate the column selector
function populateColumnSelector(headers) {
  columnSelect.innerHTML = ""; // Clear existing options
  headers.forEach((header, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = header;
    columnSelect.appendChild(option);
  });
}

// Perform a calculation (count or sum) on a specific column
// Perform a calculation (count or sum) on a specific column
function calculateColumn(action) {
  const columnIndex = parseInt(columnSelect.value, 10);
  const columnData = filteredData
    .map((row) => row[columnIndex])
    .filter((value) => value !== "");

  if (action === "count") {
    calculationResult.textContent = `Count: ${columnData.length}`;
  } else if (action === "sum") {
    // Check if all values in the column are numeric
    const nonNumericValue = columnData.find((value) =>
      isNaN(parseFloat(value))
    );
    if (nonNumericValue) {
      calculationResult.textContent =
        "Error: Column contains non-numeric value(s), cannot calculate sum.";
      return; // Exit if a non-numeric value is found
    }

    // Proceed to calculate sum if all values are numeric
    const numericData = columnData.map((value) => parseFloat(value));
    const sum = numericData.reduce((total, num) => total + num, 0);
    calculationResult.textContent = `Sum: ${sum}`;
  }
}

// Event listeners for calculation buttons
countButton.addEventListener("click", () => calculateColumn("count"));
sumButton.addEventListener("click", () => calculateColumn("sum"));

// Update column selector and reset calculations when new data is rendered
function updateCalculations(headers) {
  populateColumnSelector(headers);
  calculationResult.textContent = ""; // Reset result display
}

// Modify the renderTable function to include calculation updates
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

  // Update calculations
  updateCalculations(headers);
}

// Parse pasted data into a 2D array
function parseData(data) {
  return data
    .trim()
    .split("\n")
    .map(row => row.split("\t"));
}

// Parse and render pasted data
pasteButton.addEventListener("click", () => {
  const pastedData = pasteArea.value;
  if (pastedData.trim()) {
    dataset = parseData(pastedData);
    filteredData = dataset.slice(1);
    columnFilters = {};
    sortState = {};
    renderTable(dataset);
  } else {
    alert("Please paste valid data in the textarea.");
  }
});
