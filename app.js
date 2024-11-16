const pasteArea = document.getElementById("pasteArea");
const loadDataButton = document.getElementById("loadData");
const filterInput = document.getElementById("filterInput");
const dataTable = document.getElementById("dataTable");
const tableHead = dataTable.querySelector("thead");
const tableBody = dataTable.querySelector("tbody");

let dataset = []; // Stores the original dataset
let filteredData = []; // Stores filtered data

// Parse pasted data into a 2D array
function parseData(data) {
  return data
    .trim()
    .split("\n")
    .map((row) => row.split("\t"));
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
  filteredData.sort((a, b) => {
    const valA = a[columnIndex];
    const valB = b[columnIndex];
    return valA.localeCompare(valB, undefined, { numeric: true });
  });
  renderTable([dataset[0], ...filteredData]);
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
  dataset = parseData(pasteArea.value);
  filteredData = dataset.slice(1); // Exclude headers for filtering
  renderTable(dataset);
});

filterInput.addEventListener("input", (e) => {
  filterTable(e.target.value);
});
