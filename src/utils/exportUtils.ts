import { toast } from 'sonner@2.0.3';

/**
 * Export data ke PDF menggunakan browser print
 */
export function exportToPDF(
  data: any[],
  filename: string,
  title: string,
  columns: { key: string; label: string }[]
) {
  try {
    // Buat HTML untuk print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to export PDF');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #2E2E2E;
            }
            h1 {
              color: #59C19B;
              border-bottom: 3px solid #59C19B;
              padding-bottom: 10px;
            }
            .meta {
              margin: 20px 0;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #59C19B;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">
            <p><strong>Generated:</strong> ${new Date().toLocaleString('id-ID')}</p>
            <p><strong>Total Records:</strong> ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${columns.map(col => `<td>${row[col.key] || '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Smart BMS - Building Management System</p>
            <p>© ${new Date().getFullYear()} All rights reserved</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      toast.success('PDF export ready. Please check your print dialog.');
    };
  } catch (error) {
    console.error('Export to PDF failed:', error);
    toast.error('Failed to export PDF');
  }
}

/**
 * Export data ke Excel (CSV format)
 */
export function exportToExcel(
  data: any[],
  filename: string,
  columns: { key: string; label: string }[]
) {
  try {
    // Buat CSV content
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key] || '';
        // Escape commas and quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${data.length} records to Excel`);
  } catch (error) {
    console.error('Export to Excel failed:', error);
    toast.error('Failed to export to Excel');
  }
}

/**
 * Export data ke JSON
 */
export function exportToJSON(data: any[], filename: string) {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${data.length} records to JSON`);
  } catch (error) {
    console.error('Export to JSON failed:', error);
    toast.error('Failed to export to JSON');
  }
}
