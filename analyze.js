let data = [];

/*
    Kalau backend masih dijalankan di laptop:
    pakai http://localhost:3000

    Kalau backend sudah online:
    ganti menjadi URL backend kamu.
    Contoh:
    const API_URL = "https://digital-mind-backend.vercel.app";
*/

const API_URL = "https://digital-mind-backend.vercel.app";

/* ===============================
   KLASIFIKASI AKTIVITAS
   Ini hanya label awal.
   Analisis utama dilakukan OpenAI di backend.
================================ */

function classify(activity) {
    const a = activity.toLowerCase();

    const highDopamine = [
        "tiktok",
        "reels",
        "instagram",
        "game",
        "games",
        "youtube shorts",
        "shorts",
        "scroll",
        "facebook",
        "twitter",
        "x",
        "sosmed",
        "media sosial"
    ];

    const recovery = [
        "meditasi",
        "reading",
        "baca",
        "membaca",
        "olahraga",
        "journaling",
        "jalan",
        "jalan kaki",
        "istirahat",
        "tidur",
        "ibadah",
        "musik",
        "relaksasi"
    ];

    const productive = [
        "belajar",
        "kuliah",
        "kerja",
        "coding",
        "ngoding",
        "tugas",
        "menulis",
        "mengerjakan tugas",
        "rapat",
        "diskusi"
    ];

    for (let h of highDopamine) {
        if (a.includes(h)) {
            return "HIGH";
        }
    }

    for (let r of recovery) {
        if (a.includes(r)) {
            return "RECOVERY";
        }
    }

    for (let p of productive) {
        if (a.includes(p)) {
            return "PRODUCTIVE";
        }
    }

    return "NEUTRAL";
}

/* ===============================
   TAMPILKAN DATA KE WEBSITE
================================ */

function render() {
    let total = 0;
    let text = "";

    data.forEach((d, i) => {
        total += d.m;
        text += `${i + 1}. ${d.a} - ${d.m} menit [${d.type}]\n`;
    });

    document.getElementById("total").innerText = "Total: " + total + " menit";
    document.getElementById("list").innerText = text || "Belum ada data";
}

/* ===============================
   TAMBAH AKTIVITAS
================================ */

function tambah() {
    const aktivitas = document.getElementById("act").value.trim();
    const menit = Number(document.getElementById("min").value);

    if (!aktivitas || isNaN(menit) || menit <= 0) {
        alert("Isi aktivitas dan durasi dengan benar!");
        return;
    }

    const type = classify(aktivitas);

    data.push({
        a: aktivitas,
        m: menit,
        type: type
    });

    document.getElementById("act").value = "";
    document.getElementById("min").value = "";

    render();
}

/* ===============================
   ANALISIS KE BACKEND
   Backend nanti yang memanggil OpenAI.
================================ */

async function analisis() {
    const resultBox = document.getElementById("result");

    if (data.length === 0) {
        resultBox.innerText = "Tambahkan aktivitas terlebih dahulu.";
        return;
    }

    resultBox.innerText = "Mengirim data ke backend untuk dianalisis OpenAI...";

    try {
        const res = await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                activities: data
            })
        });

        const json = await res.json();

        resultBox.innerText =
            json.result || json.error || "Tidak ada hasil analisis.";

    } catch (error) {
        resultBox.innerText =
            "Gagal koneksi ke backend. Pastikan backend sudah berjalan dan API_URL sudah benar.";
    }
}

/* ===============================
   GENERATE IMAGE SEDERHANA
   Gambar dibuat dari backend.
================================ */

async function generateImage() {
    const statusBox = document.getElementById("status");
    const img = document.getElementById("img");

    if (data.length === 0) {
        statusBox.innerText = "Tambahkan aktivitas terlebih dahulu.";
        return;
    }

    statusBox.innerText = "Membuat visualisasi otak...";
    img.style.display = "none";

    try {
        const res = await fetch(`${API_URL}/api/generate-image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                activities: data
            })
        });

        const json = await res.json();

        if (json.image) {
            img.src = `data:${json.mime};base64,${json.image}`;
            img.style.display = "block";
            statusBox.innerText = "Visualisasi berhasil dibuat.";
        } else {
            statusBox.innerText = json.error || "Gagal membuat gambar.";
        }

    } catch (error) {
        statusBox.innerText =
            "Gagal koneksi ke backend. Pastikan backend sudah berjalan.";
    }
}

/* ===============================
   ENTER UNTUK TAMBAH DATA
================================ */

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        tambah();
    }
});

render();
