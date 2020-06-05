let transactions = [];
let myChart;

fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    // Table columns on each table row
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;
    // Append the table row to the table
    tbody.appendChild(tr);
  });
}

function populateChart() {
  // Copy transactions array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // Create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // Create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // Remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  // Chart creation
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Over Time",
          fill: true,
          backgroundColor: "#d37753",
          data
        }
      ]
    }
  });
}

//============================================================================
function sendTransaction(isAdding) {
  // Transaction Name
  let nameEl = document.querySelector("#t-name");
  // Transaction Amount
  let amountEl = document.querySelector("#t-amount");
  // Error Element
  let errorEl = document.querySelector(".form .error");

  // Validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Transaction Information";
    return;
  } else {
    errorEl.textContent = "";
  }

  // Create transaction record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString() //toISOString() method returns a string in simplified extended ISO format
  };

  // If subtracting funds (not adding), convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // Add transaction to the beginning of the current array of data
  transactions.unshift(transaction);

  // Re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // Also send post request to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      } else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";
      }
    })
    .catch(err => {
      // Fetch failed, so save in indexed db
      console.log("Transaction", transaction);
      saveRecord(transaction);

      // Clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}

document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};
