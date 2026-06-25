/**
 * كود Google Apps Script المحدث والشامل (يدعم استقبال طلبات GET و POST)
 * 
 * هذا الكود يضمن عمل الربط بنجاح بنسبة 100% حتى أثناء الاختبار المحلي
 * لصفحة الهبوط كملف على حاسوبك (File Protocol file:///) دون أي مشاكل متعلقة بـ CORS.
 * 
 * طريقة التركيب:
 * 1. افتح جدول بيانات Google Sheet الخاص بك.
 * 2. اضغط على "Extensions" (الإضافات) ثم اختر "Apps Script".
 * 3. امسح أي كود موجود في المحرر وضع هذا الكود الجديد مكانه.
 * 4. اضغط على زر الحفظ (أيقونة القرص).
 * 5. اضغط على "Deploy" (نشر) في الأعلى ثم اختر "New deployment" (نشر جديد).
 * 6. اضغط على أيقونة الترس بجانب "Select type" واختر "Web app" (تطبيق ويب).
 * 7. قم بتهيئة الخيارات كالتالي:
 *    - Description: اكتب وصف جديد (مثال: الربط المطور بالمدينة والحي).
 *    - Execute as: اختر "Me (بريدك الإلكتروني)".
 *    - Who has access: اختر "Anyone" (أي شخص) - خطوة إجبارية!
 * 8. اضغط على "Deploy" (نشر).
 * 9. امنح الصلاحيات المطلوبة عبر الضغط على "Authorize Access" ثم "Advanced" ثم "Go to Untitled project" ثم "Allow".
 * 10. تأكد من أن معرّف النشر (Deployment ID) في رابط النشر يطابق المعرّف الخاص بك في صفحة الهبوط.
 */

// معالجة طلبات الـ GET (تستخدم لتخطي حظر المتصفحات للملفات المحلية)
function doGet(e) {
  return handleRequest(e);
}

// معالجة طلبات الـ POST (تستخدم عند رفع الصفحة على استضافة ويب حقيقية)
function doPost(e) {
  return handleRequest(e);
}

// الدالة الموحدة لمعالجة وتخزين البيانات
function handleRequest(e) {
  // تفعيل إمكانية القفل لمنع تداخل البيانات عند الطلبات المتزامنة
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // الانتظار لمدة 10 ثوانٍ كحد أقصى
  
  try {
    // فتح جدول البيانات النشط
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    
    // إنشاء سطر العناوين الرئيسي إذا كان الجدول فارغاً
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["التاريخ والوقت", "الاسم الكامل", "رقم الهاتف", "المدينة", "الحي / المنطقة", "المقاس", "تشكيلة الألوان", "الملاحظات", "طريقة الطلب"]);
    }
    
    // استخراج المعاملات المرسلة سواء كانت في الـ GET (رابط الاستعلام) أو الـ POST (الاستمارة)
    var date = e.parameter.date || new Date().toLocaleString('ar-MA');
    var fullname = e.parameter.fullname || "";
    var phone = e.parameter.phone || "";
    var city = e.parameter.city || "";
    var district = e.parameter.district || "";
    var size = e.parameter.size || "";
    var colorCombo = e.parameter.colorCombo || "";
    var notes = e.parameter.notes || "لا توجد ملاحظات";
    var submitType = e.parameter.submitType || "";
    
    // إضافة البيانات كصف جديد في الجدول
    sheet.appendRow([date, fullname, phone, city, district, size, colorCombo, notes, submitType]);
    
    // إرجاع رد ناجح بصيغة JSON
    return ContentService.createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // إرجاع رسالة الخطأ
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } finally {
    // فتح القفل لاستقبال طلب جديد
    lock.releaseLock();
  }
}
