import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';

import SimpleCalendar from '../components/SimpleCalendar';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import { formatISODate, getMonthRange } from '../lib/dates';
import {
 bulkCreateSlots,
 createSlot,
 deleteSlot,
 getListingSlots,
 getListings,
 type VendorListing,
 type VendorTimeSlot,
} from '../lib/api';

function addMinutesToTime(time: string, minutes: number): string {
 const [h, m] = time.split(':').map(Number);
 const d = new Date();
 d.setHours(h, m + minutes, 0, 0);
 return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;
}

export default function CalendarPage() {
 const [listings, setListings] = useState<VendorListing[]>([]);
 const [selectedListingId, setSelectedListingId] = useState<number | ''>('');
 const [currentDate, setCurrentDate] = useState(new Date());
 const [slots, setSlots] = useState<VendorTimeSlot[]>([]);
 const [loading, setLoading] = useState(false);
 const [selectedDate, setSelectedDate] = useState<Date | null>(null);
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [bulkModalOpen, setBulkModalOpen] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const [slotForm, setSlotForm] = useState({
 start_time: '08:00:00',
 capacity: 8,
 price_override: '',
 is_blackout: false,
 });

 const [bulkForm, setBulkForm] = useState({
 date_from: '',
 date_to: '',
 start_time: '08:00:00',
 capacity: 8,
 price_override: '',
 days: [0, 1, 2, 3, 4, 5, 6] as number[],
 });

 useEffect(() => {
 loadListings();
 }, []);

 useEffect(() => {
 if (selectedListingId) {
 loadSlots(selectedListingId);
 } else {
 setSlots([]);
 }
 }, [selectedListingId, currentDate]);

 const loadListings = async () => {
 try {
 const res = await getListings(1);
 setListings(res.data);
 if (res.data[0]) {
 setSelectedListingId(res.data[0].id);
 }
 } catch {
 // silent
 }
 };

 const loadSlots = async (listingId: number) => {
 const { from, to } = getMonthRange(currentDate);
 setLoading(true);
 try {
 const res = await getListingSlots(listingId, from, to);
 setSlots(res.dates.flatMap((d) => d.slots.map((s) => ({ ...s, date: d.date }))));
 } catch {
 setSlots([]);
 } finally {
 setLoading(false);
 }
 };

 const slotsByDate = useMemo(() => {
 const map = new Map<string, VendorTimeSlot[]>();
 slots.forEach((slot) => {
 const key = slot.date;
 const list = map.get(key) ?? [];
 list.push(slot);
 map.set(key, list);
 });
 return map;
 }, [slots]);

 const handleSelectDate = (date: Date) => {
 setSelectedDate(date);
 setSlotForm({
 start_time: '08:00:00',
 capacity: 8,
 price_override: '',
 is_blackout: false,
 });
 setDrawerOpen(true);
 };

 const handleAddSlot = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedListingId || !selectedDate) return;

 setError(null);
 const date = formatISODate(selectedDate);
 const endTime = addMinutesToTime(
 slotForm.start_time,
 selectedListing ? selectedListing.duration_minutes : 180
 );

 try {
 await createSlot(selectedListingId, {
 date,
 start_time: slotForm.start_time,
 end_time: endTime,
 capacity: slotForm.capacity,
 is_blackout: slotForm.is_blackout,
 price_override: slotForm.price_override ? Number(slotForm.price_override) : null,
 });
 setDrawerOpen(false);
 loadSlots(selectedListingId);
 } catch (err: any) {
 const msg = err?.response?.data?.message ?? 'Failed to create slot.';
 setError(msg);
 }
 };

 const handleDeleteSlot = async (slotId: number) => {
 if (!selectedListingId) return;
 if (!confirm('Delete this time slot?')) return;
 try {
 await deleteSlot(selectedListingId, slotId);
 loadSlots(selectedListingId);
 } catch {
 setError('Failed to delete slot.');
 }
 };

 const handleBulkCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedListingId) return;
 setError(null);
 try {
 await bulkCreateSlots(selectedListingId, {
 date_from: bulkForm.date_from,
 date_to: bulkForm.date_to,
 start_time: bulkForm.start_time,
 capacity: bulkForm.capacity,
 days: bulkForm.days,
 price_override: bulkForm.price_override ? Number(bulkForm.price_override) : undefined,
 });
 setBulkModalOpen(false);
 loadSlots(selectedListingId);
 } catch (err: any) {
 const msg = err?.response?.data?.message ?? 'Failed to bulk create slots.';
 setError(msg);
 }
 };

 const toggleBulkDay = (day: number) => {
 setBulkForm((prev) => ({
 ...prev,
 days: prev.days.includes(day)
 ? prev.days.filter((d) => d !== day)
 : [...prev.days, day].sort(),
 }));
 };

 const selectedListing = listings.find((l) => l.id === selectedListingId);
 const daySlots = selectedDate
 ? slotsByDate.get(formatISODate(selectedDate)) ?? []
 : [];

 return (
 <div>
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
 <div>
 <h1 className="text-2xl font-bold text-text-primary">Availability calendar</h1>
 <p className="text-sm text-text-secondary mt-1">
 Manage time slots for your listings.
 </p>
 </div>
 <div className="flex items-center gap-3">
 <select
 value={selectedListingId}
 onChange={(e) => setSelectedListingId(Number(e.target.value))}
 className="rounded-md border border-border px-4 py-2 bg-surface-raised text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 >
 {listings.map((l) => (
 <option key={l.id} value={l.id}>
 {l.title}
 </option>
 ))}
 </select>
 <button
 onClick={() => setBulkModalOpen(true)}
 className="bg-accent text-accent-inverse px-4 py-2 rounded-md font-medium hover:bg-surface-elevated flex items-center gap-2"
 >
 <Plus className="w-4 h-4" /> Bulk
 </button>
 </div>
 </div>

 {error && (
 <div className="bg-error/10 text-error rounded-md p-4 mb-3 text-sm">
 {error}
 </div>
 )}

 {loading && (
 <div className="flex items-center justify-center h-32">
 <Loader2 className="w-6 h-6 text-text-primary animate-spin" />
 </div>
 )}

 {!loading && (
 <SimpleCalendar
 currentDate={currentDate}
 onChangeDate={setCurrentDate}
 selectedDate={selectedDate}
 onSelectDate={handleSelectDate}
 dayContent={(date) => {
 const dateStr = formatISODate(date);
 const list = slotsByDate.get(dateStr) ?? [];
 if (list.length === 0) return null;
 const remaining = list.reduce((sum, s) => sum + s.remaining, 0);
 return (
 <div className="text-[10px] leading-tight text-text-primary font-medium">
 {list.length} slot{list.length !== 1 ? 's' : ''}
 <br />
 {remaining} left
 </div>
 );
 }}
 />
 )}

 <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Manage slots">
 <div className="space-y-3">
 <div>
 <h3 className="font-bold text-text-primary mb-3">
 {selectedDate?.toLocaleDateString('en-US', {
 weekday: 'long',
 month: 'long',
 day: 'numeric',
 })}
 </h3>
 {daySlots.length === 0 ? (
 <p className="text-sm text-text-secondary">No slots for this date.</p>
 ) : (
 <div className="space-y-2">
 {daySlots.map((slot) => (
 <div
 key={slot.id}
 className="flex items-center justify-between p-3 rounded-md border border-border bg-surface-raised"
 >
 <div>
 <p className="text-sm font-medium text-text-primary">
 {slot.start_time.slice(0, 5)}
 {slot.end_time ? ` - ${slot.end_time.slice(0, 5)}` : ''}
 </p>
 <p className="text-xs text-text-secondary">
 {slot.remaining}/{slot.capacity} left
 {slot.price_override ? ` · $${slot.price_override}` : ''}
 {slot.is_blackout ? ' · Blackout' : ''}
 </p>
 </div>
 <button
 onClick={() => handleDeleteSlot(slot.id)}
 className="p-2 text-text-secondary hover:text-error"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 <form onSubmit={handleAddSlot} className="space-y-4">
 <h4 className="font-semibold text-text-primary">Add new slot</h4>
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">Start time</label>
 <input
 type="time"
 value={slotForm.start_time.slice(0, 5)}
 onChange={(e) => setSlotForm({ ...slotForm, start_time: `${e.target.value}:00` })}
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">Capacity</label>
 <input
 type="number"
 min={1}
 value={slotForm.capacity}
 onChange={(e) => setSlotForm({ ...slotForm, capacity: Number(e.target.value) })}
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">
 Price override (USD, optional)
 </label>
 <input
 type="number"
 min={0}
 step={0.01}
 value={slotForm.price_override}
 onChange={(e) => setSlotForm({ ...slotForm, price_override: e.target.value })}
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <label className="flex items-center gap-2 text-sm text-text-primary">
 <input
 type="checkbox"
 checked={slotForm.is_blackout}
 onChange={(e) => setSlotForm({ ...slotForm, is_blackout: e.target.checked })}
 className="rounded border-border text-text-primary focus:ring-accent"
 />
 Blackout date
 </label>
 <button
 type="submit"
 className="w-full bg-accent text-accent-inverse py-2.5 rounded-md font-medium hover:bg-surface-elevated"
 >
 Add slot
 </button>
 </form>
 </div>
 </Drawer>

 <Modal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk create slots">
 <form onSubmit={handleBulkCreate} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">From</label>
 <input
 type="date"
 value={bulkForm.date_from}
 onChange={(e) => setBulkForm({ ...bulkForm, date_from: e.target.value })}
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 required
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">To</label>
 <input
 type="date"
 value={bulkForm.date_to}
 onChange={(e) => setBulkForm({ ...bulkForm, date_to: e.target.value })}
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 required
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">Start time</label>
 <input
 type="time"
 value={bulkForm.start_time.slice(0, 5)}
 onChange={(e) => setBulkForm({ ...bulkForm, start_time: `${e.target.value}:00` })}
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">Capacity</label>
 <input
 type="number"
 min={1}
 value={bulkForm.capacity}
 onChange={(e) => setBulkForm({ ...bulkForm, capacity: Number(e.target.value) })}
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-1">
 Price override (USD)
 </label>
 <input
 type="number"
 min={0}
 step={0.01}
 value={bulkForm.price_override}
 onChange={(e) => setBulkForm({ ...bulkForm, price_override: e.target.value })}
 className="w-full rounded-md border border-border px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium text-text-secondary mb-2">Repeat on</label>
 <div className="flex flex-wrap gap-2">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
 <button
 key={day}
 type="button"
 onClick={() => toggleBulkDay(index)}
 className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
 bulkForm.days.includes(index)
 ? 'bg-accent text-accent-inverse border-accent'
 : 'border-border text-text-secondary'
 }`}
 >
 {day}
 </button>
 ))}
 </div>
 </div>
 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={() => setBulkModalOpen(false)}
 className="flex-1 px-4 py-2.5 rounded-md border border-border text-text-primary font-medium"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="flex-1 bg-accent text-accent-inverse py-2.5 rounded-md font-medium hover:bg-surface-elevated"
 >
 Create slots
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
}
