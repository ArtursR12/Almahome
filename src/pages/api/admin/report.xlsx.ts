import type { APIRoute } from 'astro';
import ExcelJS from 'exceljs';
import { getCollection } from 'astro:content';
import { checkBasicAuth } from '@/middleware';

export const prerender = false;

function statusLabel(s: string): string {
  return s === 'available' ? 'Pieejams' : s === 'reserved' ? 'Rezervēts' : 'Pārdots';
}
function typeLabel(t: string): string {
  return t === 'surface_ev_ready' ? 'Virszemes · EV' : 'Virszemes';
}
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const GET: APIRoute = async ({ request }) => {
  if (!checkBasicAuth(request.headers.get('authorization'))) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="AlmaHome Admin"' },
    });
  }

  const apartments = (await getCollection('apartments'))
    .map((e) => e.data)
    .sort((a, b) => a.number - b.number);
  const parking = (await getCollection('parking'))
    .map((e) => e.data)
    .sort((a, b) => a.number - b.number);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'AlmaHome admin';
  wb.created = new Date();

  // === Apartments sheet ===
  const aptSheet = wb.addWorksheet('Dzīvokļi');
  aptSheet.columns = [
    { header: 'Nr.',        key: 'number',        width: 6  },
    { header: 'Stāvs',      key: 'floor',         width: 7  },
    { header: 'Istabas',    key: 'rooms',         width: 9  },
    { header: 'Platība m²', key: 'area_total',    width: 12 },
    { header: 'Terase',     key: 'has_terrace',   width: 8  },
    { header: 'Balkons',    key: 'has_balcony',   width: 9  },
    { header: 'Statuss',    key: 'status',        width: 12 },
    { header: 'Cena €',     key: 'price',         width: 12 },
    { header: 'Pircējs',    key: 'buyer_name',    width: 24 },
    { header: 'Kontakti',   key: 'buyer_contact', width: 28 },
    { header: 'Piezīmes',   key: 'buyer_notes',   width: 40 },
  ];
  for (const a of apartments) {
    aptSheet.addRow({
      number:        a.number,
      floor:         a.floor,
      rooms:         a.rooms,
      area_total:    a.area_total,
      has_terrace:   a.has_terrace ? 'Jā' : '',
      has_balcony:   a.has_balcony ? 'Jā' : '',
      status:        statusLabel(a.status),
      price:         a.price ?? '',
      buyer_name:    a.buyer_name ?? '',
      buyer_contact: a.buyer_contact ?? '',
      buyer_notes:   a.buyer_notes ?? '',
    });
  }

  // === Parking sheet ===
  const apt2spots = new Map<number, number[]>();
  for (const s of parking) {
    if (s.linked_apartment) {
      const arr = apt2spots.get(s.linked_apartment) ?? [];
      arr.push(s.number);
      apt2spots.set(s.linked_apartment, arr);
    }
  }
  const parkSheet = wb.addWorksheet('Autostāvvietas');
  parkSheet.columns = [
    { header: 'Nr.',                 key: 'number',           width: 6  },
    { header: 'Tips',                key: 'type',             width: 18 },
    { header: 'Statuss',             key: 'status',           width: 12 },
    { header: 'Cena €',              key: 'price',            width: 12 },
    { header: 'Saistīts dzīvoklis',  key: 'linked_apartment', width: 18 },
    { header: 'Pircējs',             key: 'buyer_name',       width: 24 },
    { header: 'Kontakti',            key: 'buyer_contact',    width: 28 },
    { header: 'Piezīmes',            key: 'buyer_notes',      width: 40 },
  ];
  for (const s of parking) {
    parkSheet.addRow({
      number:           s.number,
      type:             typeLabel(s.type),
      status:           statusLabel(s.status),
      price:            s.price ?? '',
      linked_apartment: s.linked_apartment ? `Nr. ${s.linked_apartment}` : '',
      buyer_name:       s.buyer_name ?? '',
      buyer_contact:    s.buyer_contact ?? '',
      buyer_notes:      s.buyer_notes ?? '',
    });
  }

  // === Summary sheet ===
  const sumSheet = wb.addWorksheet('Pārskats');
  sumSheet.columns = [
    { header: 'Kategorija', key: 'cat',   width: 28 },
    { header: 'Vērtība',    key: 'value', width: 14 },
  ];
  const aptByStatus = {
    available: apartments.filter((a) => a.status === 'available').length,
    reserved:  apartments.filter((a) => a.status === 'reserved').length,
    sold:      apartments.filter((a) => a.status === 'sold').length,
  };
  const parkByStatus = {
    available: parking.filter((p) => p.status === 'available').length,
    reserved:  parking.filter((p) => p.status === 'reserved').length,
    sold:      parking.filter((p) => p.status === 'sold').length,
  };
  sumSheet.addRows([
    { cat: 'Dzīvokļi — kopā',           value: apartments.length },
    { cat: 'Dzīvokļi — pieejami',       value: aptByStatus.available },
    { cat: 'Dzīvokļi — rezervēti',      value: aptByStatus.reserved },
    { cat: 'Dzīvokļi — pārdoti',        value: aptByStatus.sold },
    { cat: '', value: '' },
    { cat: 'Autostāvvietas — kopā',     value: parking.length },
    { cat: 'Autostāvvietas — pieejamas',value: parkByStatus.available },
    { cat: 'Autostāvvietas — rezervētas',value: parkByStatus.reserved },
    { cat: 'Autostāvvietas — pārdotas', value: parkByStatus.sold },
    { cat: '', value: '' },
    { cat: 'Atskaite ģenerēta',         value: ymd(new Date()) },
  ]);

  // Bold + freeze the header row on each sheet.
  for (const sheet of [aptSheet, parkSheet, sumSheet]) {
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
  }

  const buf = await wb.xlsx.writeBuffer();
  const filename = `almahome-report-${ymd(new Date())}.xlsx`;

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
};
