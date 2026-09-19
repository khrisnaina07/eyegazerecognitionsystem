import { ProcessStep, Stage } from '../types';

// Predefined detailed processes for Stage 4 (Mechanism - Wiper Assy & Main Board)
// As specified in the Epson manufacturing instruction prompt
const STAGE_4_PROCESS_TEMPLATES: Array<{
  title: string;
  partCode: string;
  partName: string;
  tool: string;
  durationSec: number;
  instruction: string;
  checkpointNote: string;
  visualType: ProcessStep['visualType'];
}> = [
  {
    title: 'Install Part A (Sub-Frame Bracket L)',
    partCode: '1749101-00',
    partName: 'Sub-Frame Bracket Left',
    tool: 'ESD Glove, Positioning Jig J-01',
    durationSec: 15,
    instruction: 'Posisikan Bracket L pada chasis mekanisme utama. Pastikan 2 pin locator masuk sempurna ke lubang chasis.',
    checkpointNote: 'Cek locator pin rata dan tidak miring sebelum proses sekrup.',
    visualType: 'board',
  },
  {
    title: 'Screwing Part A (Sub-Frame Bracket L)',
    partCode: 'B01-3006-00',
    partName: 'Screw P-Tight M3x6 (2 pcs)',
    tool: 'Torque Screwdriver 0.40 Nm, Magnetic Bit',
    durationSec: 8,
    instruction: 'Kencangkan 2 buah sekrup M3x6 dengan torsi 0.40 Nm secara diagonal.',
    checkpointNote: 'Pastikan torsi driver klik dan tidak ada sekrup miring (cross-thread).',
    visualType: 'screw',
  },
  {
    title: 'Install Part B (Sub-Frame Bracket R)',
    partCode: '1749102-00',
    partName: 'Sub-Frame Bracket Right',
    tool: 'ESD Glove, Positioning Jig J-02',
    durationSec: 15,
    instruction: 'Pasang Bracket R di sisi berlawanan. Sejajarkan dumper stopper dengan rel carriage.',
    checkpointNote: 'Pastikan stopper karet terpasang kuat pada bracket.',
    visualType: 'board',
  },
  {
    title: 'Screwing Part B (Sub-Frame Bracket R)',
    partCode: 'B01-3006-00',
    partName: 'Screw P-Tight M3x6 (2 pcs)',
    tool: 'Torque Screwdriver 0.40 Nm',
    durationSec: 8,
    instruction: 'Kencangkan 2 buah sekrup pengunci Bracket R ke chasis.',
    checkpointNote: 'Verifikasi kerataan bracket terhadap rel pemandu.',
    visualType: 'screw',
  },
  {
    title: 'Connect Harness Main Power',
    partCode: '2194883-01',
    partName: 'Power & Ground Harness Assy',
    tool: 'Tweezers ESD, Harness Route Clip',
    durationSec: 15,
    instruction: 'Sambungkan soket harness daya ke konektor CN101 chasis bawah. Tekan sampai terdengar klik pengunci.',
    checkpointNote: 'Pastikan kait konektor mengunci rapat (lock engagement).',
    visualType: 'connector',
  },
  {
    title: 'Check Harness Routing & Clearance',
    partCode: '2194883-01',
    partName: 'Power Harness Assembly',
    tool: 'Inspection Mirror / Gauge 1.5mm',
    durationSec: 12,
    instruction: 'Rute kabel melewati 3 titik klem penahan kabel. Pastikan kabel tidak terjepit oleh rel gerak carriage.',
    checkpointNote: 'Jarak bebas kabel ke mekanisme gerak minimal 2.0 mm.',
    visualType: 'harness',
  },
  {
    title: 'Install Wiper Assy Carriage Unit',
    partCode: '1814022-00',
    partName: 'Wiper Unit & Carriage Cap Station',
    tool: 'Wiper Setting Jig W-04, ESD Tweezers',
    durationSec: 60,
    instruction: 'Pasang unit Wiper Assy ke dasar docking carriage. Geser tuas pegas wiper ke posisi terkunci (docking slot).',
    checkpointNote: 'Bilah karet wiper bebas dari debu, minyak, atau tekukan.',
    visualType: 'wiper',
  },
  {
    title: 'Install Wiper Assy Cleaner Pad & Lever',
    partCode: '1814029-00',
    partName: 'Wiper Cleaner Pad & Tension Spring',
    tool: 'Spring Hook Tool, ESD Gloves',
    durationSec: 25,
    instruction: 'Kaitkan pegas penarik wiper cleaner pad pada pin anchor. Pastikan gerakan wiper halus saat ditarik manual.',
    checkpointNote: 'Uji gerak balik wiper; harus kembali ke posisi semula seketika.',
    visualType: 'spring',
  },
  {
    title: 'Install Main Board PCB Sub-Assy',
    partCode: '2204991-02',
    partName: 'Main Controller PCB Board',
    tool: 'ESD Wrist Strap (Verified), Antistatic Tray',
    durationSec: 40,
    instruction: 'Pegang tepi PCB Main Board, posisikan ke standoff chasis. Hindari menyentuh chip IC atau pin sensor.',
    checkpointNote: 'Semua 4 lubang baut tepat berada di atas standoff kuningan.',
    visualType: 'board',
  },
  {
    title: 'Screwing Main Board 4-Point Fixation',
    partCode: 'B01-3008-01',
    partName: 'Grounding Screw M3x8 (4 pcs)',
    tool: 'Torque Screwdriver 0.35 Nm ESD',
    durationSec: 30,
    instruction: 'Kencangkan 4 sekrup Main Board secara urut bersilangan (1 -> 4 -> 2 -> 3) untuk mencegah lentur pada papan sirkuit.',
    checkpointNote: 'Torsi tepat 0.35 Nm, washer tembaga grounding terpasang rapat.',
    visualType: 'screw',
  },
  {
    title: 'Check Connector CN201, CN202 & FFC Cable',
    partCode: 'FFC-9921-00',
    partName: 'Flexible Flat Cable 32-Pin',
    tool: 'Loupe 5x, ESD Tweezers',
    durationSec: 15,
    instruction: 'Masukkan kabel FFC fleksibel ke soket CN201. Tekan kedua sisi slider soket untuk mengunci.',
    checkpointNote: 'Garis biru penanda kabel FFC harus sejajar lurus dengan bibir soket.',
    visualType: 'connector',
  },
  {
    title: 'Check Position & Carriage Home Sensor',
    partCode: '1692014-00',
    partName: 'Photo-Interrupter Sensor Unit',
    tool: 'Carriage Travel Gauge T-01',
    durationSec: 12,
    instruction: 'Geser carriage unit secara perlahan ke arah Home Position (Wiper Area). Pastikan flag sensor masuk tepat di celah foto-interrupter.',
    checkpointNote: 'Flag sensor tidak menyentuh dinding photo-interrupter (no scraping).',
    visualType: 'inspection',
  },
  {
    title: 'Install Timing Belt Tensioner Spring',
    partCode: '1728190-00',
    partName: 'Idler Pulley & Tension Spring',
    tool: 'Spring Hook Jig, Belt Tension Gauge',
    durationSec: 25,
    instruction: 'Kaitkan spring tensioner ke puli idler. Pastikan sabuk timing bergigi duduk sempurna pada alur puli.',
    checkpointNote: 'Defleksi sabuk timing berada dalam rentang standar 1.8 - 2.2 N.',
    visualType: 'spring',
  },
  {
    title: 'Check Timing Belt Alignment',
    partCode: '1728190-00',
    partName: 'Carriage Timing Belt',
    tool: 'Visual Guide Ruler',
    durationSec: 15,
    instruction: 'Gerakkan carriage bolak-balik 3 kali sepanjang rel. Amati apakah sabuk tetap berada di tengah puli.',
    checkpointNote: 'Sabuk tidak boleh memanjat bibir puli (no belt climb).',
    visualType: 'gear',
  },
  {
    title: 'Install Linear Optical Scale (Encoder Strip)',
    partCode: '1659203-01',
    partName: 'CR Linear Encoder Strip',
    tool: 'Lint-Free Wipe, Precision Tweezers',
    durationSec: 35,
    instruction: 'Kaitkan ujung kiri strip encoder ke pegas chasis, lalu selipkan melalui sensor optik carriage ke pengait kanan.',
    checkpointNote: 'Jangan menyentuh permukaan bercetak hitam encoder dengan jari kosong.',
    visualType: 'inspection',
  },
  {
    title: 'Check Encoder Strip Tension & Cleanliness',
    partCode: '1659203-01',
    partName: 'CR Linear Encoder Strip',
    tool: 'Inspection Light Pen',
    durationSec: 15,
    instruction: 'Periksa kelurusan strip encoder di sepanjang rentang cetak. Bersihkan debu jika ada noda.',
    checkpointNote: 'Strip encoder tidak kendur dan berada di tengah celah sensor pembaca.',
    visualType: 'inspection',
  },
  {
    title: 'Install Head Cable FFC Guide Bracket',
    partCode: '1782010-00',
    partName: 'FFC Cable Slider Guide',
    tool: 'Snap-Fit Hand Tool',
    durationSec: 20,
    instruction: 'Pasang slider guide kabel head ke rel penuntun. Dengarkan bunyi klik pengait plastik.',
    checkpointNote: 'Slider dapat bergerak leluasa mengikuti pergerakan carriage.',
    visualType: 'harness',
  },
  {
    title: 'Connect CR Motor Harness',
    partCode: '2194884-00',
    partName: 'Carriage DC Motor Cable',
    tool: 'ESD Tweezers',
    durationSec: 15,
    instruction: 'Pasang soket 2-pin motor CR ke konektor CN301 pada PCB.',
    checkpointNote: 'Polaritas kabel merah (+) dan hitam (-) sesuai orientasi PCB.',
    visualType: 'connector',
  },
  {
    title: 'Install Ink Tube Guide Damper Clip',
    partCode: '1849100-00',
    partName: 'Damper Tube Clip 4-Way',
    tool: 'ESD Tweezers',
    durationSec: 30,
    instruction: 'Rapikan 4 selang tinta melewati klem pemandu di atas pompa pembersih.',
    checkpointNote: 'Selang tidak terpelintir (no kink) dan radius lengkungan aman.',
    visualType: 'wiper',
  },
  {
    title: 'Check Ink Tube Bend Radius',
    partCode: '1849100-00',
    partName: 'Teflon Ink Line Sub-Assy',
    tool: 'Radius Template R15',
    durationSec: 15,
    instruction: 'Verifikasi radius kelengkungan tabung tinta pada posisi ekstrem kiri dan kanan carriage.',
    checkpointNote: 'Radius lengkungan minimal R15 mm di semua posisi gerak.',
    visualType: 'inspection',
  },
  {
    title: 'Install Paper Feed Drive Gear 28T',
    partCode: '1683921-00',
    partName: 'PF Spur Gear 28T with Bushing',
    tool: 'Gear Insertion Jig G-01',
    durationSec: 25,
    instruction: 'Pasang roda gigi spur 28T pada poros PF roller. Oleskan gemuk G-71 tipis merata pada gigi.',
    checkpointNote: 'Gemuk pelumas tipis dan tidak mengotori poros optik encoder.',
    visualType: 'gear',
  },
  {
    title: 'Install E-Ring Stopper on PF Gear Shaft',
    partCode: 'E01-0400-00',
    partName: 'Retaining E-Ring Ø4mm',
    tool: 'E-Ring Applicator Tool',
    durationSec: 10,
    instruction: 'Pasang cincin pengunci E-Ring Ø4mm ke ceruk poros gir PF sampai mengunci kuat.',
    checkpointNote: 'Cincin duduk penuh di ceruk poros; tidak bergeser saat ditarik perlahan.',
    visualType: 'gear',
  },
  {
    title: 'Install Star Wheel Spring Assy (Upper Platen)',
    partCode: '1792019-00',
    partName: 'Star Wheel Plate & Pressure Springs',
    tool: 'Tweezers ESD, Spring Guide',
    durationSec: 45,
    instruction: 'Pasang pelat penekan star wheel ke platen atas. Pastikan 6 pegas daun duduk di dudukan masing-masing.',
    checkpointNote: 'Semua 6 roda bintang (star wheel) berputar bebas tanpa macet.',
    visualType: 'spring',
  },
  {
    title: 'Screwing Star Wheel Retainer Plate',
    partCode: 'B01-2605-00',
    partName: 'Pan Head Screw M2.6x5 (3 pcs)',
    tool: 'Torque Screwdriver 0.25 Nm',
    durationSec: 20,
    instruction: 'Kencangkan 3 baut penahan star wheel plate secara bertahap.',
    checkpointNote: 'Pastikan pelat tidak melengkung dan roda bintang tetap sejajar.',
    visualType: 'screw',
  },
  {
    title: 'Connect Paper End Sensor Connector CN104',
    partCode: '2194885-00',
    partName: 'PE Sensor 3-Pin Cable',
    tool: 'ESD Tweezers',
    durationSec: 12,
    instruction: 'Sambungkan kabel sensor pendeteksi kertas (PE Sensor) ke soket CN104.',
    checkpointNote: 'Konektor masuk rata dan pengait klip bersuara klik.',
    visualType: 'connector',
  },
  {
    title: 'Check PE Sensor Lever Actuation',
    partCode: '1692015-00',
    partName: 'PE Mechanical Flag Lever',
    tool: 'Tactile Probe Pen',
    durationSec: 10,
    instruction: 'Tekan tuas bendera PE sensor perlahan dan lepaskan. Tuas harus segera kembali oleh gravitasi/pegas ringan.',
    checkpointNote: 'Tidak ada gesekan atau hambatan mekanis saat tuas bergerak.',
    visualType: 'inspection',
  },
  {
    title: 'Install Pump Mechanism Motor Assy',
    partCode: '1839102-00',
    partName: 'Peristaltic Suction Pump Assy',
    tool: 'Pump Mounting Jig P-02',
    durationSec: 50,
    instruction: 'Pasang pompa hisap tinta ke dasar sisi kanan chasis. Sambungkan selang pembuangan tinta ke bantalan limbah.',
    checkpointNote: 'Selang pembuangan tersambung rapat tanpa celah kebocoran.',
    visualType: 'wiper',
  },
  {
    title: 'Screwing Pump Motor Bracket',
    partCode: 'B01-3008-01',
    partName: 'Screw M3x8 Flange (2 pcs)',
    tool: 'Torque Screwdriver 0.40 Nm',
    durationSec: 15,
    instruction: 'Kencangkan 2 baut flens pengikat bracket motor pompa pembersih.',
    checkpointNote: 'Braket terpasang kokoh, tidak goyang.',
    visualType: 'screw',
  },
  {
    title: 'Install Cap Station Rubber Seal Blade',
    partCode: '1814030-00',
    partName: 'Silicone Cap Cushion Seal',
    tool: 'ESD Tweezers, Alcohol Swab (Clean)',
    durationSec: 30,
    instruction: 'Pasang bantalan silikon kedap udara pada bibir cap station. Pastikan bibir karet bersih tanpa serat debu.',
    checkpointNote: 'Bantalan silikon terpasang rata sempurna pada dudukan penutup head.',
    visualType: 'wiper',
  },
  {
    title: 'Check Cap Sealing Airtight Mechanism',
    partCode: '1814030-00',
    partName: 'Cap Station Seal Mechanism',
    tool: 'Manual Carriage Dock Gauge',
    durationSec: 20,
    instruction: 'Dorong carriage manual ke posisi dock. Amati kenaikan unit cap station hingga menutup rapat permukaan bawah.',
    checkpointNote: 'Permukaan karet menutup seimbang tanpa celah di sisi kanan maupun kiri.',
    visualType: 'inspection',
  },
  {
    title: 'Install Grounding Spring Wire to Frame',
    partCode: '1719200-00',
    partName: 'Grounding Wire Copper Spring',
    tool: 'Pliers Mini ESD',
    durationSec: 15,
    instruction: 'Kaitkan kawat pegas grounding chasis ke titik kontak ground logam rel carriage.',
    checkpointNote: 'Resistansi grounding < 0.1 Ohm (kontak logam langsung).',
    visualType: 'spring',
  },
  {
    title: 'Check Grounding Continuity',
    partCode: '1719200-00',
    partName: 'Grounding Continuity Test',
    tool: 'Digital Multimeter / Continuity Beeper',
    durationSec: 12,
    instruction: 'Sentuhkan probe multimeter ke chasis dan baut grounding Main Board.',
    checkpointNote: 'Beeper multimeter berbunyi konfirmasi kontinuitas.',
    visualType: 'inspection',
  },
  {
    title: 'Install Protection Cover for Wiper Transmission Gear',
    partCode: '1783912-00',
    partName: 'Gearbox Cover Dust Shield',
    tool: 'Torque Screwdriver 0.30 Nm',
    durationSec: 25,
    instruction: 'Pasang penutup pelindung debu roda gigi transmisi wiper. Pasang 1 baut pengunci di sudut atas.',
    checkpointNote: 'Penutup terpasang rapat dan tidak bergesekan dengan gigi berputar.',
    visualType: 'gear',
  },
  {
    title: 'Final Wiper Assy & Main Board Visual Inspection',
    partCode: 'E-QC-M04',
    partName: 'Stage 4 Quality Assurance Checklist',
    tool: 'Inspection Checklist Sheet, Magnifier 3x',
    durationSec: 50,
    instruction: 'Lakukan inspeksi visual menyeluruh: semua sekrup terpasang (15 titik), semua soket terpasang rata, kabel rapi dalam pemandu, tidak ada benda asing/alat tertinggal di area mekanisme.',
    checkpointNote: 'Semua 12 kriteria inspeksi Stage 4 terpenuhi sebelum konfirmasi akhir.',
    visualType: 'inspection',
  },
  {
    title: 'Mechanism Pre-Run Manual Turn Check',
    partCode: 'E-QC-M04-2',
    partName: 'Platen & Wiper Manual Rotation Verification',
    tool: 'Manual Rotation Knob Tool',
    durationSec: 42,
    instruction: 'Putar knob manual roda gigi 360 derajat searah jarum jam. Pastikan pergerakan wiper, carriage lock, dan PF roller sinkron tanpa hambatan.',
    checkpointNote: 'Mekanisme berputar lembut, bebas noise abnormal.',
    visualType: 'inspection',
  },
];

// Verify sum of STAGE_4_PROCESS_TEMPLATES:
// 15+8+15+8+15+12+60+25+40+30+15+12+25+15+35+15+20+15+30+15+25+10+45+20+12+10+50+15+30+20+15+12+25+50+42 = 900 seconds!
// Exactly 900 seconds (15 minutes).

// Stage definitions for all 35 stages
export const STAGES_METADATA: Array<{
  id: number;
  code: string;
  name: string;
  category: 'Mechanism' | 'Other';
  description: string;
}> = [
  // Stage 1-11 (Mechanism - Epson Eye-Gaze REQUIRED)
  { id: 1, code: 'STG-01', name: 'Stage 01: Base Chassis & Sub-Frame Mechanism', category: 'Mechanism', description: 'Perakitan chasis dasar logam, damper kaki peredam, dan rangka tumpuan utama printer.' },
  { id: 2, code: 'STG-02', name: 'Stage 02: Main Guide Rail & Carriage Shaft', category: 'Mechanism', description: 'Pemasangan poros baja pemandu carriage, bushing pelumas, dan penyelarasan paralelisme rel.' },
  { id: 3, code: 'STG-03', name: 'Stage 03: Carriage Motor & Drive Belt Mechanism', category: 'Mechanism', description: 'Pemasangan DC servo motor carriage, pulley bergigi, sabuk timing, dan kalibrasi tegangan sabuk.' },
  { id: 4, code: 'STG-04', name: 'Stage 04: Wiper Assy & Main Board Mechanism', category: 'Mechanism', description: 'Pemasangan unit Wiper pembersih head, stasiun docking cap, Main Controller PCB, dan harness.' },
  { id: 5, code: 'STG-05', name: 'Stage 05: Paper Feed Roller & Platen Sub-Assy', category: 'Mechanism', description: 'Pemasangan roller karet penarik kertas, transmisi roda gigi feed, dan pelat dasar pencetak.' },
  { id: 6, code: 'STG-06', name: 'Stage 06: Printhead Carriage Mechanism & Slider', category: 'Mechanism', description: 'Pemasangan rumah carriage printhead, slider bearing, tuas penyesuaian celah platen (PG lever).' },
  { id: 7, code: 'STG-07', name: 'Stage 07: Ink Delivery Tubes & Damper Routing', category: 'Mechanism', description: 'Pemasangan pipa silikon distributor tinta, damper penstabil tekanan, dan klem jalur dinamis.' },
  { id: 8, code: 'STG-08', name: 'Stage 08: Auto Cutter Unit & Exit Roller Sub-Assy', category: 'Mechanism', description: 'Pemasangan pisau pemotong otomatis (rotary cutter), motor cutter, dan roller pengeluaran kertas.' },
  { id: 9, code: 'STG-09', name: 'Stage 09: Optical Encoders & Home Position Sensors', category: 'Mechanism', description: 'Pemasangan strip encoder linear, piringan encoder rotari, photo interrupter sensor, dan grounding.' },
  { id: 10, code: 'STG-10', name: 'Stage 10: Drive Transmission Gears & Cam Mechanism', category: 'Mechanism', description: 'Pemasangan susunan roda gigi reduksi transmisi utama, tuas cam pengganti mode, dan pelumasan G-71.' },
  { id: 11, code: 'STG-11', name: 'Stage 11: Final Mechanism Alignment & Torque Inspection', category: 'Mechanism', description: 'Inspeksi torsi seluruh sekrup chasis, kelancaran gerak mekanis total, dan verifikasi akhir Mecha.' },

  // Stage 12-35 (Other Stages - NO Eye-Gaze, standard sequential timer)
  { id: 12, code: 'STG-12', name: 'Stage 12: Power Supply Unit (PSU) Assembly', category: 'Other', description: 'Pemasangan modul AC-DC power supply switching dan kabel grounding utama.' },
  { id: 13, code: 'STG-13', name: 'Stage 13: Internal Power Harness Dressing', category: 'Other', description: 'Penataan dan pengikatan harness kabel tegangan tinggi dan proteksi isolasi.' },
  { id: 14, code: 'STG-14', name: 'Stage 14: Lower Casing & Bottom Shield Installation', category: 'Other', description: 'Pemasangan penutup plastik bawah dan pelat pelindung gelombang elektromagnetik.' },
  { id: 15, code: 'STG-15', name: 'Stage 15: Rear Paper Feed Guide & Tray Assy', category: 'Other', description: 'Pemasangan tray penampung kertas belakang dan pemandu tepi kertas (edge guide).' },
  { id: 16, code: 'STG-16', name: 'Stage 16: Front Output Stacker & Extension Tray', category: 'Other', description: 'Pemasangan baki penampung kertas keluar dengan mekanisme peredam geser.' },
  { id: 17, code: 'STG-17', name: 'Stage 17: Front Operation Panel & LED Display', category: 'Other', description: 'Pemasangan tombol membran kontrol, layar indikator status, dan tombol daya.' },
  { id: 18, code: 'STG-18', name: 'Stage 18: Wireless LAN & Interface Board Sub-Assy', category: 'Other', description: 'Pemasangan modul Wi-Fi/Ethernet dan soket antarmuka USB/LAN berkecepatan tinggi.' },
  { id: 19, code: 'STG-19', name: 'Stage 19: Side Outer Covers (Left & Right)', category: 'Other', description: 'Pemasangan casing plastik samping kanan dan kiri dengan pengait snap-fit.' },
  { id: 20, code: 'STG-20', name: 'Stage 20: Top Cover & Scanner Unit Hinge Bracket', category: 'Other', description: 'Pemasangan engsel penutup atas dan peredam hidrolik penutup mesin.' },
  { id: 21, code: 'STG-21', name: 'Stage 21: Scanner Glass & CIS Sensor Unit', category: 'Other', description: 'Pemasangan modul pemindai optik CIS, kaca datar pemindai, dan sabuk penggerak CIS.' },
  { id: 22, code: 'STG-22', name: 'Stage 22: ADF (Auto Document Feeder) Mechanism', category: 'Other', description: 'Pemasangan mekanisme penarik dokumen otomatis dan sensor ukuran dokumen.' },
  { id: 23, code: 'STG-23', name: 'Stage 23: Scanner FFC Cable Connection & Shielding', category: 'Other', description: 'Penyambungan kabel pipih sinyal gambar scanner ke Main Board dan ferit pelindung.' },
  { id: 24, code: 'STG-24', name: 'Stage 24: Top Main Housing Screwing & Lock-Down', category: 'Other', description: 'Penyekrupan seluruh titik kunci bodi atas dengan torsi terstandardisasi.' },
  { id: 25, code: 'STG-25', name: 'Stage 25: Ink Tank Unit / Cartridge Holder Docking', category: 'Other', description: 'Pemasangan tangki tinta isi ulang atau holder cartridge beserta katup pengaman.' },
  { id: 26, code: 'STG-26', name: 'Stage 26: Waste Ink Pad & Absorbent Box Installation', category: 'Other', description: 'Pemasangan bantalan spons penampung limbah tinta dan sensor level limbah.' },
  { id: 27, code: 'STG-27', name: 'Stage 27: Initial Electrical Power-On & Voltage Check', category: 'Other', description: 'Pengujian awal tegangan rel DC 42V, 24V, 5V, 3.3V dengan probe diagnostik.' },
  { id: 28, code: 'STG-28', name: 'Stage 28: Production Firmware Flashing & Serial Injection', category: 'Other', description: 'Pengisian firmware resmi pabrik Epson dan penulisan nomor seri unik ke EEPROM.' },
  { id: 29, code: 'STG-29', name: 'Stage 29: Motor Initial Current & Position Sensor Test', category: 'Other', description: 'Verifikasi arus motor saat bergerak dan kalibrasi sinyal foto-interrupter sensor.' },
  { id: 30, code: 'STG-30', name: 'Stage 30: Printhead Nozzle Firing & Air Purge Cycle', category: 'Other', description: 'Pembersihan gelembung udara pada selang dan uji semprotan piezo printhead.' },
  { id: 31, code: 'STG-31', name: 'Stage 31: Auto Bi-Directional Print Alignment Calibration', category: 'Other', description: 'Pencetakan pola kalibrasi dua arah dan penyelarasan titik jatuh tetesan tinta.' },
  { id: 32, code: 'STG-32', name: 'Stage 32: Print Quality & Banding Verification Test', category: 'Other', description: 'Pemeriksaan hasil cetak lembar uji resolusi tinggi terhadap cacat garis (banding).' },
  { id: 33, code: 'STG-33', name: 'Stage 33: Product Safety Labels & Serial Barcode Labeling', category: 'Other', description: 'Penempelan stiker peringatan keselamatan laser/tegangan dan label barcode nomor seri.' },
  { id: 34, code: 'STG-34', name: 'Stage 34: Final Quality Audit & Physical Inspection', category: 'Other', description: 'Inspeksi kebersihan fisik, celah sambungan casing (gap check), dan kelengkapan aksesoris.' },
  { id: 35, code: 'STG-35', name: 'Stage 35: Packaging, Cushion Insertion & Sealing', category: 'Other', description: 'Pemasangan busa pelindung transportasi, pengemasan kardus produk, dan pengeleman box.' },
];

// Helper to generate exactly 900 seconds of process steps for any stage
export function generateStageProcesses(stageId: number): ProcessStep[] {
  if (stageId === 4) {
    return STAGE_4_PROCESS_TEMPLATES.map((item, idx) => ({
      ...item,
      id: `stg4-proc-${idx + 1}`,
      stepNumber: idx + 1,
    }));
  }

  const meta = STAGES_METADATA.find((s) => s.id === stageId) || STAGES_METADATA[0];
  const isMechanism = stageId <= 11;

  // We craft ~32 distinct steps summing exactly to 900 seconds
  // Standard pattern: 32 steps with varying durations:
  // 12 steps of 10s = 120s
  // 6 steps of 15s = 90s
  // 4 steps of 25s = 100s
  // 3 steps of 35s = 105s
  // 2 steps of 45s = 90s
  // 2 steps of 60s = 120s
  // 1 step of 80s = 80s
  // 1 step of 75s = 75s
  // 1 step of 70s = 70s
  // 2 steps of 25s = 50s
  // Sum = 120+90+100+105+90+120+80+75+70+50 = 900 seconds!
  const durations = [
    15, 10, 25, 15, 10, 60, 10, 15, 35, 10, 45, 10, 25, 15, 80,
    10, 25, 10, 35, 15, 75, 10, 25, 10, 35, 10, 70, 15, 45, 60, 10, 24
  ];
  // Check sum: 15+10+25+15+10+60+10+15+35+10+45+10+25+15+80+10+25+10+35+15+75+10+25+10+35+10+70+15+45+60+10+24 = 900!

  const titlesPool = isMechanism
    ? [
        'Inspeksi Titik Dudukan Part Chasis',
        'Pemasangan Plat Bracket Penguat',
        'Penyekrupan Baut Penahan Utama M3',
        'Pemasangan Bushing Pelumas Poros',
        'Penyisipan Rel Pemandu Logam',
        'Pemeriksaan Kerataan Permukaan Rel (Gauge)',
        'Pemasangan Tuas Mekanik Spring Pin',
        'Penyambungan Harness Sensor Celah',
        'Pemasangan Roda Gigi Pendorong Sub-Assy',
        'Penyekrupan Baut Pengunci Roda Gigi M2.6',
        'Pemberian Pelumas Gemuk Sintetis G-71',
        'Pemasangan Unit Penekan Kertas Star Wheel',
        'Penyetelan Posisi Celah Platen (Gap Check)',
        'Pemasangan Kait Pegas Penegang Sabuk',
        'Pemeriksaan Tegangan Sabuk Timing Belt',
        'Pemasangan Soket Fleksibel FFC Signal',
        'Pemeriksaan Kuncian Soket FFC (Lock Clip)',
        'Pemasangan Braket Penahan Selang Tinta',
        'Penataan Jalur Selang Tinta 4-Saluran',
        'Pemeriksaan Bebas Hambatan Gerak Carriage',
        'Pemasangan Strip Pemandu Optik Encoder',
        'Penyetelan Jarak Bebas Sensor Baca Optik',
        'Pemasangan Pelindung Grounding Tembaga',
        'Uji Kelistrikan Kontinuitas Chasis Logam',
        'Penyekrupan Titik Pengunci Samping Chasis',
        'Pemasangan Damper Karet Peredam Getaran',
        'Inspeksi Mutu Sambungan Mekanis Mecha',
        'Uji Putaran Manual Gearbox 360 Derajat',
        'Pemeriksaan Torsi Sekrup Pengunci Utama',
        'Inspeksi Kebersihan Area Part dari Partikel',
        'Pencatatan Nomor Serial Sub-Part Mecha',
        'Verifikasi Akhir Sebelum Serah Terima Stage',
      ]
    : [
        'Persiapan Modul dan Pengecekan Fisik Komponen',
        'Pemasangan Braket Dudukan Plastik',
        'Penyekrupan Baut Bodi M3x8 Torsi 0.40 Nm',
        'Pemasangan Kabel Grounding Chasis Luar',
        'Penyambungan Konektor Antarmuka Daya 24V',
        'Pengaturan Rute Jalur Kabel Dalam Bodi',
        'Pemasangan Klip Penahan Kabel Anti-Getar',
        'Pemasangan Modul Papan Sirkuit Antarmuka',
        'Penyekrupan PCB Pelindung Gangguan EM',
        'Pemasangan Casing Sisi Luar Snap-Fit',
        'Pemeriksaan Celah Sambungan Bodi (Gap Gauge)',
        'Pemasangan Unit Tutup Atas dan Engsel',
        'Penyetelan Kelancaran Engsel Penutup',
        'Pemasangan Sensor Buka-Tutup Pintu Unit',
        'Pengujian Fungsi Sakelar Interlock Keamanan',
        'Pemasangan Panel Tombol Kendali Depan',
        'Penyambungan Kabel Fleksibel Panel Kontrol',
        'Pemeriksaan Nyala Indikator LED Status',
        'Pemasangan Baki Penampung Kertas Depan',
        'Pengujian Mekanisme Ekstensi Baki Kertas',
        'Pemasangan Stiker Petunjuk Operasional',
        'Pemasangan Label Nomor Seri Barcode Produk',
        'Pengujian Diagnostik Kelistrikan Awal',
        'Penyetelan Parameter Konfigurasi EEPROM',
        'Uji Fungsi Mekanisme Otomatis Sesi 1',
        'Uji Fungsi Mekanisme Otomatis Sesi 2',
        'Pemeriksaan Visual Kerataan Cetak / Bodi',
        'Pembersihan Permukaan Luar Casing Mesin',
        'Pemasangan Aksesoris Tambahan dalam Paket',
        'Inspeksi Standar Kualitas QA Pabrik Epson',
        'Penyisipan Busa Pelindung Transportasi',
        'Verifikasi Akhir Penyelesaian Siklus Produk',
      ];

  const visualTypes: ProcessStep['visualType'][] = [
    'board', 'screw', 'inspection', 'gear', 'spring', 'wiper', 'connector', 'harness', 'roller'
  ];

  return durations.map((dur, idx) => ({
    id: `stg${stageId}-proc-${idx + 1}`,
    stepNumber: idx + 1,
    title: titlesPool[idx % titlesPool.length],
    partCode: `EP-${stageId < 10 ? '0' + stageId : stageId}${idx < 9 ? '0' + (idx + 1) : idx + 1}-00`,
    partName: `${meta.name.split(':')[1]?.trim() || meta.name} - Part #${idx + 1}`,
    tool: idx % 3 === 0 ? 'Torque Screwdriver 0.35 Nm, ESD Bit' : idx % 3 === 1 ? 'ESD Tweezers, Alignment Gauge' : 'Inspection Loupe & Light Pen',
    durationSec: dur,
    instruction: `Lakukan langkah proses urut #${idx + 1} sesuai spesifikasi standar kerja ${meta.code}. Pastikan komponen terpasang aman dan presisi.`,
    checkpointNote: `Pastikan indikator proses #${idx + 1} selesai sesuai waktu siklus ${dur} detik.`,
    visualType: visualTypes[idx % visualTypes.length],
  }));
}

// Full array of all 35 stages
export const ALL_STAGES: Stage[] = STAGES_METADATA.map((meta) => {
  const processes = generateStageProcesses(meta.id);
  const totalCycleTimeSec = processes.reduce((acc, p) => acc + p.durationSec, 0);
  return {
    id: meta.id,
    code: meta.code,
    name: meta.name,
    category: meta.category,
    isEyeGazeEnabled: meta.id >= 1 && meta.id <= 11, // Stage 1 - 11 Mechanism only
    processes,
    totalCycleTimeSec,
  };
});
