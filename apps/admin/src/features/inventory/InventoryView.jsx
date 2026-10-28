import React, { useState } from 'react';
import { Boxes, Plus, Minus, AlertCircle, Check } from 'lucide-react';

export function InventoryView({ variants = [], onAdjustStock }) {
  const [modalVariant, setModalVariant] = useState(null);
  const [delta, setDelta] = useState(10);
  const [reason, setReason] = useState('RESTOCK_SHIPMENT');

  const defaultVariants =
    variants.length > 0
      ? variants
      : [
          { id: 'v-1', sku: 'NEX-HP-BLK', productName: 'Nexora Studio Pro Wireless ANC Headphones', attributes: { color: 'Matte Obsidian' }, stockQuantity: 45 },
          { id: 'v-2', sku: 'NEX-HP-SLV', productName: 'Nexora Studio Pro Wireless ANC Headphones', attributes: { color: 'Lunar Silver' }, stockQuantity: 4 },
          { id: 'v-3', sku: 'NEX-TWS-WHT', productName: 'Nexora Horizon Spatial True Wireless Earbuds', attributes: { color: 'Glacier White' }, stockQuantity: 60 },
          { id: 'v-4', sku: 'NEX-WTCH-44-TI', productName: 'Apex Horizon Titanium Smartwatch', attributes: { caseSize: '44mm' }, stockQuantity: 28 },
          { id: 'v-5', sku: 'NEX-KB-TTC', productName: 'Kinesis Artisan Mechanical Keyboard 75%', attributes: { switch: 'Tactile Kangaroo' }, stockQuantity: 40 },
          { id: 'v-6', sku: 'NEX-BP-BLK', productName: 'Vanguard 26L Weatherproof Commuter Backpack', attributes: { color: 'Stealth Black' }, stockQuantity: 50 },
        ];

  const handleOpenModal = (v) => {
    setModalVariant(v);
    setDelta(10);
    setReason('RESTOCK_SHIPMENT');
  };

  const handleSave = () => {
    if (modalVariant) {
      onAdjustStock({
        variantId: modalVariant.id,
        quantityDelta: Number(delta),
        reason,
      });
      setModalVariant(null);
    }
  };

  return (
    <div className="bg-white rounded-card border border-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-navy">Inventory & SKU Stock Control</h3>
          <p className="text-xs text-muted mt-0.5">
            Real-time multi-variant stock levels with immutable audit logs.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border text-muted uppercase tracking-wider text-[10px]">
            <tr>
              <th className="pb-3 font-semibold">SKU Identifier</th>
              <th className="pb-3 font-semibold">Product Name</th>
              <th className="pb-3 font-semibold">Variant Attributes</th>
              <th className="pb-3 font-semibold">Current Stock</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {defaultVariants.map((v) => {
              const attrs = v.attributes || {};
              const attrString = Object.entries(attrs)
                .map(([k, val]) => `${k}: ${val}`)
                .join(', ');

              return (
                <tr key={v.id} className="hover:bg-canvas transition-colors">
                  <td className="py-3.5 font-mono font-bold text-navy">{v.sku}</td>
                  <td className="py-3.5 font-semibold text-gray-900">{v.productName}</td>
                  <td className="py-3.5 text-muted">{attrString || 'Standard'}</td>
                  <td className="py-3.5 font-bold text-navy text-sm">{v.stockQuantity}</td>
                  <td className="py-3.5">
                    {v.stockQuantity <= 5 ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-warning">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <button
                      onClick={() => handleOpenModal(v)}
                      className="px-3 py-1 bg-canvas hover:bg-gray-200 text-navy font-semibold rounded-lg border border-border text-xs transition"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      {modalVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <div>
              <h4 className="text-sm font-bold text-navy">Adjust Variant Inventory</h4>
              <p className="text-xs text-muted mt-0.5">
                SKU: <strong className="text-navy">{modalVariant.sku}</strong> ({modalVariant.productName})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">
                  Quantity Change Delta (Positive or Negative)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-semibold text-navy focus:outline-none focus:ring-1 focus:ring-royal-blue"
                  />
                  <div className="text-xs text-muted">
                    New Stock: <strong>{modalVariant.stockQuantity + Number(delta)}</strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Audit Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-xl text-xs font-semibold text-navy focus:outline-none focus:ring-1 focus:ring-royal-blue"
                >
                  <option value="RESTOCK_SHIPMENT">Restock Shipment Inbound</option>
                  <option value="INVENTORY_AUDIT_CORRECTION">Inventory Audit Correction</option>
                  <option value="DAMAGED_RETURN">Damaged / Written-off Unit</option>
                  <option value="SAMPLE_ALLOCATION">Marketing / Sample Allocation</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setModalVariant(null)}
                className="px-4 py-2 text-xs font-semibold text-muted hover:text-navy"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-royal-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Apply Stock Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
