// قالب النص الجاهز
function getInitialTemplate(title) {
    return `المكرم/ [اسم الموظف]،\n\nبناءً على ما تم رصده، نود إفادتكم بوقوع مخالفة ( ${title} ).\nنأمل منكم الالتزام بالأنظمة والتعليمات تفادياً لتطبيق لائحة الجزاءات.\n\nملاحظات إضافية: `;
}

// البيانات الأساسية
const defaultViolationsData = {
    high: [
        { title: "إغلاق المعرض والتسبب في تعطيل المبيعات", points: "-15" },
        { title: "تلاعب في أوقات البريك", points: "-15" },
        { title: "تلاعب في ساعات العمل", points: "-15" },
        { title: "عدم تسليم العميل فاتورة مشتريات", points: "-15" },
        { title: "غياب بدون عذر", points: "-15" }
    ],
    medium: [
        { title: "إهمال الإبلاغ عن أعطال الأجهزة والأنظمة", points: "-7" },
        { title: "الخروج للبريك بدون تسجيل إذن", points: "-7" },
        { title: "تجمعات خلال ساعات العمل", points: "-7" },
        { title: "خروج أكثر من موظف في نفس وقت الاستراحة", points: "-7" },
        { title: "عدم الالتزام بمعايير خدمة العملاء", points: "-7" },
        { title: "مخالفة قواعد السلوك والانضباط المهني في مكان العمل", points: "-7" },
        { title: "وجود الموظف في غير مكان العمل أثناء ساعات العمل", points: "-7" }
    ],
    low: [
        { title: "الإخلال بالمظهر العام للمعرض", points: "-3" },
        { title: "التأخر عن مواعيد الدوام الرسمية", points: "-3" },
        { title: "التواجد في المستودع خارج وقت البريك دون مقتضى حاجة", points: "-3" },
        { title: "تجاوز الوقت المسموح به", points: "-3" },
        { title: "عدم اكمال نوبة العمل", points: "-3" },
        { title: "عدم الالتزام بالزي الرسمي أو عدم ارتداء الشال الخاص", points: "-3" },
        { title: "عدم الالتزام في تنفيذ المهام اليومية", points: "-3" },
        { title: "عدم الالتزام في مهام الاستقطاب", points: "-3" }
    ]
};

let dbData = {};

// تهيئة قاعدة البيانات (استخدمنا مفتاح جديد v2 عشان ما يتداخل مع القديم)
function initDatabase() {
    const storedData = localStorage.getItem('violationsDB_v2');
    
    if (storedData) {
        dbData = JSON.parse(storedData);
    } else {
        dbData = JSON.parse(JSON.stringify(defaultViolationsData));
        for (const category in dbData) {
            dbData[category].forEach(violation => {
                // حولنا الملاحظة لمصفوفة عشان تقبل أكثر من مربع
                violation.notes = [getInitialTemplate(violation.title)];
            });
        }
        saveToDB();
    }
}

function saveToDB() {
    localStorage.setItem('violationsDB_v2', JSON.stringify(dbData));
}

// تحديث النص عند الكتابة
function updateText(category, vIndex, nIndex, newText) {
    dbData[category][vIndex].notes[nIndex] = newText;
    saveToDB();
}

// إضافة ملاحظة جديدة (مربع جديد)
function addNote(category, vIndex) {
    const title = dbData[category][vIndex].title;
    dbData[category][vIndex].notes.push(getInitialTemplate(title));
    saveToDB();
    renderAll();
}

// استرجاع ملاحظة محددة للنص الافتراضي
function restoreNote(category, vIndex, nIndex) {
    if(confirm("هل تريد استرجاع النص الافتراضي لهذه الملاحظة؟")) {
        const title = dbData[category][vIndex].title;
        dbData[category][vIndex].notes[nIndex] = getInitialTemplate(title);
        saveToDB();
        renderAll();
    }
}

// حذف ملاحظة إضافية
function deleteNote(category, vIndex, nIndex) {
    if(confirm("هل أنت متأكد من حذف هذا المربع بالكامل؟")) {
        dbData[category][vIndex].notes.splice(nIndex, 1);
        saveToDB();
        renderAll();
    }
}

// إعادة ضبط كامل النظام
function resetDatabase() {
    if(confirm("هل أنت متأكد أنك تريد مسح جميع التعديلات والعودة للوضع الافتراضي؟")) {
        localStorage.removeItem('violationsDB_v2');
        location.reload();
    }
}

// توليد القوائم
function renderList(category, elementId, pointsClass) {
    const listElement = document.getElementById(elementId);
    listElement.innerHTML = ''; 
    
    dbData[category].forEach((violation, vIndex) => {
        const li = document.createElement('li');
        li.className = 'violation-item';
        
        // بناء مربعات الملاحظات
        let notesHTML = '';
        violation.notes.forEach((note, nIndex) => {
            notesHTML += `
                <div class="note-box">
                    <textarea spellcheck="false" oninput="updateText('${category}', ${vIndex}, ${nIndex}, this.value)">${note}</textarea>
                    <div class="note-actions">
                        <button class="action-btn btn-copy" onclick="copyNote(this)">نسخ</button>
                        <button class="action-btn btn-restore" onclick="restoreNote('${category}', ${vIndex}, ${nIndex})">استرجاع</button>
                        ${nIndex > 0 ? `<button class="action-btn btn-delete" onclick="deleteNote('${category}', ${vIndex}, ${nIndex})">حذف</button>` : ''}
                    </div>
                </div>
            `;
        });
        
        li.innerHTML = `
            <div class="violation-header">
                <div class="header-info">
                    <button class="add-btn" title="إضافة ملاحظة جديدة" onclick="addNote('${category}', ${vIndex})">+</button>
                    <span class="violation-title">${violation.title}</span>
                </div>
                <span class="violation-points ${pointsClass}">${violation.points}</span>
            </div>
            <div class="editor-container">
                ${notesHTML}
            </div>
        `;
        listElement.appendChild(li);
    });
}

// نسخ النص للمربع المحدد
function copyNote(button) {
    const textarea = button.parentElement.previousElementSibling;
    const textToCopy = textarea.value;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = button.innerText;
        button.innerText = "تم ✔";
        button.classList.add("success");
        
        setTimeout(() => {
            button.innerText = originalText;
            button.classList.remove("success");
        }, 2000);
    });
}

function renderAll() {
    renderList('high', 'list-high', 'points-high');
    renderList('medium', 'list-medium', 'points-medium');
    renderList('low', 'list-low', 'points-low');
}

// التشغيل
window.onload = () => {
    initDatabase();
    renderAll();
};
