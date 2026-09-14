
let currentCollageBase64 = '';
let isProcessingImages = false;
function drawImageCover(
  ctx,
  image,
  x,
  y,
  width,
  height
) {

  const imageRatio =
    image.width / image.height;

  const boxRatio =
    width / height;

  let sourceX;
  let sourceY;
  let sourceWidth;
  let sourceHeight;

  if (imageRatio > boxRatio) {

    // รูปกว้างเกินช่อง
    sourceHeight = image.height;
    sourceWidth =
      image.height * boxRatio;

    sourceX =
      (image.width - sourceWidth) / 2;

    sourceY = 0;

  } else {

    // รูปสูงเกินช่อง
    sourceWidth = image.width;
    sourceHeight =
      image.width / boxRatio;

    sourceX = 0;

    sourceY =
      (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,

    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,

    x,
    y,
    width,
    height
  );
}
async function createCollage(files) {

  const canvas =
    document.getElementById('collageCanvas');

  const ctx =
    canvas.getContext('2d');

  const width = 800;
  const height = 600;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  const images = [];

  for (const file of files) {

    const image = new Image();

    const imageUrl =
      URL.createObjectURL(file);

    await new Promise(
    function (resolve, reject) {

        image.onload = function () {
        URL.revokeObjectURL(imageUrl);
        resolve();
        };

        image.onerror = function () {
        URL.revokeObjectURL(imageUrl);
        reject();
        };

        image.src = imageUrl;

    }
    );

    images.push(image);
  }

  let positions;

  if (images.length === 1) {

    positions = [
      [0, 0, 800, 600]
    ];

  } else if (images.length === 2) {

    positions = [
      [0, 0, 400, 600],
      [400, 0, 400, 600]
    ];

  } else {

    positions = [
      [0, 0, 400, 300],
      [400, 0, 400, 300],
      [0, 300, 400, 300],
      [400, 300, 400, 300]
    ];

  }

  images.forEach(
    function (image, index) {

      const position =
        positions[index];

      drawImageCover(
        ctx,
        image,
        position[0],
        position[1],
        position[2],
        position[3]
        );

    }
  );
  const collageBase64 =
  canvas.toDataURL(
    'image/jpeg',
    0.8
  );

    console.log(
    'COLLAGE BASE64 LENGTH:',
    collageBase64.length
    );

    console.log(
    'COLLAGE TYPE:',
    collageBase64.substring(0, 23)
    );
    return collageBase64;
}
document.addEventListener('DOMContentLoaded', function () {

const shiftSelect =
        document.getElementById('shift');

const savedShift =
  localStorage.getItem('dailyReportShift');

if (savedShift) {
  shiftSelect.value = savedShift;
}

shiftSelect.addEventListener(
  'change',
  function () {

    localStorage.setItem(
      'dailyReportShift',
      shiftSelect.value
    );

  }
);

  const dateInput =
  document.getElementById('date');

    const today =
    new Date();

    const year =
    today.getFullYear();

    const month =
    String(
        today.getMonth() + 1
    ).padStart(2, '0');

    const day =
    String(
        today.getDate()
    ).padStart(2, '0');

    dateInput.value =
    `${year}-${month}-${day}`;
  const reportForm =
  document.getElementById('reportForm');

const lineSelect =
  document.getElementById('line');

const modelSelect =
  document.getElementById('model');

const machineSelect =
  document.getElementById('machine');


const modelOptions = {

  J17: [
    'A5LMA0040'
  ],

  K27: [
    'A5LMB0040'
  ]

};


function updateModelOptions() {

  const selectedLine =
    lineSelect.value;

  modelSelect.innerHTML =
    '<option value="">-- Select Model --</option>';

  if (!modelOptions[selectedLine]) {
    return;
  }

  modelOptions[selectedLine].forEach(
    function (model) {

      const option =
        document.createElement('option');

      option.value = model;
      option.textContent = model;

      modelSelect.appendChild(option);

    }
  );
  if (modelOptions[selectedLine].length === 1) {
    modelSelect.value =
        modelOptions[selectedLine][0];
    }

}


const savedLine =
    localStorage.getItem('dailyReportLine');

    if (savedLine) {
    lineSelect.value = savedLine;
    }

    updateModelOptions();


    const savedMachine =
    localStorage.getItem('dailyReportMachine');

    if (savedMachine) {
    machineSelect.value = savedMachine;
    }


machineSelect.addEventListener(
    'change',
    function () {

        localStorage.setItem(
        'dailyReportMachine',
        machineSelect.value
        );

    }
    );


    lineSelect.addEventListener(
    'change',
    function () {

        localStorage.setItem(
        'dailyReportLine',
        lineSelect.value
        );

        updateModelOptions();

    }
    );

  reportForm.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();
      if (isProcessingImages) {

        alert(
            'กำลังประมวลผลรูป กรุณารอสักครู่'
        );

        console.log('SUBMIT EVENT WORKS');

        alert('SUBMIT EVENT WORKS');

        return;
        }
        const confirmMessage =
        'ยืนยันส่งรายงาน?\n\n' +
        'Date: ' +
        document.getElementById('date').value +
        '\n' +
        'Shift: ' +
        document.getElementById('shift').value +
        '\n' +
        'Line: ' +
        document.getElementById('line').value +
        '\n' +
        'Model: ' +
        document.getElementById('model').value +
        '\n' +
        'Pass: ' +
        document.getElementById('pass').value +
        '\n' +
        'Fail: ' +
        document.getElementById('fail').value +
        '\n' +
        'WIP: ' +
        document.getElementById('wip').value;

        const confirmed =
        confirm(confirmMessage);

        if (!confirmed) {
        return;
        }
      const submitButton =
      document.getElementById('submitButton');

      submitButton.disabled = true;
      submitButton.textContent = 'ส่งคำขอแล้ว...';  
      const rawDate =
        document.getElementById('date').value;

      const formattedDate =
        rawDate.replaceAll('-', '/');

      const report = {
        date: formattedDate,
        shift: document.getElementById('shift').value,
        line: document.getElementById('line').value,
        model: document.getElementById('model').value,
        machine: document.getElementById('machine').value,
        pass: document.getElementById('pass').value,
        fail: document.getElementById('fail').value,
        wip: document.getElementById('wip').value,
        issue: document.getElementById('issue').value,
        solution: document.getElementById('solution').value,
        fixTime: document.getElementById('fixTime').value,
        remark: document.getElementById('remark').value,

        imageBase64: currentCollageBase64
      };
      console.log('SEND:', report);
      console.log(
      'IMAGE BASE64 LENGTH:',
        report.imageBase64.length
    );

      const url =
        'https://script.google.com/macros/s/AKfycbz14A1FjQRCWOT427jwoLhEG-UTRgPTFS8gguUWTppOJ4Jnjacd-QxQ4R4yD18Cx6i0/exec';

    try {

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(report)
  });

  const result = await response.json();

  console.log('GAS RESPONSE:', result);

  // GAS ตอบกลับว่าไม่สำเร็จ
  if (!result.success) {
    throw new Error(
      result.error || 'ไม่สามารถบันทึกข้อมูลได้'
    );
  }

  // ===== บันทึกสำเร็จจริง =====

  console.log('SAVE SUCCESS');

  submitButton.textContent = 'บันทึกสำเร็จ';
  submitButton.disabled = false;

  // ล้างเฉพาะข้อมูลของ Report
  document.getElementById('pass').value = '';
  document.getElementById('fail').value = '';
  document.getElementById('wip').value = '';
  document.getElementById('issue').value = '';
  document.getElementById('solution').value = '';
  document.getElementById('fixTime').value = '';
  document.getElementById('remark').value = '';

  // ล้างรูป
  imageInput.value = '';
  currentCollageBase64 = '';

  clearImagesButton.style.display = 'none';

  const canvas =
    document.getElementById('collageCanvas');

  const ctx =
    canvas.getContext('2d');

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

} catch (error) {

  console.error('SAVE ERROR:', error);

  submitButton.disabled = false;

  submitButton.textContent =
    'เกิดข้อผิดพลาด - ลองส่งอีกครั้ง';
}

    }
  );
  const imageInput =
  document.getElementById('images');
const clearImagesButton =
  document.getElementById('clearImagesButton');

clearImagesButton.addEventListener(
  'click',
  function () {

    imageInput.value = '';
    currentCollageBase64 = '';
    isProcessingImages = false;
    clearImagesButton.style.display = 'none';
    const canvas =
      document.getElementById('collageCanvas');

    const ctx =
      canvas.getContext('2d');

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    console.log('IMAGES CLEARED');
  }
);  
imageInput.addEventListener(
  'change',
  async function () {

    const selectedImages =
      Array.from(imageInput.files);

    isProcessingImages = true;
    if (selectedImages.length === 0) {

  currentCollageBase64 = '';
  isProcessingImages = false;
  clearImagesButton.style.display = 'none';
  const canvas =
    document.getElementById('collageCanvas');

  const ctx =
    canvas.getContext('2d');

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  return;
}
    if (selectedImages.length > 4) {

      alert('เลือกได้สูงสุด 4 รูป');

      imageInput.value = '';
      currentCollageBase64 = '';
      isProcessingImages = false;

      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png'
    ];

    const invalidImage =
      selectedImages.find(
        function (file) {
          return !allowedTypes.includes(file.type);
        }
      );

    if (invalidImage) {

      alert(
        'รองรับเฉพาะไฟล์ JPG และ PNG'
      );

      console.log(
        'INVALID IMAGE TYPE:',
        invalidImage.name,
        invalidImage.type
      );

      imageInput.value = '';
      currentCollageBase64 = '';
      isProcessingImages = false;

      return;
    }

    try {

      currentCollageBase64 =
        await createCollage(selectedImages);
        clearImagesButton.style.display = 'inline-block';
      console.log(
        'BASE64 READY:',
        currentCollageBase64.length
      );

    } catch (error) {

      console.error(
        'IMAGE PROCESS ERROR:',
        error
      );

      alert(
        'ไม่สามารถประมวลผลรูปได้'
      );

      imageInput.value = '';
      currentCollageBase64 = '';

    } finally {

      isProcessingImages = false;

    }

  }
);
});
