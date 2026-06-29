const STORAGE_KEY = "charmsbybee_subscribers";
let allData = [];
let deletingId = null;

document.addEventListener("DOMContentLoaded", function () {
    loadData();

    // pencarian
    document.getElementById("searchInput").addEventListener("input", function () {
        const q = this.value.toLowerCase().trim();
        const filtered = allData.filter(s =>
            s.namaDepan.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
        renderTable(filtered);
    });

    // Tutup pembaritahuan jika klik di luar kotak
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", function (e) {
            if (e.target === this) this.classList.remove("active");
        });
    });
});

// mengambil data dari local storage
function loadData() {
    allData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    updateStats(allData);
    renderTable(allData);
}

// update kotak statistik
function updateStats(data) {
    document.getElementById("stat-total").textContent = data.length;

    const bulanIni = new Date().getMonth();
    const tahunIni = new Date().getFullYear();

    const bulanCount = data.filter(s => {
        const d = new Date(s.id); // id = timestamp waktu daftar
        return d.getMonth() === bulanIni && d.getFullYear() === tahunIni;
    }).length;
    document.getElementById("stat-bulan").textContent = bulanCount;

    const tglCount = data.filter(s => s.tanggalLahir && s.tanggalLahir !== "-").length;
    document.getElementById("stat-tgl").textContent = tglCount;
}

function renderTable(data) {
    const tbody = document.getElementById("tableBody");
    const emptyState = document.getElementById("emptyState");

    tbody.innerHTML = "";

    if (data.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    data.forEach((sub, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="td-name">${escHtml(sub.namaDepan)}</td>
            <td class="td-email">${escHtml(sub.email)}</td>
            <td class="td-date">${escHtml(sub.tanggalLahir || "-")}</td>
            <td class="td-date">
                <span class="badge-daftar">${escHtml(sub.tanggalDaftar || "-")}</span>
            </td>
            <td>
                <button
                    class="btn-icon"
                    title="Hapus"
                    onclick="confirmHapusSatu(${sub.id}, '${escAttr(sub.namaDepan)}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// untuk hapus subscriber
function confirmHapusSatu(id, nama) {
    deletingId = id;
    document.getElementById("modalNama").textContent = nama;
    document.getElementById("modalHapusSatu").classList.add("active");
}

function hapusSatu() {
    allData = allData.filter(s => s.id !== deletingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    tutupModal("modalHapusSatu");
    loadData();
}

// untuk hapus semua data sekaligus
function confirmHapusSemua() {
    if (allData.length === 0) return;
    document.getElementById("modalHapusSemua").classList.add("active");
}

function hapusSemua() {
    localStorage.removeItem(STORAGE_KEY);
    tutupModal("modalHapusSemua");
    loadData();
}

function tutupModal(id) {
    document.getElementById(id).classList.remove("active");
    deletingId = null;
}

function escHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escAttr(str) {
    return String(str || "").replace(/'/g, "\\'");
}