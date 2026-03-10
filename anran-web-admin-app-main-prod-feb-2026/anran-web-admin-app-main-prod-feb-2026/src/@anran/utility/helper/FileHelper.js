import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';

export const downloadPdf = (
  noDownload = false,
  addWaterMark = false,
  elementName = 'pdfdiv',
  fileName = 'Invoice.pdf',
) => {
  console.log('fileName', fileName);
  const input = document.getElementById(elementName);
  const result = html2canvas(input, {
    dpi: 300,
    letterRendering: true,
    allowTaint: false,
    useCORS: true,
  }).then((canvas) => {
    const doc = new JsPDF('p', 'mm', 'a4');
    const imgWidth = 200;
    const pageHeight = 290;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 5;

    const img = canvas.toDataURL('image/jpeg');

    doc.addImage(img, 'JPEG', 3, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(img, 'JPEG', 3, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    if (!noDownload) {
      if (addWaterMark) {
        //finally call the watermark
        let doc1 = addWaterMarkText(doc);
        doc1.save(fileName);
      } else {
        doc.save(fileName);
      }
    }
    return doc.output('blob');
  });

  return result;
};

function addWaterMarkText(doc) {
  var totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    //doc.addImage(imgData, 'PNG', 40, 40, 75, 75);
    doc.setTextColor(150);
    doc.text(50, doc.internal.pageSize.height - 230, 'Watermark');
  }

  return doc;
}
