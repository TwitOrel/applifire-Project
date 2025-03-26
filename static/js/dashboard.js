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
        renderDeviceList(devices);
        document.getElementById("last-updated").textContent = new Date().toLocaleTimeString();
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
  
    const detailsHTML = Object.entries(device)
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
  
    container.innerHTML = `
      <div class="device-details-section">
        <h2 class="device-title">Device Overview</h2>
        ${detailsHTML}
        <button id="back-btn">← Back to device list</button>
      </div>
    `;
  
    document.getElementById("back-btn").addEventListener("click", fetchDevices);
}
  