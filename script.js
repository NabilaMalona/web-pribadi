const STORAGE_KEY = "charmsbybee_subscribers";

function daftar(event) {
    event.preventDefault();

    const namaDepan = document.getElementById("Nama").value.trim();
    const email = document.getElementById("Email").value.trim();
    const tanggal = document.getElementById("Tanggal").value.trim();
    const bulan = document.getElementById("Bulan").value.trim();
    const tahun = document.getElementById("Tahun").value.trim();

    // Validasi wajib
    if (namaDepan === "" || email === "") {
        tampilkanNotif("Nama dan Email harus diisi! 🐝", "error");
        return;
    }

    // Validasi format email sederhana
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        tampilkanNotif("Format email tidak valid!", "error");
        return;
    }

    // Ambil data yang sudah ada
    let users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Cek duplikat email
    const duplikat = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (duplikat) {
        tampilkanNotif("Email ini sudah terdaftar! 💌", "error");
        return;
    }

    // Gabungkan tanggal lahir jadi satu string
    const tanggalLahir = [tanggal, bulan, tahun].filter(Boolean).join(" / ") || "-";

    const userBaru = {
        id: Date.now(),
        namaDepan: namaDepan,
        email: email,
        tanggalLahir: tanggalLahir,
        tanggalDaftar: new Date().toLocaleDateString("id-ID", {
            day: "2-digit", month: "long", year: "numeric"
        })
    };

    users.push(userBaru);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    console.log("Data tersimpan:", users);

    // notifikasi sudah subscribe
    tampilkanNotif("Berlangganan Berhasil! Terima kasih, " + namaDepan + "! 🌸", "success");

    // Reset form
    event.target.reset();
}

// notifikasi pop up
function tampilkanNotif(pesan, tipe) {
    // Hapus notif lama jika masih ada
    const existing = document.querySelector(".notif-bee");
    if (existing) existing.remove();

    const notif = document.createElement("div");
    notif.className = "notif-bee";
    notif.textContent = pesan;

    const warna = tipe === "success" ? "#844d57" : "#e9e9e9";

    notif.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 0.85rem 1.4rem;
        border-radius: 12px;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.88rem;
        font-weight: 600;
        color: #fff;
        background: ${warna};
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 320px;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    document.body.appendChild(notif);

    // Animasi masuk
    requestAnimationFrame(() => {
        notif.style.opacity = "1";
        notif.style.transform = "translateY(0)";
    });

    // Hilang otomatis setelah 3.5 detik
    setTimeout(() => {
        notif.style.opacity = "0";
        notif.style.transform = "translateY(12px)";
        setTimeout(() => notif.remove(), 300);
    }, 3500);
}


// menampilkan data user
document.addEventListener("DOMContentLoaded", function () {

    const tabel = document.getElementById("userTable");
    if (!tabel) return;

    let users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    console.log("Data LocalStorage:", users);

    if (users.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 2rem; color: #9a7878;">
                    Belum ada data subscriber
                </td>
            </tr>
        `;
        return;
    }

    tabel.innerHTML = "";

    users.forEach((user, index) => {
        tabel.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escHtml(user.namaDepan)}</td>
                <td>${escHtml(user.email)}</td>
                <td>${escHtml(user.tanggalLahir)}</td>
                <td>${escHtml(user.tanggalDaftar)}</td>
            </tr>
        `;
    });
});

function escHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}