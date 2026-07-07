import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportService = {
  /**
   * Export JSON array of objects to CSV file
   */
  exportCSV: (data: Record<string, any>[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    exportService.triggerDownload(blob, `${filename}.csv`);
  },

  /**
   * Export GeoJSON object to download
   */
  exportGeoJSON: (geojson: object, filename: string) => {
    const jsonString = JSON.stringify(geojson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    exportService.triggerDownload(blob, `${filename}.geojson`);
  },

  /**
   * Export a page element or map canvas to a PNG image
   */
  exportPNG: async (elementId: string, filename: string = 'gis_dashboard_export'): Promise<string | null> => {
    const el = document.getElementById(elementId);
    if (!el) {
      console.error(`Element with id ${elementId} not found.`);
      return null;
    }

    try {
      // Find leaflet tiles and make sure they allow CORS
      const mapCanvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#08111F',
      });
      const dataUrl = mapCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filename}.png`;
      link.click();
      return dataUrl;
    } catch (e) {
      console.error('Error generating map canvas export', e);
      return null;
    }
  },

  /**
   * Export a dashboard or analytics section to PDF report
   */
  exportPDF: async (title: string, elementId: string, filename: string = 'gis_report'): Promise<void> => {
    const el = document.getElementById(elementId);
    if (!el) {
      console.error(`Element with id ${elementId} not found.`);
      return;
    }

    try {
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#08111F',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 page width in mm
      const pageHeight = 295; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Header block
      pdf.setFillColor(8, 17, 31); // #08111F
      pdf.rect(0, 0, 210, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(title, 10, 13);
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Exported: ${new Date().toLocaleDateString()}`, 160, 13);

      position = 22; // Offset for header
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
    } catch (e) {
      console.error('Error rendering PDF', e);
    }
  },

  /**
   * Generic trigger download blob utility
   */
  triggerDownload: (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default exportService;
