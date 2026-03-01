import apiClient from "./client";

export interface InvoiceEmailResponse {
  success: boolean;
  message: string;
  data: null;
}

export const invoiceService = {
  // Get Invoice PDF
  getInvoice: async (bookingId: number): Promise<Blob> => {
    const response = await apiClient.get(`/invoice/${bookingId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Send Invoice Email
  sendInvoiceEmail: async (bookingId: number): Promise<InvoiceEmailResponse> => {
    const response = await apiClient.post<InvoiceEmailResponse>(`/invoice/${bookingId}/send`, {});
    return response.data;
  },

  // Download Invoice PDF (helper method)
  downloadInvoice: async (bookingId: number): Promise<void> => {
    try {
      const blob = await invoiceService.getInvoice(bookingId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  },

  // Open Invoice in New Tab (helper method)
  openInvoiceInNewTab: async (bookingId: number): Promise<void> => {
    try {
      const blob = await invoiceService.getInvoice(bookingId);
      
      // Create blob URL and open in new tab
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error opening invoice:', error);
      throw error;
    }
  }
};
