import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Define public path
const publicReceiptsDir = path.join(process.cwd(), 'public', 'receipts');

// Ensure directory exists
if (!fs.existsSync(publicReceiptsDir)) {
  fs.mkdirSync(publicReceiptsDir, { recursive: true });
}

export async function generateReceiptPDF(order, studentName, studentEmail) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([550, 750]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Title banner
    page.drawRectangle({
      x: 0,
      y: 680,
      width: 550,
      height: 70,
      color: rgb(0.427, 0.211, 0.423) // Vedantu purple
    });

    page.drawText('NOTEPEDIAX INVOICE RECEIPT', {
      x: 35,
      y: 708,
      size: 18,
      font: boldFont,
      color: rgb(1, 1, 1)
    });

    page.drawText(`Invoice No: ${order.orderNumber}`, {
      x: 35,
      y: 692,
      size: 10,
      font: font,
      color: rgb(0.9, 0.9, 0.9)
    });

    // Company & Billing Details
    page.drawText('Seller:', { x: 35, y: 640, size: 11, font: boldFont });
    page.drawText('Notepediax Edtech Private Limited', { x: 35, y: 624, size: 9, font: font });
    page.drawText(`GSTIN: ${process.env.GST_NUMBER || '29AAACN0213F1ZD'}`, { x: 35, y: 610, size: 9, font: font });
    page.drawText('Support: billing@notepediax.com', { x: 35, y: 596, size: 9, font: font });

    page.drawText('Customer Billing:', { x: 300, y: 640, size: 11, font: boldFont });
    page.drawText(studentName, { x: 300, y: 624, size: 9, font: font });
    page.drawText(studentEmail, { x: 300, y: 610, size: 9, font: font });
    page.drawText(`Payment Method: UPI (${order.payment?.studentUpiApp || 'Mobile App'})`, { x: 300, y: 596, size: 9, font: font });

    // Table Header
    page.drawRectangle({
      x: 35,
      y: 535,
      width: 480,
      height: 25,
      color: rgb(0.95, 0.95, 0.95)
    });

    page.drawText('Item Description', { x: 45, y: 543, size: 9, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
    page.drawText('Type', { x: 320, y: 543, size: 9, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
    page.drawText('Price (INR)', { x: 440, y: 543, size: 9, font: boldFont, color: rgb(0.2, 0.2, 0.2) });

    let yOffset = 515;
    order.items.forEach((item, index) => {
      page.drawText(`${index + 1}. ${item.title}`, { x: 45, y: yOffset, size: 9, font: font });
      page.drawText(item.itemType === 'course' ? 'Masterclass' : 'E-Book Note', { x: 320, y: yOffset, size: 9, font: font });
      page.drawText(`INR ${item.price.toFixed(2)}`, { x: 440, y: yOffset, size: 9, font: font });
      yOffset -= 20;
    });

    // Totals Ledger Section
    yOffset -= 15;
    page.drawRectangle({
      x: 350,
      y: yOffset - 75,
      width: 165,
      height: 80,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1
    });

    const subtotalText = `Subtotal: INR ${order.subtotal.toFixed(2)}`;
    const discountText = `Discount: -INR ${(order.discountAmount || 0).toFixed(2)}`;
    const gstText = `GST (18%): +INR ${order.gstAmount.toFixed(2)}`;
    const totalText = `Total Paid: INR ${order.totalAmount.toFixed(2)}`;

    page.drawText(subtotalText, { x: 360, y: yOffset - 15, size: 8, font: font });
    page.drawText(discountText, { x: 360, y: yOffset - 30, size: 8, font: font });
    page.drawText(gstText, { x: 360, y: yOffset - 45, size: 8, font: font });
    page.drawText(totalText, { x: 360, y: yOffset - 65, size: 10, font: boldFont, color: rgb(0.85, 0.35, 0.15) });

    // Footer info
    page.drawText('Thank you for purchasing study resources from Notepediax.', {
      x: 35,
      y: 80,
      size: 9,
      font: italicizeFont(font), // standard font since we embed basic
      color: rgb(0.4, 0.4, 0.4)
    });
    page.drawText('This is a computer generated invoice and requires no physical signature authorization.', {
      x: 35,
      y: 65,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });

    const pdfBytes = await pdfDoc.save();
    
    // Save to local file
    const filePath = path.join(publicReceiptsDir, `${order.orderNumber}.pdf`);
    fs.writeFileSync(filePath, pdfBytes);
    
    // Return relative public URL
    return `/public/receipts/${order.orderNumber}.pdf`;
  } catch (err) {
    console.error('Error generating invoice receipt:', err);
    return '';
  }
}

// Simple fallback helper since we don't have separate italic fonts embedded
function italicizeFont(font) {
  return font;
}
