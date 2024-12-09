// Fungsi untuk menambahkan baris input
function addRow() {
  const tableBody = document.getElementById("dataInput");
  const newRow = `
            <tr>
                <td><input type="text" name="karyawan[]" ></td>
                <td>
                    <select name="appraisal[]" required>
                        <option value="1">0 -11</option>
                        <option value="2">11 - 20 </option>
                        <option value="3">21 - 25</option>
                        <option value="4">25 - 30 </option>
                    </select>
                </td>
                <td>
                    <select name="posisi[]" required>
                        <option value="1">0 - 0,5</option>
                        <option value="2">0,6 - 1</option>
                        <option value="3">1,1 - 1,5</option>
                        <option value="4">1,6 - 2</option>
                    </select>
                </td>
                <td>
                    <select name="absensi[]" required>
                        <option value="1">1 - 2</option>
                        <option value="2">3 - 4 </option>
                        <option value="3">4 - 5 </option>
                        <option value="4">>5 </option>
                    </select>
                </td>
                <td>
                    <select name="bpjs[]" required>
                        <option value="1">0 - 2</option>
                        <option value="2">3 - 5</option>
                        <option value="3">5 - 6,5</option>
                        <option value="4">6,6 - 8,5</option>
                    </select>
                </td>
                <td>
                    <button type="button" class="btn btn-delete" onclick="deleteRow(this)">Delete</button>
                </td>
            </tr>
        `;

  tableBody.insertAdjacentHTML("beforeend", newRow);
}

function deleteRow(button) {
  const row = button.parentElement.parentElement; // Ambil elemen <tr> dari tombol yang diklik
  row.remove(); // Hapus elemen baris
}

function kriteria() {
  const showBobot = document.getElementsByClassName("bobot-section");
  for (let i = 0; i < showBobot.length; i++) {
    showBobot[i].style.display = "block";
  }
}

function hitung() {
  const showResult = document.getElementsByClassName("result-section");
  for (let i = 0; i < showResult.length; i++) {
    showResult[i].style.display = "block";
  }
  calculate();
}

function calculate() {
  console.log("Proses perhitungan dimulai...");

  event.preventDefault();

  const form = document.forms["spkForm"];
  // const karyawan = form["karyawan[]"];
  // const appraisal = form["appraisal[]"];
  // const posisi = form["posisi[]"];
  // const absensi = form["absensi[]"];
  // const bpjs = form["bpjs[]"];

  // Simulasi data yang seolah-olah dimasukkan
  const karyawan = [
    { value: "A1 Ikan Mas" },
    { value: "A2 Ikan Lele" },
    { value: "A3 Ikan Patin" },
    { value: "A4 Ikan Nila" },
    { value: "A5 Ikan Gurame" },
  ];

  const appraisal = [
    { value: "3" },
    { value: "4" },
    { value: "3" },
    { value: "4" },
    { value: "3" },
  ];

  const posisi = [
    { value: "3" },
    { value: "3" },
    { value: "2" },
    { value: "1" },
    { value: "1" },
  ];

  const absensi = [
    { value: "2" },
    { value: "4" },
    { value: "2" },
    { value: "3" },
    { value: "3" },
  ];

  const bpjs = [
    { value: "4" },
    { value: "3" },
    { value: "3" },
    { value: "2" },
    { value: "4" },
  ];

  // Menggabungkan data menjadi satu objek untuk setiap karyawan
  const data = [];
  for (let i = 0; i < karyawan.length; i++) {
    data.push({
      nama: karyawan[i].value,
      appraisal: parseInt(appraisal[i].value),
      posisi: parseInt(posisi[i].value),
      absensi: parseInt(absensi[i].value),
      bpjs: parseInt(bpjs[i].value),
    });
  }

  if (data.length < 2) {
    alert("Data harus memiliki minimal 2 baris untuk diproses!");
    const showResult = document.getElementsByClassName("result-section");
    for (let i = 0; i < showResult.length; i++) {
      showResult[i].style.display = "none";
    }
    return; // Menghentikan proses jika data kurang dari 2
  }

  showDataTable(data);

  // Hitung dan assign rank untuk setiap kategori
  bessonRank(data, "appraisal", "Suhu Air (°C)", "Appraisal");
  bessonRank(data, "posisi", "Kecerahan Air (M)", "Posisi");
  bessonRank(data, "absensi", "Oksigen Terlarut (mg/L)", "Absensi");
  bessonRank(data, "bpjs", "pH air (mg/L)", "BPJS");

  // Hitung semua Distance Score
  const combinedData = mergeRanks(
    drankAppraisal,
    drankPosisi,
    drankAbsensi,
    drankBPJS
  );
  bessonRankAndNormalize(combinedData, "tabelBessonRank");
  console.table(combinedData);

  // Hitung semua Distance Score
  const distanceScores = processDistanceScores(combinedData);
  console.table(distanceScores);
  AkumulasiNilaiDistanceScore(distanceScores, "tabelDistanceScore");

  // Hitung semua Distance Score X Bobot
  const distanceScoresXBobot = distanceScoreXbobot(distanceScores);
  console.table(distanceScoresXBobot);
  PerangkinganMetodeOreste(distanceScoresXBobot, "tabelPerangkingan");
}

let drankAppraisal = [];
let drankPosisi = [];
let drankAbsensi = [];
let drankBPJS = [];

function bessonRank(data, category, nameCategory, tabel) {
  const sortedData = [...data].sort((a, b) => b[category] - a[category]);

  let lastValue = null;
  let currentRanks = [];
  let rankCounter = 1;

  sortedData.forEach((d, index) => {
    if (lastValue === null || d[category] !== lastValue) {
      if (currentRanks.length > 0) {
        const rankSum = currentRanks.reduce((acc, rank) => acc + rank, 0);
        const averageRank = rankSum / currentRanks.length;
        const rankExpression = currentRanks.join("+"); // Menggabungkan peringkat untuk keterangan
        const keterangan = `(${rankExpression})/${
          currentRanks.length
        } = ${averageRank.toFixed(2)}`;

        currentRanks.forEach((_, idx) => {
          sortedData[index - currentRanks.length + idx].rank = averageRank;
          // Menambahkan keterangan
          sortedData[index - currentRanks.length + idx].keterangan = keterangan;
        });
      }
      currentRanks = [];
    }
    currentRanks.push(rankCounter);
    lastValue = d[category];
    rankCounter++;
  });

  if (currentRanks.length > 0) {
    const rankSum = currentRanks.reduce((acc, rank) => acc + rank, 0);
    const averageRank = rankSum / currentRanks.length;
    const rankExpression = currentRanks.join("+"); // Menggabungkan peringkat untuk keterangan
    const keterangan = `(${rankExpression})/${
      currentRanks.length
    } = ${averageRank.toFixed(2)}`;

    currentRanks.forEach((_, idx) => {
      sortedData[sortedData.length - currentRanks.length + idx].rank =
        averageRank;
      // Menambahkan keterangan
      sortedData[sortedData.length - currentRanks.length + idx].keterangan =
        keterangan;
    });
  }

  // Menyimpan nama dan rank untuk setiap kategori ke variabel global
  if (category == "appraisal") {
    drankAppraisal = sortedData.map((d) => ({
      nama: d.nama,
      rank: d.rank,
      keterangan: d.keterangan,
    }));
  } else if (category == "posisi") {
    drankPosisi = sortedData.map((d) => ({
      nama: d.nama,
      rank: d.rank,
      keterangan: d.keterangan,
    }));
  } else if (category == "absensi") {
    drankAbsensi = sortedData.map((d) => ({
      nama: d.nama,
      rank: d.rank,
      keterangan: d.keterangan,
    }));
  } else if (category == "bpjs") {
    drankBPJS = sortedData.map((d) => ({
      nama: d.nama,
      rank: d.rank,
      keterangan: d.keterangan,
    }));
  }

  // Output hasil
  console.table(sortedData);

  const resultRankTable = document.getElementById("tabelRank" + tabel);
  resultRankTable.innerHTML = `
     <table>
       <thead>
         <tr>
           <th>Alternatif</th>
           <th>${nameCategory}</th>
           <th>Rank</th>
           <th>Keterangan</th>
         </tr>
       </thead>
       <tbody>
         ${data
           .map(
             (d) => `
           <tr>
             <td>${d.nama}</td>
             <td>${d[category]}</td>
             <td>${d.rank}</td>
             <td>${d.keterangan}</td>
           </tr>
         `
           )
           .join("")}
       </tbody>
     </table>
    `;

  return sortedData;
}

function mergeRanks(data1, data2, data3, data4) {
  // Merge ranks by employee name
  return data1.map((d) => {
    const appraisal = data1.find((item) => item.nama === d.nama);
    const posisi = data2.find((item) => item.nama === d.nama);
    const absensi = data3.find((item) => item.nama === d.nama);
    const bpjs = data4.find((item) => item.nama === d.nama);

    return {
      nama: d.nama,
      appraisalRank: appraisal ? appraisal.rank : null,
      posisiRank: posisi ? posisi.rank : null,
      absensiRank: absensi ? absensi.rank : null,
      bpjsRank: bpjs ? bpjs.rank : null,
    };
  });
}

// Fungsi untuk menghitung Distance Score
function calculateDistanceScore(rcj, rcj_a, r = 3) {
  // Menghitung pangkat 3
  const rcjCubed = Math.pow((1 / 2) * rcj, 3);
  const rcj_aCubed = Math.pow((1 / 2) * rcj_a, 3);

  // Menghitung total
  const total = rcjCubed + rcj_aCubed;

  // Menghitung akar pangkat 1/r
  const result = Math.pow(total, 1 / r);

  // Membulatkan hasil ke 4 digit desimal
  return parseFloat(result.toFixed(4));
}

function processDistanceScores(data) {
  // Menyimpan hasil per kategori
  data.forEach((d) => {
    // Menghitung Distance Score untuk setiap kategori
    d.appraisalScore = calculateDistanceScore(d.appraisalRank, 1); // D(nama, C1)
    d.posisiScore = calculateDistanceScore(d.posisiRank, 2); // D(nama, C2)
    d.absensiScore = calculateDistanceScore(d.absensiRank, 3); // D(nama, C3)
    d.bpjsScore = calculateDistanceScore(d.bpjsRank, 4); // D(nama, C4)
  });

  // Mengambil hanya kolom yang diinginkan
  const result = data.map(
    ({ nama, appraisalScore, posisiScore, absensiScore, bpjsScore }) => ({
      nama,
      appraisalScore,
      posisiScore,
      absensiScore,
      bpjsScore,
    })
  );

  // Kembalikan data yang sudah diperbarui dengan skor
  return result;
}

// Fungsi untuk menghitung nilai preferensi x bobot
function nilaiPreferensi(dataCategori, bobot) {
  return dataCategori * bobot;
}

// Fungsi untuk menghitung nilai preferensi dan totalnya
function distanceScoreXbobot(data) {
  // Menyimpan hasil per kategori
  data.forEach((d) => {
    // Menghitung nilai preferensi untuk setiap kategori x bobot
    d.appraisalScoreBobot = nilaiPreferensi(d.appraisalScore, 0.35);
    d.posisiScoreBobot = nilaiPreferensi(d.posisiScore, 0.2);
    d.absensiScoreBobot = nilaiPreferensi(d.absensiScore, 0.25);
    d.bpjsScoreBobot = nilaiPreferensi(d.bpjsScore, 0.2);

    // Menjumlahkan hasil per kategori untuk mendapatkan total preferensi
    d.totalPreferensi = (
      d.appraisalScoreBobot +
      d.posisiScoreBobot +
      d.absensiScoreBobot +
      d.bpjsScoreBobot
    ).toFixed(4); // Membulatkan hasil ke 4 digit desimal
  });

  // Mengurutkan data berdasarkan totalPreferensi secara ascending (terendah ke tertinggi)
  data.sort((a, b) => a.totalPreferensi - b.totalPreferensi);

  // Memberikan ranking berdasarkan urutan
  data.forEach((d, index) => {
    d.ranking = index + 1; // Peringkat dimulai dari 1
  });

  // Mengambil hanya kolom yang diinginkan
  const result = data.map(
    ({
      nama,
      appraisalScoreBobot,
      posisiScoreBobot,
      absensiScoreBobot,
      bpjsScoreBobot,
      totalPreferensi,
      ranking,
    }) => ({
      nama,
      appraisalScoreBobot,
      posisiScoreBobot,
      absensiScoreBobot,
      bpjsScoreBobot,
      totalPreferensi,
      ranking,
    })
  );

  // Kembalikan data yang sudah diperbarui dengan skor
  return result;
}

// Fungsi untuk menghitung ranking berdasarkan totalPreferensi
function rankingBerdasarkanPreferensi(data) {
  // Urutkan data berdasarkan totalPreferensi secara ascending (terendah ke tertinggi)

  // Memberikan ranking berdasarkan urutan
  data.forEach((d, index) => {
    // Peringkat dimulai dari 1
    d.ranking = index + 1;
  });

  return data;
}

// Fungsi untuk menampilkan data nilai dalam tabel
function showDataTable(data) {
  // Tampilkan data dalam tabel
  const resultDataTable = document.getElementById("dataTable");
  resultDataTable.innerHTML = `
           <table>
               <thead>
                   <tr>
                       <th>Alternatif</th>
                       <th>Suhu Air (°C)</th>
                       <th>Kecerahan Air (M)</th>
                       <th>Oksigen Terlarut (mg/L)</th>
                       <th>pH air (mg/L)</th>
                   </tr>
               </thead>
               <tbody>
                   ${data
                     .map(
                       (d) => `
                       <tr>
                           <td>${d.nama}</td>
                           <td>${d.appraisal}</td>
                           <td>${d.posisi}</td>
                           <td>${d.absensi}</td>
                           <td>${d.bpjs}</td>
                       </tr>
                   `
                     )
                     .join("")}
               </tbody>
           </table>
       `;
}

function bessonRankAndNormalize(data, tabel) {
  const resultRankTable = document.getElementById(tabel);
  resultRankTable.innerHTML = `
      <table border="1">
        <thead>
          <tr>
             <th>Alternatif</th>
              <th>Suhu Air (°C)</th>
              <th>Kecerahan Air (M)</th>
              <th>Oksigen Terlarut (mg/L)</th>
              <th>pH air (mg/L)</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (d) => `
            <tr>
              <td>${d.nama}</td>
              <td>${d.appraisalRank}</td>
              <td>${d.posisiRank}</td>
              <td>${d.absensiRank}</td>
              <td>${d.bpjsRank}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
}

function AkumulasiNilaiDistanceScore(data, tabel) {
  const resultRankTable = document.getElementById(tabel);
  resultRankTable.innerHTML = `
      <table border="1">
        <thead>
          <tr>
            <th>Alternatif</th>
            <th>Suhu Air (°C)</th>
            <th>Kecerahan Air (M)</th>
            <th>Oksigen Terlarut (mg/L)</th>
            <th>pH air (mg/L)</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (d) => `
            <tr>
              <td>${d.nama}</td>
              <td>${d.appraisalScore}</td>
              <td>${d.posisiScore}</td>
              <td>${d.absensiScore}</td>
              <td>${d.bpjsScore}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
}

function PerangkinganMetodeOreste(data, tabel) {
  // Menampilkan tombol Peringkat Akhir
  const btnRangking = document.getElementById("btnRangking");
  btnRangking.style.display = "inline";

  const resultRankTable = document.getElementById(tabel);
  resultRankTable.innerHTML = `
      <table border="1">
        <thead>
          <tr>
            <th>Alternatif</th>
            <th>Nilai Pref</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (d) => `
            <tr>
              <td>${d.nama}</td>
              <td>${d.totalPreferensi}</td>
              <td>${d.ranking}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
}
