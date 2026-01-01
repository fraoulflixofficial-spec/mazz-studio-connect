import { jsPDF } from 'jspdf';
import { Order } from '@/types';

// PDF-safe price formatter - uses "Tk" instead of ৳ since jsPDF default fonts don't support Bengali characters
const formatPricePdf = (price: number): string => {
  return `Tk ${price.toLocaleString('en-BD')}`;
};

export function exportOrderToPdf(order: Order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  const leftMargin = 20;
  const rightMargin = pageWidth - 20;

  // Helper functions
  const addText = (text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: 'normal' | 'bold'; color?: [number, number, number]; align?: 'left' | 'center' | 'right' }) => {
    const { fontSize = 12, fontStyle = 'normal', color = [0, 0, 0], align = 'left' } = options || {};
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    
    let xPos = x;
    if (align === 'center') xPos = pageWidth / 2;
    if (align === 'right') xPos = rightMargin;
    
    doc.text(text, xPos, y, { align });
    return y + (fontSize * 0.5);
  };

  const addLine = (y: number, color: [number, number, number] = [200, 200, 200]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(leftMargin, y, rightMargin, y);
    return y + 5;
  };

  // Header
  addText('MAZZE STUDIO', 0, yPos, { fontSize: 24, fontStyle: 'bold', align: 'center', color: [30, 58, 138] });
  yPos += 8;
  addText('Order Confirmation', 0, yPos, { fontSize: 14, align: 'center', color: [100, 100, 100] });
  yPos += 15;

  // Order Info Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(leftMargin, yPos - 5, pageWidth - 40, 30, 3, 3, 'F');
  
  addText('Tracking Code:', leftMargin + 5, yPos + 5, { fontSize: 10, color: [100, 100, 100] });
  addText(`#${order.id}`, leftMargin + 5, yPos + 12, { fontSize: 14, fontStyle: 'bold', color: [30, 58, 138] });
  
  addText('Order Date:', rightMargin - 60, yPos + 5, { fontSize: 10, color: [100, 100, 100] });
  addText(new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }), rightMargin - 60, yPos + 12, { fontSize: 11, fontStyle: 'bold' });
  
  addText('Status:', rightMargin - 60, yPos + 20, { fontSize: 10, color: [100, 100, 100] });
  const statusColor: [number, number, number] = order.status === 'confirmed' ? [34, 197, 94] : 
                      order.status === 'delivered' ? [34, 197, 94] : [245, 158, 11];
  addText(order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' '), rightMargin - 60, yPos + 27, { fontSize: 11, fontStyle: 'bold', color: statusColor });
  
  yPos += 40;

  // Customer Information
  addText('Customer Information', leftMargin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 8;
  yPos = addLine(yPos);
  
  addText('Name:', leftMargin, yPos, { fontSize: 10, color: [100, 100, 100] });
  addText(order.customerName, leftMargin + 35, yPos, { fontSize: 11 });
  yPos += 7;
  
  addText('Phone:', leftMargin, yPos, { fontSize: 10, color: [100, 100, 100] });
  addText(order.phone, leftMargin + 35, yPos, { fontSize: 11 });
  yPos += 7;
  
  if ((order as any).email) {
    addText('Email:', leftMargin, yPos, { fontSize: 10, color: [100, 100, 100] });
    addText((order as any).email, leftMargin + 35, yPos, { fontSize: 11 });
    yPos += 7;
  }
  
  addText('Address:', leftMargin, yPos, { fontSize: 10, color: [100, 100, 100] });
  const addressLines = doc.splitTextToSize(order.address, pageWidth - 80);
  doc.setFontSize(11);
  doc.text(addressLines, leftMargin + 35, yPos);
  yPos += (addressLines.length * 5) + 5;
  
  // Delivery Zone
  const deliveryZoneLabel = order.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';
  addText('Delivery:', leftMargin, yPos, { fontSize: 10, color: [100, 100, 100] });
  addText(deliveryZoneLabel, leftMargin + 35, yPos, { fontSize: 11 });
  yPos += 10;

  // Order Items
  addText('Order Items', leftMargin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 8;
  yPos = addLine(yPos);

  // Table Header
  doc.setFillColor(245, 245, 245);
  doc.rect(leftMargin, yPos - 4, pageWidth - 40, 10, 'F');
  addText('Product', leftMargin + 5, yPos + 2, { fontSize: 10, fontStyle: 'bold', color: [60, 60, 60] });
  addText('Qty', pageWidth - 70, yPos + 2, { fontSize: 10, fontStyle: 'bold', color: [60, 60, 60] });
  addText('Price', rightMargin - 5, yPos + 2, { fontSize: 10, fontStyle: 'bold', color: [60, 60, 60], align: 'right' });
  yPos += 12;

  // Table Rows
  let subtotal = 0;
  order.items.forEach((item) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    
    const productNameLines = doc.splitTextToSize(item.productName, 90);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(productNameLines, leftMargin + 5, yPos);
    
    addText(`x${item.qty}`, pageWidth - 65, yPos, { fontSize: 10 });
    addText(formatPricePdf(itemTotal), rightMargin - 5, yPos, { fontSize: 10, align: 'right' });
    
    yPos += (productNameLines.length * 5) + 2;
    
    // Show warranty if present
    if (item.warranty) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`Warranty: ${item.warranty}`, leftMargin + 5, yPos);
      yPos += 5;
    }
    
    yPos += 3;
    
    // Light separator
    doc.setDrawColor(230, 230, 230);
    doc.line(leftMargin + 5, yPos - 2, rightMargin - 5, yPos - 2);
  });

  yPos += 5;

  // Order Summary - Use order's subtotal and deliveryCharge if available, otherwise calculate
  const orderSubtotal = order.subtotal ?? subtotal;
  const orderDeliveryCharge = order.deliveryCharge ?? 0;
  
  // Calculate box height based on whether coupon is applied
  const hasCoupon = order.appliedCoupon;
  const summaryBoxHeight = hasCoupon ? 65 : 45;
  
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(pageWidth - 100, yPos, 80, summaryBoxHeight, 3, 3, 'F');

  let summaryY = yPos + 10;
  
  addText('Subtotal:', pageWidth - 95, summaryY, { fontSize: 10, color: [100, 100, 100] });
  addText(formatPricePdf(orderSubtotal), rightMargin - 5, summaryY, { fontSize: 10, align: 'right' });
  summaryY += 10;

  addText('Delivery:', pageWidth - 95, summaryY, { fontSize: 10, color: [100, 100, 100] });
  addText(formatPricePdf(orderDeliveryCharge), rightMargin - 5, summaryY, { fontSize: 10, align: 'right' });
  summaryY += 10;
  
  // Show coupon discount if applied
  if (hasCoupon) {
    const couponLabel = order.appliedCoupon!.type === 'price_reduction' ? 'Price Discount:' : 'Delivery Discount:';
    addText(couponLabel, pageWidth - 95, summaryY, { fontSize: 10, color: [34, 197, 94] });
    addText(`-${formatPricePdf(order.appliedCoupon!.discountAmount)}`, rightMargin - 5, summaryY, { fontSize: 10, align: 'right', color: [34, 197, 94] });
    summaryY += 10;
  }

  doc.setDrawColor(180, 180, 180);
  doc.line(pageWidth - 95, summaryY - 4, rightMargin - 5, summaryY - 4);

  addText('Total:', pageWidth - 95, summaryY + 5, { fontSize: 12, fontStyle: 'bold' });
  addText(formatPricePdf(order.total), rightMargin - 5, summaryY + 5, { fontSize: 12, fontStyle: 'bold', color: [30, 58, 138], align: 'right' });

  yPos += summaryBoxHeight + 10;
  
  // Show Applied Coupon Code
  if (hasCoupon) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(leftMargin, yPos, pageWidth - 40, 20, 3, 3, 'F');
    addText('Coupon Applied:', leftMargin + 5, yPos + 8, { fontSize: 10, color: [34, 197, 94] });
    addText(order.appliedCoupon!.code, leftMargin + 50, yPos + 8, { fontSize: 10, fontStyle: 'bold', color: [34, 197, 94] });
    const typeLabel = order.appliedCoupon!.type === 'price_reduction' ? 'Price Reduction' : 
                      order.appliedCoupon!.type === 'free_delivery_inside' ? 'Free Delivery (Inside Dhaka)' : 'Free Delivery (Outside Dhaka)';
    addText(typeLabel, leftMargin + 5, yPos + 15, { fontSize: 8, color: [100, 100, 100] });
    yPos += 25;
  }

  // Notes
  if (order.notes) {
    addText('Delivery Notes', leftMargin, yPos, { fontSize: 12, fontStyle: 'bold' });
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const notesLines = doc.splitTextToSize(order.notes, pageWidth - 40);
    doc.text(notesLines, leftMargin, yPos);
    yPos += (notesLines.length * 5) + 10;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(leftMargin, footerY - 10, rightMargin, footerY - 10);
  addText('Thank you for shopping with Mazze Studio!', 0, footerY, { fontSize: 10, align: 'center', color: [100, 100, 100] });
  addText('For support, contact us via WhatsApp', 0, footerY + 5, { fontSize: 8, align: 'center', color: [150, 150, 150] });

  // Save the PDF
  doc.save(`Order_${order.id}.pdf`);
}