let db;

// Create a new db request for a "budget" database.
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;

  // Create object store called "pending" and set autoIncrement to true
  db.createObjectStore("pending", {
    autoIncrement: true
  });
};

// If the application is online check the database for pending transactions
request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

// If there is an error on the request console log the error code
request.onerror = function(event) {
  // log error here
  console.log("There was an error" + event.target.errorCode);
};

function saveRecord(record) {
  console.log("RECORD", record);
  // create a transaction on the pending db with read/write access
  const transaction = db.transaction(["pending"], "readwrite");

  // Access your pending object store
  const pendingRecord = transaction.objectStore("pending");

  // Add record to your store with add method.
  pendingRecord.add(record);
}

function checkDatabase() {
  // Open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");

  // Access your pending object store
  const pendingRecord = transaction.objectStore("pending");

  // Get all records from store and set to a variable
  const getAll = pendingRecord.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");
          // access your pending object store
          const pendingRecord = transaction.objectStore("pending");
          // clear all items in your store
          pendingRecord.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
