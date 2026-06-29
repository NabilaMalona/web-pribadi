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
            <div class="action-btns">
                <button
                    class="btn-icon edit"
                    title="Edit"
                    onclick="bukaEdit(${sub.id})">
                    <i class="fas fa-pen"></i>
                </button>
            </div>
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

// ── Buka modal Edit ──
function bukaEdit(id) {
    // Cari data subscriber berdasarkan id
    const sub = allData.find(s => s.id === id);
    if (!sub) return;

    // Pisahkan tanggalLahir "15 / 06 / 2001" kembali ke 3 field
    const bagian = (sub.tanggalLahir && sub.tanggalLahir !== "-")
        ? sub.tanggalLahir.split(" / ")
        : ["", "", ""];

    // Isi field modal dengan data yang ada
    document.getElementById("editId").value = sub.id;
    document.getElementById("editNama").value = sub.namaDepan;
    document.getElementById("editEmail").value = sub.email;
    document.getElementById("editTanggal").value = bagian[0] || "";
    document.getElementById("editBulan").value = bagian[1] || "";
    document.getElementById("editTahun").value = bagian[2] || "";

    document.getElementById("modalEdit").classList.add("active");
}

// ── Simpan hasil Edit ke localStorage ──
function simpanEdit() {
    const id = Number(document.getElementById("editId").value);
    const nama = document.getElementById("editNama").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const tanggal = document.getElementById("editTanggal").value.trim();
    const bulan = document.getElementById("editBulan").value.trim();
    const tahun = document.getElementById("editTahun").value.trim();

    // Validasi wajib
    if (nama === "" || email === "") {
        alert("Nama dan Email tidak boleh kosong!");
        return;
    }

    // Validasi format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Format email tidak valid!");
        return;
    }

    // Cek duplikat email — boleh sama dengan dirinya sendiri
    const duplikat = allData.some(s =>
        s.email.toLowerCase() === email.toLowerCase() && s.id !== id
    );
    if (duplikat) {
        alert("Email ini sudah dipakai subscriber lain!");
        return;
    }

    // Gabungkan tanggal lahir
    const tanggalLahir = [tanggal, bulan, tahun].filter(Boolean).join(" / ") || "-";

    // Update data di array allData
    allData = allData.map(s => {
        if (s.id === id) {
            return {
                ...s,
                namaDepan: nama,
                email: email,
                tanggalLahir: tanggalLahir
            };
        }
        return s;
    });

    // Simpan kembali ke localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));

    tutupModal("modalEdit");
    loadData(); // refresh tabel + statistik
}
function escAttr(str) {
    return String(str || "").replace(/'/g, "\\'");
}