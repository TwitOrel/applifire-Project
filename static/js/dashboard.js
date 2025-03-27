let existingSerialNumbers = [];
// ========================
// handle with login by google
// ========================

// ========================
// Load, update and render user profile
// ========================
let messageTimer = null;

function showMessage(message, isError = false) {
  const modal = document.getElementById("message-modal");
  const overlay = document.getElementById("message-overlay");
  const text = document.getElementById("message-text");

  text.textContent = message;

  modal.classList.remove("hidden", "error", "success");
  overlay.classList.remove("hidden");

  modal.classList.add(isError ? "error" : "success");

  // נקה טיימר קודם אם קיים
  if (messageTimer) clearTimeout(messageTimer);

  // סגירה אוטומטית אחרי 3 שניות
  messageTimer = setTimeout(() => {
    closeMessageModal();
  }, 3000);
}

function closeMessageModal() {
  const modal = document.getElementById("message-modal");
  const overlay = document.getElementById("message-overlay");

  modal.classList.add("hidden");
  overlay.classList.add("hidden");

  // נקה טיימר אם המשתמש לחץ על כפתור
  if (messageTimer) {
    clearTimeout(messageTimer);
    messageTimer = null;
  }
}


function showUserProfile() {
  const token = localStorage.getItem("access");

  fetch("/api/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => renderProfile(data))
    .catch((err) => {
      console.error("Failed to fetch profile", err);
      alert("Unable to load profile");
    });
}

function renderProfile(profile) {
  const container = document.getElementById("profile-view");

  const immutableKeys = ["username", "guid", "email", "api-key"];

  const immutableHTML = Object.entries(profile)
    .filter(([key]) => immutableKeys.includes(key))
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `
        <div class="device-pair">
          <span class="label">${label}:</span>
          <span class="value">${value || "-"}</span>
        </div>
      `;
    })
    .join("");

  const editableHTML = Object.entries(profile)
    .filter(([key]) => !immutableKeys.includes(key))
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `
        <div class="device-pair">
          <span class="label">${label}:</span>
          <input type="text" id="profile-${key}" value="${value || ""}" class="editable-field" />
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <section class="profile-details-section">
      <h2 class="device-title">Profile Overview</h2>

      <div class="immutable-fields">
        ${immutableHTML}
      </div>

      <div class="editable-fields">
        ${editableHTML}
      </div>

      <div class="device-actions">
        <div class="left-actions">
          <button id="back-to-devices-btn" class="primary-btn">← Back to device list</button>
          <button id="update-profile-btn" class="primary-btn">Update Profile</button>
        </div>
      </div>
    </section>
  `;

  // הסתרת מכשירים והצגת פרופיל
  document.getElementById("devices-section").classList.add("hidden");
  document.getElementById("profile-section").classList.remove("hidden");

  // אירועים
  document.getElementById("back-to-devices-btn").addEventListener("click", showDevices);
  document.getElementById("update-profile-btn").addEventListener("click", updateProfile);
}


function updateProfile() {
  const token = localStorage.getItem("access");

  const editableFields = Array.from(
    document.querySelectorAll("#profile-view .editable-field")
  );

  const updatedData = {};
  editableFields.forEach((input) => {
    const key = input.id.replace("profile-", "");
    updatedData[key] = input.value.trim();
  });

  fetch("/api/profile/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    })
    .then(() => {
      showMessage("Profile updated successfully!");
    })
    .catch((err) => {
      console.error("Error updating profile:", err);
      showMessage("Failed to update profile.", true);
    });
}



function showDevices() {
  document.getElementById("profile-section").classList.add("hidden");
  document.getElementById("devices-section").classList.remove("hidden");
}

// ========================
// when clicking on account profile
// ========================
const profileLink = document.querySelector("#userDropdown a[href='/profile/']");
profileLink.addEventListener("click", (e) => {
  e.preventDefault();
  showUserProfile();
});


// ========================
// for open and close triger
// ========================
const trigger = document.getElementById("userTrigger");
const dropdown = document.getElementById("userDropdown");
const arrow = trigger.querySelector(".arrow");

// Toggle dropdown on trigger click
trigger.addEventListener("click", (e) => {
  e.stopPropagation(); // שלא יפעיל את ה-close כשנלחץ בפנים
  const isOpen = dropdown.style.display === "flex";

  dropdown.style.display = isOpen ? "none" : "flex";
  arrow.classList.toggle("open", !isOpen);
});

// Close dropdown if clicked outside
document.addEventListener("click", (e) => {
  if (!trigger.contains(e.target)) {
    dropdown.style.display = "none";
    arrow.classList.remove("open");
  }
});


// ========================
// set user name on deshboard
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access");
  if (!token) return;

  fetch("/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    })
    .then((data) => {
      const username = data.username || "User";
      document.getElementById("usernameDisplay").textContent = username;
      document.getElementById("userInitial").textContent = username[0].toUpperCase();
    })
    .catch((err) => {
      console.error("Error fetching user profile:", err);
      document.getElementById("usernameDisplay").textContent = "Guest";
      document.getElementById("userInitial").textContent = "?";
    });
});


// ========================
// User Dropdown + Logout
// ========================
document.addEventListener("DOMContentLoaded", () => {
    const userTrigger = document.getElementById("userTrigger");
    const dropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");
    const arrow = document.querySelector(".arrow");
  
    if (userTrigger && dropdown && logoutBtn && arrow) {
      userTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains("show");
        dropdown.classList.toggle("show", !isOpen);
        arrow.textContent = isOpen ? "▾" : "▴";
      });
  
      document.addEventListener("click", (e) => {
        if (!userTrigger.contains(e.target)) {
          dropdown.classList.remove("show");
          arrow.textContent = "▾";
        }
      });
  
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/";
      });
    }
  
    // ========================
    // Move Sidebar Navigation to Top
    // ========================
    const nav = document.querySelector(".sidebar nav");
    const logo = document.querySelector(".sidebar .logo");
    const userSection = document.querySelector(".sidebar .user-section");
  
    if (nav && logo && userSection) {
      const sidebar = document.querySelector(".sidebar");
      sidebar.insertBefore(nav, userSection);
    }
  
    // ========================
    // Fetch and Render Devices
    // ========================
    fetchDevices();
  });
  
  function fetchDevices() {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login/";
      return;
    }
  
    fetch("/api/devices/", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load devices");
        return res.json();
      })
      .then((devices) => {
        existingSerialNumbers = devices.map((device) => device.serial_number); // keep the sireal numbers(when try to add device confirm no exist serial number twice)
        renderDeviceList(devices);
      })
      .catch((err) => {
        console.error("Error loading devices:", err);
      });
  }
  
  function renderDeviceList(devices) {
    const container = document.getElementById("device-view");
    container.innerHTML = "";
  
    if (devices.length > 0) {
      const headerRow = document.createElement("div");
      headerRow.classList.add("table-row", "table-header");
  
      Object.keys(devices[0]).forEach((key) => {
        if (key === "guid" || key === "user") return;
        const headerCol = document.createElement("div");
        headerCol.classList.add("col");
        headerCol.textContent = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        headerRow.appendChild(headerCol);
      });
  
      container.appendChild(headerRow);
    }
  
    devices.forEach((device) => {
      const row = document.createElement("div");
      row.classList.add("table-row");
  
      row.addEventListener("click", () => {
        renderDeviceDetails(device);
      });
  
      Object.entries(device).forEach(([key, value]) => {
        if (key === "guid" || key === "user") return;
        const col = document.createElement("div");
        col.classList.add("col");
        col.textContent = value;
        row.appendChild(col);
      });
  
      container.appendChild(row);
    });
}

function renderDeviceDetails(device) {
  const container = document.getElementById("device-view");

  const immutableFields = ['serial_number', 'guid', 'user'];

  // יצירת רשימה של השדות הקבועים
  const immutableHTML = Object.entries(device)
    .filter(([key]) => immutableFields.includes(key))
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `
        <div class="device-pair">
          <span class="label">${label}:</span>
          <span class="value">${value}</span>
        </div>
      `;
    })
    .join("");

  // יצירת רשימה של השדות הניתנים לשינוי
  const editableHTML = Object.entries(device)
    .filter(([key]) => !immutableFields.includes(key))
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `
        <div class="device-pair">
          <span class="label">${label}:</span>
          <input type="text" value="${value}" id="${key}" class="editable-field"/>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="device-details-section">
      <h2 class="device-title">Device Overview</h2>
      <div class="immutable-fields">
        ${immutableHTML}
      </div>
      <div class="editable-fields">
        ${editableHTML}
      </div>
      <div class="device-actions">
        <div class="left-actions">
          <button id="back-btn" class="primary-btn">← Back to device list</button>
          <button id="update-btn" class="primary-btn">Update Device</button>
          <button id="delete-btn" class="delete-btn">Delete Device</button>
        </div>
      </div>
    </div>
    <div id="confirm-modal" class="modal hidden">
      <div class="modal-content">
        <p>Are you sure you want to delete this device?</p>
        <div class="modal-buttons">
          <button id="confirm-delete" class="delete-btn">Yes, Delete</button>
          <button id="cancel-delete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
    <div id="overlay" class="overlay hidden"></div>
  `;

  // מאזינים לכפתורים
  document.getElementById("back-btn").addEventListener("click", fetchDevices);
  document.getElementById("update-btn").addEventListener("click", function() {updateDevice(device.serial_number);});
  document.getElementById("delete-btn").addEventListener("click", function() {deleteDevice(device.serial_number);});
}

function updateDevice(serial_number) {
  const model = document.getElementById("model").value;
  const softwareVersion = document.getElementById("software_version").value;

  const updatedData = {
      model: model,
      software_version: softwareVersion,
  };

  const token = localStorage.getItem('access'); // אם אתה שומר את הטוקן ב-LocalStorage

  // לשלוח את הבקשה לעדכון המכשיר
  fetch(`/api/devices/${serial_number}/update/`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // הוספת הטוקן לבקשה
      },
      body: JSON.stringify(updatedData),
  })
  .then(response => response.json())
  .then(data => {
      console.log('Device updated:', data);
      fetchDevices()
  })
  .catch(error => {
      console.error('Error updating device:', error);
      alert("Error updating device.");
  });
}

function deleteDevice(serialNumber) {
  // הצגת המודל
  document.getElementById('confirm-modal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');

  // אישור מחיקה
  document.getElementById('confirm-delete').onclick = function () {
    fetch(`/api/devices/${serialNumber}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`,
      },
    })
      .then(response => {
        if (response.ok) {
          fetchDevices();
        } else {
          alert("Failed to delete device.");
        }
      })
      .catch(error => {
        console.error("Error deleting device:", error);
        alert("Error deleting device.");
      })
      .finally(() => {
        closeModal();
      });
  };

  // ביטול מחיקה
  document.getElementById('cancel-delete').onclick = function () {
    closeModal();
  };
}

function closeModal() {
  document.getElementById('confirm-modal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}


// for the modal add device 
document.getElementById("add-device-btn").addEventListener("click", () => {
  document.getElementById("add-device-modal").classList.remove("hidden");
  document.getElementById("overlay").classList.remove("hidden");
});

document.getElementById("cancel-add-device").addEventListener("click", () => {
  closeAddDeviceModal();
});

function closeAddDeviceModal() {
  document.getElementById("add-device-modal").classList.add("hidden");
  document.getElementById("overlay").classList.add("hidden");
}

document.getElementById("submit-add-device").addEventListener("click", () => {
  const serialNumber = document.getElementById("new-serial-number").value.trim();
  const model = document.getElementById("new-model").value.trim();
  const softwareVersion = document.getElementById("new-software-version").value.trim();
  const errorMsg = document.getElementById("add-error-message");
  const token = localStorage.getItem("access");

  // נקה הודעת שגיאה קודמת
  errorMsg.textContent = "";
  errorMsg.classList.add("hidden");

  // בדיקות שדות ריקים לפי סדר
  if (!serialNumber) {
    errorMsg.textContent = "Serial Number is required.";
    errorMsg.classList.remove("hidden");
    return;
  }

  if (!model) {
    errorMsg.textContent = "Model is required.";
    errorMsg.classList.remove("hidden");
    return;
  }

  if (!softwareVersion) {
    errorMsg.textContent = "Software Version is required.";
    errorMsg.classList.remove("hidden");
    return;
  }

  // בדיקה מקומית אם המספר קיים
  if (existingSerialNumbers.includes(serialNumber)) {
    errorMsg.textContent = `A device with this Serial Number ${serialNumber} already exists.`;
    errorMsg.classList.remove("hidden");
    return; // עצור – לא נבצע fetch
  }

  // המשך לשליחה
  fetch("/api/devices/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      serial_number: serialNumber,
      model: model,
      software_version: softwareVersion,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to create device");
      return res.json();
    })
    .then((data) => {
      closeAddDeviceModal();
      fetchDevices(); // רענון הטבלה
    })
    .catch((err) => {
      console.error(err);
      errorMsg.textContent = "Failed to create device.";
      errorMsg.classList.remove("hidden");
    });
});

