'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface Payment {
  id: string;
  description: string;
  amount: number;
  status: string;
  reference: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export default function PaymentInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  async function fetchPayment() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPayment(id);
      if (data.data) {
        setPayment(data.data);
      } else {
        setError('Payment not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment');
    } finally {
      setLoading(false);
    }
  }

  function printInvoice() {
    window.print();
  }

  function downloadInvoice() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The invoice you are looking for does not exist.'}</p>
          <Link href="/student/payments" className="text-primary-600 hover:underline">
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  const invoiceDate = new Date(payment.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dueDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Pending';

  const subtotal = payment.amount;
  const discount = 0;
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 no-print">
          <Link
            href="/student/payments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Link>
          <button
            onClick={printInvoice}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button
            onClick={downloadInvoice}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        <div className="invoice">
          {/* HEADER */}
          <div className="invoice-header">
            <div className="brand">
              <div className="logo">E</div>
              <div>
                <h2>EDWARDIAN</h2>
                <span>EDUCATIONAL CONSULT</span>
              </div>
            </div>
            <div className="invoice-title">
              <h1>INVOICE</h1>
              <p>#{payment.reference}</p>
            </div>
          </div>

          {/* CLIENT INFORMATION */}
          <div className="invoice-info">
            <div>
              <small>INVOICE TO</small>
              <h3>{payment.user.fullName}</h3>
              <p>Student / Client</p>
              <p>{payment.user.phone || payment.user.email}</p>
              <p>{payment.user.email}</p>
            </div>
            <div className="details">
              <div>
                <span>Invoice Date</span>
                <strong>{invoiceDate}</strong>
              </div>
              <div>
                <span>Due Date</span>
                <strong>{dueDate}</strong>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <table className="items">
            <thead>
              <tr>
                <th>#</th>
                <th>DESCRIPTION</th>
                <th>QTY</th>
                <th>PRICE</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01</td>
                <td>
                  <strong>{payment.description}</strong>
                  <small>Payment for services rendered</small>
                </td>
                <td>1</td>
                <td>₦{payment.amount.toLocaleString()}</td>
                <td>₦{payment.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* BOTTOM SECTION */}
          <div className="bottom-section">
            <div className="payment">
              <h4>PAYMENT INFORMATION</h4>
              <p>
                <strong>Payment Method:</strong> {payment.paymentMethod.replace(/_/g, ' ')}
              </p>
              <p>
                <strong>Reference:</strong> {payment.reference}
              </p>
              <p>
                <strong>Status:</strong> {payment.status}
              </p>
              <div className="thank-you">
                Thank you for choosing <strong>Edwardian Educational Consult.</strong>
              </div>
            </div>
            <div className="totals">
              <div>
                <span>Subtotal</span>
                <strong>₦{subtotal.toLocaleString()}</strong>
              </div>
              <div>
                <span>Discount</span>
                <strong>₦{discount.toLocaleString()}</strong>
              </div>
              <div className="grand-total">
                <span>TOTAL</span>
                <strong>₦{total.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="invoice-footer">
            <div>
              <span>☎</span>
              0800 000 0000
            </div>
            <div>
              <span>✉</span>
              info@edwardianeducational.com
            </div>
            <div>
              <span>⌂</span>
              Lagos, Nigeria
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Inter", Arial, sans-serif;
          background: #eee8e1;
          color: #3b3029;
          padding: 40px 20px;
        }

        .invoice {
          width: 800px;
          max-width: 100%;
          margin: auto;
          background: #ffffff;
          box-shadow: 0 15px 40px rgba(62, 42, 28, 0.15);
          overflow: hidden;
        }

        .invoice-header {
          background: #70452d;
          color: white;
          padding: 32px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 48px;
          height: 48px;
          border: 2px solid #e9c7a7;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 25px;
          font-weight: 800;
          color: #f4dcc7;
        }

        .brand h2 {
          font-size: 19px;
          letter-spacing: 1px;
          font-weight: 800;
        }

        .brand span {
          display: block;
          font-size: 8px;
          letter-spacing: 1.5px;
          margin-top: 3px;
          color: #e9c7a7;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h1 {
          font-size: 30px;
          letter-spacing: 2px;
        }

        .invoice-title p {
          font-size: 11px;
          margin-top: 4px;
          color: #e9c7a7;
        }

        .invoice-info {
          padding: 30px 40px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e8ded6;
        }

        .invoice-info small {
          color: #98745b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .invoice-info h3 {
          margin-top: 7px;
          font-size: 16px;
          color: #3b3029;
        }

        .invoice-info p {
          font-size: 10px;
          color: #806f64;
          margin-top: 4px;
        }

        .details {
          text-align: right;
        }

        .details div {
          margin-bottom: 12px;
        }

        .details span {
          display: block;
          color: #98745b;
          font-size: 9px;
          margin-bottom: 4px;
        }

        .details strong {
          font-size: 10px;
          color: #3b3029;
        }

        .items {
          width: calc(100% - 80px);
          margin: 25px 40px;
          border-collapse: collapse;
        }

        .items thead {
          background: #f1e7df;
        }

        .items th {
          padding: 12px 10px;
          text-align: left;
          font-size: 9px;
          color: #70452d;
          letter-spacing: .5px;
        }

        .items th:nth-child(1),
        .items td:nth-child(1) {
          width: 40px;
        }

        .items th:nth-child(3),
        .items td:nth-child(3) {
          text-align: center;
          width: 60px;
        }

        .items th:nth-child(4),
        .items td:nth-child(4),
        .items th:nth-child(5),
        .items td:nth-child(5) {
          text-align: right;
        }

        .items td {
          padding: 13px 10px;
          border-bottom: 1px solid #eee7e2;
          font-size: 10px;
        }

        .items td strong {
          display: block;
          font-size: 10px;
          color: #49372b;
        }

        .items td small {
          display: block;
          font-size: 8px;
          color: #9b8b80;
          margin-top: 3px;
        }

        .bottom-section {
          padding: 10px 40px 30px;
          display: flex;
          justify-content: space-between;
        }

        .payment {
          width: 55%;
        }

        .payment h4 {
          color: #70452d;
          font-size: 10px;
          letter-spacing: .8px;
          margin-bottom: 10px;
        }

        .payment p {
          font-size: 9px;
          color: #806f64;
          margin-bottom: 5px;
        }

        .payment p strong {
          color: #4a392e;
        }

        .thank-you {
          margin-top: 20px;
          padding: 13px 15px;
          background: #f5eee8;
          border-left: 3px solid #70452d;
          color: #806f64;
          font-size: 9px;
          line-height: 1.6;
        }

        .thank-you strong {
          color: #70452d;
        }

        .totals {
          width: 220px;
        }

        .totals div {
          display: flex;
          justify-content: space-between;
          padding: 7px 0;
          font-size: 10px;
          color: #806f64;
        }

        .totals strong {
          color: #49372b;
        }

        .totals .grand-total {
          margin-top: 8px;
          padding: 13px 14px;
          background: #70452d;
          color: white;
        }

        .totals .grand-total span,
        .totals .grand-total strong {
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .invoice-footer {
          background: #4b3022;
          color: #ead8ca;
          padding: 17px 40px;
          display: flex;
          justify-content: space-between;
          font-size: 8px;
        }

        .invoice-footer div {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .invoice-footer span {
          color: #e4b993;
          font-size: 12px;
        }

        @media (max-width: 600px) {
          body {
            padding: 15px 8px;
          }
          .invoice-header {
            padding: 25px 20px;
          }
          .invoice-info {
            padding: 25px 20px;
            gap: 20px;
          }
          .invoice-info,
          .bottom-section {
            flex-direction: column;
          }
          .details {
            text-align: left;
          }
          .items {
            width: calc(100% - 40px);
            margin: 20px;
          }
          .items th,
          .items td {
            padding: 9px 5px;
            font-size: 8px;
          }
          .payment,
          .totals {
            width: 100%;
          }
          .totals {
            margin-top: 25px;
          }
          .invoice-footer {
            padding: 15px 20px;
            flex-direction: column;
            gap: 8px;
          }
          .brand h2 {
            font-size: 14px;
          }
          .invoice-title h1 {
            font-size: 22px;
          }
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }
          .invoice {
            width: 100%;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
