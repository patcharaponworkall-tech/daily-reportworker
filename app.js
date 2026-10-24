
let liffProfile = null;

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbz14A1FjQRCWOT427jwoLhEG-UTRgPTFS8gguUWTppOJ4Jnjacd-QxQ4R4yD18Cx6i0/exec';

const REQUEST_TIMEOUT_MS = 30000;
const MAX_IMAGE_COUNT = 4;
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;

async function fetchJsonWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    function () {
      controller.abort();
    },
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      url,
      Object.assign({}, options, {
        signal: controller.signal
      })
    );

    if (!response.ok) {
      throw new Error(
        `เซิร์ฟเวอร์ตอบกลับด้วยสถานะ ${response.status}`
      );
    }

    const contentType =
      response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      throw new Error(
        'รูปแบบคำตอบจากเซิร์ฟเวอร์ไม่ถูกต้อง'
      );
    }

    return await response.json();

  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new Error(
        'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง'
      );
    }

    throw error;

  } finally {
    clearTimeout(timeoutId);
  }
}

async function initializeLiff() {

  const info =
    document.getElementById('liffUserInfo');

  try {

    info.textContent =
      'เริ่ม LIFF...';

    await liff.init({
      liffId: '2011529431-bRn6gKcu'
    });

    info.textContent =
      'LIFF Initialized';

    if (!liff.isLoggedIn()) {

      info.textContent =
        'ยังไม่ได้เข้าสู่ระบบ LINE';

      return;
    }

    info.textContent =
      'กำลังอ่านข้อมูลผู้ใช้...';

    liffProfile =
      await liff.getProfile();

    info.textContent =
      'ผู้ใช้งาน: ' +
      liffProfile.displayName;

  } catch (error) {

    info.textContent =
      'LIFF Error: ' +
      error.message;

    console.error(
      'LIFF INIT ERROR:',
      error
    );
  }
}

let currentCollageBase64 = '';
let isProcessingImages = false;
let imageProcessingGeneration = 0;
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

    return collageBase64;
}
document.addEventListener('DOMContentLoaded', function () {
  initializeLiff();
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

      const formStatus =
      document.getElementById('formStatus');

      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.textContent = 'กำลังส่งรายงาน...';
      formStatus.textContent = 'กำลังส่งรายงาน กรุณารอสักครู่';
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
         
        appendProblem:
        document.getElementById('appendProblem').checked,
    
        remark: document.getElementById('remark').value,
      
        reporterName: liffProfile ? liffProfile.displayName : '',
        reporterUserId: liffProfile ? liffProfile.userId : '',
      
        imageBase64: currentCollageBase64
      };
    try {

  const result = await fetchJsonWithTimeout(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(report)
  });


  // GAS ตอบกลับว่าไม่สำเร็จ
  if (!result.success) {
    throw new Error(
      result.error || 'ไม่สามารถบันทึกข้อมูลได้'
    );
  }

  // ===== บันทึกสำเร็จจริง =====

  console.log('SAVE SUCCESS');

  submitButton.textContent = 'ส่งรายงาน';
  submitButton.disabled = false;
  submitButton.setAttribute('aria-busy', 'false');
  formStatus.textContent = 'บันทึกรายงานสำเร็จ';
      
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

  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  console.error('SAVE ERROR:', error);
  alert('บันทึกรายงานไม่สำเร็จ\n' + errorMessage);
  submitButton.disabled = false;
  submitButton.setAttribute('aria-busy', 'false');
  formStatus.textContent =
    'เกิดข้อผิดพลาด: ' + errorMessage;

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
    imageProcessingGeneration++;
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

  }
);  
imageInput.addEventListener(
  'change',
  async function () {

    const selectedImages =
      Array.from(imageInput.files);

    const processingGeneration =
      ++imageProcessingGeneration;

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
    if (selectedImages.length > MAX_IMAGE_COUNT) {

      alert(`เลือกได้สูงสุด ${MAX_IMAGE_COUNT} รูป`);

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

      imageInput.value = '';
      currentCollageBase64 = '';
      isProcessingImages = false;

      return;
    }

    const oversizedImage =
      selectedImages.find(
        function (file) {
          return file.size > MAX_IMAGE_FILE_SIZE_BYTES;
        }
      );

    if (oversizedImage) {
      alert('รูปแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB');
      imageInput.value = '';
      currentCollageBase64 = '';
      isProcessingImages = false;
      return;
    }

    const totalImageSize =
      selectedImages.reduce(
        function (total, file) {
          return total + file.size;
        },
        0
      );

    if (totalImageSize > MAX_TOTAL_IMAGE_SIZE_BYTES) {
      alert('ขนาดรูปรวมต้องไม่เกิน 12 MB');
      imageInput.value = '';
      currentCollageBase64 = '';
      isProcessingImages = false;
      return;
    }

    try {

      const collageBase64 =
        await createCollage(selectedImages);

      if (
        processingGeneration !==
        imageProcessingGeneration
      ) {
        return;
      }

      currentCollageBase64 = collageBase64;
      clearImagesButton.style.display = 'inline-block';

    } catch (error) {

      if (
        processingGeneration !==
        imageProcessingGeneration
      ) {
        return;
      }

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

      if (
        processingGeneration ===
        imageProcessingGeneration
      ) {
        isProcessingImages = false;
      }

    }

  }
);
});
