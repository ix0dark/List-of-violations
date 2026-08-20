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

// دالة تهيئة وبناء قاعدة البيانات المحلية
function initDatabase() {
    const storedData = localStorage.getItem('violationsDB');
    
    if (storedData) {
        dbData = JSON.parse(storedData);
    } else {
        dbData = JSON.parse(JSON.stringify(defaultViolationsData));
        for (const category in dbData) {
            dbData[category].forEach(violation => {
                violation.text = getInitialTemplate(violation.title);
            });
        }
        localStorage.setItem('violationsDB', JSON.stringify(dbData));
    }
}

// تحديث وحفظ النص عند الكتابة
function updateText(category, index, newText) {
    dbData[category][index].text = newText;
    localStorage.setItem('violationsDB', JSON.stringify(dbData));
}

// دالة لإعادة ضبط النصوص في حال أخطأ المستخدم
function resetDatabase() {
    if(confirm("هل أنت متأكد أنك تريد مسح جميع تعديلاتك والعودة للنصوص الافتراضية؟")) {
        localStorage.removeItem('violationsDB');
        location.reload(); // تحديث الصفحة
    }
}

// دالة الطباعة في الصفحة
function renderList(category, elementId, pointsClass) {
    const listElement = document.getElementById(elementId);
    listElement.innerHTML = ''; 
    
    dbData[category].forEach((violation, index) => {
        const li = document.createElement('li');
        li.className = 'violation-item';
        
        li.innerHTML = `
            <div class="violation-header">
                <span class="violation-title">${violation.title}</span>
                <span class="violation-points ${pointsClass}">${violation.points}</span>
            </div>
            <div class="editor-container">
                <textarea spellcheck="false" oninput="updateText('${category}', ${index}, this.value)">${violation.text}</textarea>
                <button class="copy-btn" onclick="copyText(this)">نسخ المخالفة</button>
            </div>
        `;
        listElement.appendChild(li);
    });
}

// نسخ النص
function copyText(button) {
    const textarea = button.previousElementSibling;
    const textToCopy = textarea.value;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = button.innerText;
        button.innerText = "تم النسخ بنجاح ✔";
        button.classList.add("success");
        
        setTimeout(() => {
            button.innerText = originalText;
            button.classList.remove("success");
        }, 2000);
    });
}

// التشغيل عند فتح الصفحة
window.onload = () => {
    initDatabase();
    renderList('high', 'list-high', 'points-high');
    renderList('medium', 'list-medium', 'points-medium');
    renderList('low', 'list-low', 'points-low');
};