const http = require('http');

const data = JSON.stringify({
  identity: {
    name: "Tester Otomatis",
    age: 25,
    gender: "Laki-laki",
    javaneseFluency: "Native",
    region: "Solo",
    finalComment: "Ini adalah hasil dari automated test."
  },
  mos: [
    {
      sampleId: "jvm_00027_01760922907",
      modelType: "LPEP",
      mos_n_score: 4.5,
      mos_pa_score: 5.0,
      comment: "Bagus sekali pelafalannya."
    },
    {
      sampleId: "jvm_00027_01760922907",
      modelType: "GT",
      mos_n_score: 5.0,
      mos_pa_score: 5.0,
      comment: "Ground truth selalu sempurna."
    }
  ],
  cmos: [
    {
      sampleId: "jvm_00027_01760922907",
      score: 2,
      comment: "Audio LPEP jauh lebih baik daripada FT."
    }
  ]
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/scores',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Mengirim request data dummy ke http://localhost:3000/api/scores ...');

const req = http.request(options, (res) => {
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response Body: ${responseBody}`);
    if (res.statusCode === 200) {
      console.log('✅ TEST SUKSES: Data berhasil masuk ke database!');
    } else {
      console.log('❌ TEST GAGAL: Terjadi masalah pada backend API.');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
