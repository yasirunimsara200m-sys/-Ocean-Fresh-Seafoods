import React from 'react';
import { Order } from '../types';
import { Printer, X } from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
  mode?: 'customer' | 'dispatch';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose, mode = 'customer' }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusLabel: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <>
      {/* ── MODAL OVERLAY (Only visible on screen, completely hidden during print) ── */}
      <div className="no-print fixed inset-0 z-[100] overflow-y-auto flex items-start justify-center p-4 sm:p-8 bg-slate-950/80 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto">
          {/* Modal action bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {mode === 'dispatch' ? 'Dispatch Invoice — Rider Copy' : 'Order Invoice'}
              </p>
              <p className="text-sm font-black text-slate-900">{order.order_number}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{mode === 'dispatch' ? 'Print Dispatch Copy' : 'Print / Save as PDF'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Screen preview container */}
          <div className="max-h-[75vh] overflow-y-auto p-4 bg-slate-100 flex justify-center">
            <div className="w-full">
              <InvoiceContent order={order} mode={mode} invoiceDate={invoiceDate} statusLabel={statusLabel} />
            </div>
          </div>
        </div>
      </div>

      {/* ── PRINT-ONLY ELEMENT (Mounted directly at document root level for clean browser print) ── */}
      <div id="print-mount" className="print-only">
        <InvoiceContent order={order} mode={mode} invoiceDate={invoiceDate} statusLabel={statusLabel} />
      </div>
    </>
  );
};

// Extracted invoice content component
const InvoiceContent: React.FC<{
  order: Order;
  mode: 'customer' | 'dispatch';
  invoiceDate: string;
  statusLabel: Record<string, string>;
}> = ({ order, mode, invoiceDate, statusLabel }) => {
  return (
    <div
      style={{ fontFamily: 'Georgia, serif' }}
      className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm text-slate-900 w-full"
    >
              {/* ── Letterhead ── */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-cyan-700">
                <div>
                  {/* Logo / brand */}
                  <div className="flex items-baseline space-x-1 mb-1">
                    <span className="text-2xl font-black text-cyan-700 tracking-tight">
                      OCEAN FRESH
                    </span>
                    <span className="text-base font-semibold text-slate-600">Seafoods (Pvt) Ltd.</span>
                  </div>
                  <p className="text-xs text-slate-500">304/A, Godagama Road, Athurugiriya</p>
                  <p className="text-xs text-slate-500">Tel: +94 72 342 6084 &nbsp;|&nbsp; orders@oceanfresh.lk</p>
                  <p className="text-xs text-slate-500">Online Delivery Only — No Walk-in Store</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {mode === 'dispatch' ? 'DISPATCH INVOICE' : 'CUSTOMER INVOICE'}
                  </p>
                  <p className="text-xl font-black text-cyan-700">#{order.order_number}</p>
                  <p className="text-xs text-slate-500 mt-1">Date: {invoiceDate}</p>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      order.order_status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.order_status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {statusLabel[order.order_status] || order.order_status}
                  </span>
                </div>
              </div>

              {/* ── Bill To / Delivery Details ── */}
              <div className="grid grid-cols-2 gap-6 mt-6 text-xs">
                <div>
                  <p className="font-bold uppercase tracking-widest text-slate-400 mb-2 text-[10px]">
                    Billed To
                  </p>
                  <p className="font-bold text-sm text-slate-900">{order.customer_name}</p>
                  <p className="text-slate-600">{order.customer_phone}</p>
                  {order.customer_email && (
                    <p className="text-slate-600">{order.customer_email}</p>
                  )}
                </div>
                <div>
                  <p className="font-bold uppercase tracking-widest text-slate-400 mb-2 text-[10px]">
                    Delivery Address
                  </p>
                  <p className="font-bold text-sm text-slate-900">{order.delivery_address}</p>
                  <p className="text-slate-600">{order.delivery_city}</p>
                  {order.delivery_date && (
                    <p className="text-slate-600 mt-1">
                      Delivery Date: <strong>{order.delivery_date}</strong>
                      {order.delivery_time_slot && ` • ${order.delivery_time_slot}`}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Items Table ── */}
              <div className="mt-6">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider">
                      <th className="text-left py-2.5 px-3 rounded-l-lg font-bold">Item</th>
                      <th className="text-left py-2.5 px-3 font-bold">Variant / Cut</th>
                      <th className="text-center py-2.5 px-3 font-bold">Qty</th>
                      <th className="text-right py-2.5 px-3 font-bold">Unit Price</th>
                      <th className="text-right py-2.5 px-3 rounded-r-lg font-bold">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="text-slate-800">
                        <td className="py-3 px-3 font-semibold">{item.name}</td>
                        <td className="py-3 px-3 text-slate-500">
                          {item.variant_name || item.weight || '—'}
                        </td>
                        <td className="py-3 px-3 text-center">{item.quantity}</td>
                        <td className="py-3 px-3 text-right">
                          Rs.&nbsp;{item.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-bold">
                          Rs.&nbsp;{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Totals ── */}
              <div className="mt-4 border-t border-slate-200 pt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>Rs.&nbsp;{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>
                    {order.delivery_fee === 0
                      ? 'FREE'
                      : `Rs.\u00a0${order.delivery_fee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-200 pt-3 mt-1">
                  <span>Grand Total Due (Cash on Delivery)</span>
                  <span className="text-cyan-700">Rs.&nbsp;{order.total_amount.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  Payment Method: <strong className="uppercase">{order.payment_method || 'COD'}</strong> &nbsp;|&nbsp; Payment Status:{' '}
                  <strong className="uppercase">{order.payment_status}</strong>
                </p>
              </div>

              {/* ── Special Notes ── */}
              {order.special_notes && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <p className="font-bold text-amber-900 mb-0.5">Special Notes:</p>
                  <p className="text-amber-800">{order.special_notes}</p>
                </div>
              )}

              {/* ── Footer ── */}
              <div className="mt-8 pt-5 border-t-2 border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">
                  Thank you for choosing Ocean Fresh Seafoods (Pvt) Ltd.!
                </p>
                <p>Fresh from the ocean, delivered to your door. 🐟</p>
                {mode === 'dispatch' && (
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-300 text-left space-y-3">
                    <p className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">
                      — Delivery Rider Copy —
                    </p>
                    <p className="text-slate-600">
                      Please collect <strong>Rs.&nbsp;{order.total_amount.toLocaleString()}</strong> in cash from the customer upon delivery and obtain their signature below.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-8">
                      <div>
                        <div className="border-b border-slate-400 pb-1 mb-1">&nbsp;</div>
                        <p className="text-[10px] text-slate-500">Customer Signature</p>
                      </div>
                      <div>
                        <div className="border-b border-slate-400 pb-1 mb-1">&nbsp;</div>
                        <p className="text-[10px] text-slate-500">Rider Signature / Date</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
  );
};
