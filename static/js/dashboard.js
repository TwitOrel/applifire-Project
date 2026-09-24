let existingSerialNumbers = [];
let messageTimer = null;
const immutableKeys = ["username", "guid", "email", "api-key"];


// ========================
// handle the navbar
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".navbar-item");
  const sections = document.querySelectorAll("div[id$='section'], section[id$='section']");

  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      sections.forEach(sec => sec.classList.add("hidden"));

      const targetId = item.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.remove("hidden");

      if (targetId === "profile-section") {
        showUserProfile();
      }
    });
  });
});

// used for mark and render the choosec section
function switchToSection(targetId) {
  const navbarItems = document.querySelectorAll(".navbar-item");
  const sections = document.querySelectorAll("div[id$='section'], section[id$='section']");

  sections.forEach(sec => sec.classList.add("hidden"));

  // show the choosev section
  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.remove("hidden");
  }

  // mark the choosen
  navbarItems.forEach(item => {
    const itemTarget = item.getAttribute("data-target");
    item.classList.toggle("active", itemTarget === targetId);
  });
    // for the specific needed
  if (targetId === "devices-section") {
    fetchDevices();
  } else if (targetId === "profile-section") {
    showUserProfile();
  }
  else if (targetId === "edit-profile-section") {
    fillEditProfileForm();
    navbarItems.forEach(item => {
      const itemTarget = item.getAttribute("data-target");
      item.classList.toggle("active", itemTarget === "profile-section"); // שים לב: זה עדיין profile-section
    });
    //here
  }
}

async function fillEditProfileForm() {
  try {
    const res = await fetch("/api/profile/", {
      headers: {
        Authorization: "Bearer " + getAccessToken(),
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch profile data");
    }

    const profile = await res.json();

    // עדכון מפתח API
    const apiKeySpan = document.querySelector("#edit-profile-section span");
    if (apiKeySpan) {
      apiKeySpan.textContent = profile["api-key"] || "N/A";
    }

    // איפוס שדות סיסמה
    const passInputs = document.querySelectorAll("#edit-profile-section input[type='password']");
    passInputs.forEach(input => input.value = "");

    // שדות ניתנים לעריכה

    const editableHTML = Object.entries(profile)
      .filter(([key]) => !immutableKeys.includes(key) && key !== "has_password")
      .map(([key, value]) => {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return `
          <div class="form-row">
            <span class="label">${label}:</span>
            <div class="dual-input">
              <span class="readonly-value">${value || "-"}</span>
              <input type="text" id="edit-user-${key}" placeholder="${label.toLowerCase()}" />
            </div>
          </div>
        `;
      })
      .join("");
    
    document.getElementById("editable-user-fields").innerHTML = editableHTML;

    const hasPassword = profile.has_password;
    const currentPwdGroup = document.getElementById('current-password-group');
    const passwordHint = document.getElementById('set-password-hint');

    if (currentPwdGroup && passwordHint) {
      if (hasPassword) {
        currentPwdGroup.classList.remove('hidden');
        passwordHint.classList.add('hidden');
      } else {
        currentPwdGroup.classList.add('hidden');
        passwordHint.classList.remove('hidden');
      }
    }

// שמירה גלובלית לשימוש בכפתור save
    window.userHasPassword = hasPassword;

  } catch (err) {
    console.error(err);
    alert("error with loading user details");

  }
}

function getAccessToken() {
  return localStorage.getItem("access") || sessionStorage.getItem("access");
}


function showMessage(message, isError = false) {
  const modal = document.getElementById("message-modal");
  const overlay = document.getElementById("message-overlay");
  const text = document.getElementById("message-text");

  text.textContent = message;

  modal.classList.remove("hidden", "error", "success");
  overlay.classList.remove("hidden");

  modal.classList.add(isError ? "error" : "success");

  if (messageTimer) clearTimeout(messageTimer);

  messageTimer = setTimeout(() => {
    closeMessageModal();
  }, 5000);
}

function closeMessageModal() {
  const modal = document.getElementById("message-modal");
  const overlay = document.getElementById("message-overlay");

  modal.classList.add("hidden");
  overlay.classList.add("hidden");

  if (messageTimer) {
    clearTimeout(messageTimer);
    messageTimer = null;
  }
}


function showUserProfile() {
  const token = getAccessToken();

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

async function generateApiKey() {
  const token = getAccessToken();
  try {
    const response = await fetch("/api/api-key/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to generate API key");
    switchToSection("profile-section")
    showMessage("API Key generated successfully!");
  } catch (err) {
    console.error(err);
    showMessage("Failed to generate API Key.", true);
  }
}

async function generateApiKeyForEdit() {
  const token = getAccessToken();
  try {
    const response = await fetch("/api/api-key/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to generate API key");

    showMessage("API Key generated successfully!");
    switchToSection("edit-profile-section")
  } catch (err) {
    console.error(err);
    showMessage("Failed to generate API Key.", true);
  }
}

async function deleteApiKey() {
  const token = getAccessToken();
  try {
    const response = await fetch("/api/api-key/", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to delete API key");
    switchToSection("profile-section")

    showMessage("API Key deleted successfully!");
  } catch (err) {
    console.error(err);
    showMessage("Failed to delete API Key.", true);
  }
}


async function deleteApiKeyForEdit() {
  const token = getAccessToken();
  try {
    const response = await fetch("/api/api-key/", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to delete API key");

    showMessage("API Key deleted successfully!");
    switchToSection("edit-profile-section")
  } catch (err) {
    console.error(err);
    showMessage("Failed to delete API Key.", true);
  }
}

async function saveChangesForEdit() {
  const token = getAccessToken();

  let passwordChanged = false;
  let passwordError = null;
  let changed = false;

  // step 1: change/set password
  const currentPassword = document.getElementById("current-password")?.value || "";
  const newPassword = document.getElementById("new-password")?.value || "";
  const repeatPassword = document.getElementById("repeat-password")?.value || "";

  if (newPassword || currentPassword || repeatPassword) {
    if (!newPassword || !repeatPassword || (window.userHasPassword && !currentPassword)) {
      showMessage("Please fill in all password fields.", true);
      return;
    }

    if (newPassword !== repeatPassword) {
      showMessage("New passwords do not match.", true);
      return;
    }

    try {
      const payload = {
        new_password: newPassword,
      };

      // רק אם למשתמש יש סיסמה קיימת נשלח גם את current
      if (window.userHasPassword) {
        payload.current_password = currentPassword;
      }

      const res = await fetch("/api/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        passwordError = data?.error || "Failed to update password.";
        showMessage(passwordError, true);
      } else {
        passwordChanged = true;
        changed = true
        showMessage(data.message || "Password updated successfully!");
      }

    } 
    catch (err) {
      console.error(err);
      passwordError = "Error updating password.";
      showMessage(passwordError, true);
    }
  }

  // step 2: update editable fields
  const editableFields = document.querySelectorAll("#editable-user-fields input");
  const payload = {};
  
  editableFields.forEach(input => {
    const key = input.id.replace("edit-user-", "");
    const newValue = input.value.trim();
  
    if (newValue) {
      payload[key] = newValue;
      changed = true;
    }
  });
  
  if (!changed) {
    showMessage("No given changes to save.");
    switchToSection("profile-section");
    return;
  }
  
  try {
    const res = await fetch("/api/profile/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) throw new Error("Failed to update profile");
  
    showMessage("Profile updated successfully!");
    switchToSection("profile-section");
  
  } catch (err) {
    console.error(err);
    showMessage("Error updating profile.", true);
  }
  

  // אם הייתה שגיאת סיסמה – נציג אותה אחרי עדכון הפרופיל
  if (passwordError) {
    showMessage(passwordError, true);
  }
}



function renderProfile(profile) {
  const container = document.getElementById("profile-view");

  const allFieldsHTML = Object.entries(profile)
    .filter(([key]) => key !== "has_password")
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

  container.innerHTML = `
    <section class="profile-details-section">

      <div class="profile-header">
        <h2 class="device-title">Profile Overview</h2>
        <button id="edit-profile-btn" class="primary-btn edit-profile-btn">✏️ Edit</button>
      </div>

      <div class="all-fields">
        ${allFieldsHTML}
      </div>

      <div class="device-actions">
        <div class="left-actions">
          <button id="back-to-devices-btn" class="primary-btn" data-target="devices-section">← Back to device list</button>
        </div>
      </div>
    </section>
  `;
  
  // <button id="update-profile-btn" class="primary-btn">Update Profile</button>
  // <button id="generate-api-key" class="primary-btn">🔄 Generate</button>
  // <button id="delete-api-key" class="primary-btn delete-btn">🗑️ Delete</button>
  document.getElementById("back-to-devices-btn")?.addEventListener("click", () => {switchToSection("devices-section");});
    document.getElementById("edit-profile-btn").addEventListener("click", () => {switchToSection("edit-profile-section");})
  // document.getElementById("update-profile-btn")?.addEventListener("click", updateProfile);
  // document.getElementById("generate-api-key")?.addEventListener("click", generateApiKey);
  // document.getElementById("delete-api-key")?.addEventListener("click", deleteApiKey);
}

// update profil user
function updateProfile() {
  const token = getAccessToken();

  const editableFields = Array.from(
    document.querySelectorAll("#profile-view .editable-field")
  );

  const updatedData = {};
  let emptyField = null;

  editableFields.forEach((input) => {
    const key = input.id.replace("profile-", "");
    const value = input.value.trim();

    if (!value && !emptyField) {
      emptyField = key;
    }

    updatedData[key] = value;
  });

  if (emptyField) {
    const fieldLabel = emptyField.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    showMessage(`Field "${fieldLabel}" cannot be empty.`, true);
    return;
  }

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


// ========================
// when clicking on account profile
// ========================
const profileLink = document.querySelector("#userDropdown a[href='/profile/']");
profileLink.addEventListener("click", (e) => {
  e.preventDefault();
  switchToSection("profile-section");
});


// ========================
// for open and close triger
// ========================
const trigger = document.getElementById("userTrigger");
const dropdown = document.getElementById("userDropdown");
const arrow = trigger.querySelector(".arrow");

// Toggle dropdown on trigger click
trigger.addEventListener("click", (e) => {
  e.stopPropagation(); 
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
  const token = getAccessToken();
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
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      });      
    }
  
    // ========================
    // Move navbar Navigation to Top
    // ========================
    const nav = document.querySelector(".navbar nav");
    const logo = document.querySelector(".navbar .logo");
    const userSection = document.querySelector(".navbar .user-section");
  
    if (nav && logo && userSection) {
      const navbar = document.querySelector(".navbar");
      navbar.insertBefore(nav, userSection);
    }
  
    fetchDevices();
  });

  // to show the devices
function fetchDevices() {
    const token = getAccessToken();
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

// to show the devices list
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

// to show details on device
function renderDeviceDetails(device) {
  const container = document.getElementById("device-view");

  const immutableFields = ['serial_number', 'guid', 'user'];

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
          <button id="back-to-devices-btn" class="primary-btn-device" data-target="devices-section">← Back to device list</button>
          <button id="update-btn" class="primary-btn-device">Update Device</button>
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

  document.getElementById("back-to-devices-btn").addEventListener("click", () => {switchToSection("devices-section");});  

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

  const token = getAccessToken();

  fetch(`/api/devices/${serial_number}/update/`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
  document.getElementById('confirm-modal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');

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

  // cancell delete
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
// jumping if there is problem
function closeAddDeviceModal() {
  document.getElementById("add-device-modal").classList.add("hidden");
  document.getElementById("overlay").classList.add("hidden");
}

// handle adding device list
document.getElementById("submit-add-device").addEventListener("click", () => {
  const serialNumber = document.getElementById("new-serial-number").value.trim();
  const model = document.getElementById("new-model").value.trim();
  const softwareVersion = document.getElementById("new-software-version").value.trim();
  const errorMsg = document.getElementById("add-error-message");
  const token = getAccessToken();

  errorMsg.textContent = "";
  errorMsg.classList.add("hidden");

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

  if (existingSerialNumbers.includes(serialNumber)) {
    errorMsg.textContent = `A device with this Serial Number ${serialNumber} already exists.`;
    errorMsg.classList.remove("hidden");
    return;
  }

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
      fetchDevices(); 
    })
    .catch((err) => {
      console.error(err);
      errorMsg.textContent = "Failed to create device.";
      errorMsg.classList.remove("hidden");
    });
});