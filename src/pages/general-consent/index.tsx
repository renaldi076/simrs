import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Eraser, Check, Plus, Trash2 } from 'lucide-react';
import { useSignatureCanvas } from '@/hooks/useSignatureCanvas';

// === Types ===
interface PatientIdentity {
  nama: string;
  tanggalLahir: string;
  umur: string;
  noRekamMedis: string;
  nik: string;
  alamat: string;
  noTelepon: string;
}

interface SignerIdentity {
  nama: string;
  tanggalLahir: string;
  usia: string;
  alamat: string;
  noTelepon: string;
  hubunganDenganPasien: string;
}

interface AnggotaKeluarga {
  nama: string;
  hubungan: string;
}

interface FormData {
  pasien: PatientIdentity;
  wali: SignerIdentity;
  isWali: boolean;
  anggotaKeluarga: AnggotaKeluarga[];
  persetujuanPengunjung: 'mengijinkan' | 'tidak_mengijinkan' | '';
  namaTidakDiijinkan: string;
  tandaTanganPasienWali: string;
  tandaTanganPetugas: string;
  tanggal: string;
  jam: string;
}

// === Signature Canvas Component ===
function SignatureCanvas({ 
  label, 
  onSign, 
  signedData 
}: { 
  label: string; 
  onSign: (dataUrl: string) => void;
  signedData: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startDrawing, draw, stopDrawing, clear, isEmpty, toDataURL } = useSignatureCanvas(canvasRef);

  const handleConfirm = () => {
    if (isEmpty()) return;
    onSign(toDataURL());
  };

  const handleClear = () => {
    clear();
    onSign('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {signedData ? (
        <div className="relative">
          <img src={signedData} alt="Tanda tangan" className="w-full h-[150px] border border-green-300 rounded-lg bg-green-50 object-contain" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
          >
            <Eraser size={16} />
          </button>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
            <Check size={12} /> Tersimpan
          </div>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full h-[150px] border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none bg-white hover:border-blue-400 transition-colors"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eraser size={14} /> Hapus
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Check size={14} /> Konfirmasi
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// === Collapsible Section ===
function Section({ 
  title, 
  number, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  number: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-semibold text-gray-800">
          <span className="text-blue-600 mr-2">{number}.</span>
          {title}
        </span>
        {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === Input Component ===
function FormInput({ 
  label, value, onChange, placeholder, type = 'text', required = false 
}: { 
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
      />
    </div>
  );
}

// === Main Page ===
export function GeneralConsentPage(): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
    pasien: { nama: '', tanggalLahir: '', umur: '', noRekamMedis: '', nik: '', alamat: '', noTelepon: '' },
    wali: { nama: '', tanggalLahir: '', usia: '', alamat: '', noTelepon: '', hubunganDenganPasien: '' },
    isWali: false,
    anggotaKeluarga: [{ nama: '', hubungan: '' }],
    persetujuanPengunjung: '',
    namaTidakDiijinkan: '',
    tandaTanganPasienWali: '',
    tandaTanganPetugas: '',
    tanggal: new Date().toISOString().split('T')[0],
    jam: new Date().toTimeString().slice(0, 5),
  });

  const updatePasien = useCallback((field: keyof PatientIdentity, value: string) => {
    setFormData(prev => ({ ...prev, pasien: { ...prev.pasien, [field]: value } }));
  }, []);

  const updateWali = useCallback((field: keyof SignerIdentity, value: string) => {
    setFormData(prev => ({ ...prev, wali: { ...prev.wali, [field]: value } }));
  }, []);

  const addAnggotaKeluarga = () => {
    if (formData.anggotaKeluarga.length >= 3) return;
    setFormData(prev => ({
      ...prev,
      anggotaKeluarga: [...prev.anggotaKeluarga, { nama: '', hubungan: '' }]
    }));
  };

  const removeAnggotaKeluarga = (index: number) => {
    setFormData(prev => ({
      ...prev,
      anggotaKeluarga: prev.anggotaKeluarga.filter((_, i) => i !== index)
    }));
  };

  const updateAnggotaKeluarga = (index: number, field: keyof AnggotaKeluarga, value: string) => {
    setFormData(prev => ({
      ...prev,
      anggotaKeluarga: prev.anggotaKeluarga.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just log - backend integration later
    console.log('Form submitted:', formData);
    alert('General Consent berhasil disimpan!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Detasemen Kesehatan Wilayah 03.04.02</p>
        <h1 className="text-xl font-bold text-gray-900 mt-1">Rumah Sakit Tingkat IV 03.07.04 Guntur</h1>
        <h2 className="text-lg font-semibold text-blue-600 mt-2">Persetujuan Umum / General Consent</h2>
        <p className="text-xs text-gray-400 mt-1">RM-064/RSG</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identitas Pasien */}
        <Section title="Identitas Pasien" number="I" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Nama Pasien" value={formData.pasien.nama} onChange={(v) => updatePasien('nama', v)} required />
            <FormInput label="Tanggal Lahir" value={formData.pasien.tanggalLahir} onChange={(v) => updatePasien('tanggalLahir', v)} type="date" required />
            <FormInput label="Umur" value={formData.pasien.umur} onChange={(v) => updatePasien('umur', v)} placeholder="Tahun" />
            <FormInput label="No. Rekam Medis" value={formData.pasien.noRekamMedis} onChange={(v) => updatePasien('noRekamMedis', v)} required />
            <FormInput label="NIK" value={formData.pasien.nik} onChange={(v) => updatePasien('nik', v)} placeholder="16 digit" required />
            <FormInput label="No. Telepon" value={formData.pasien.noTelepon} onChange={(v) => updatePasien('noTelepon', v)} />
          </div>
          <FormInput label="Alamat" value={formData.pasien.alamat} onChange={(v) => updatePasien('alamat', v)} required />
        </Section>

        {/* Wali / Penanda Tangan */}
        <Section title="Penanda Tangan / Wali" number="II">
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isWali}
                onChange={(e) => setFormData(prev => ({ ...prev, isWali: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Pasien diwakili oleh Wali</span>
            </label>
          </div>
          {formData.isWali && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <FormInput label="Nama Wali" value={formData.wali.nama} onChange={(v) => updateWali('nama', v)} required />
              <FormInput label="Tanggal Lahir / Usia" value={formData.wali.tanggalLahir} onChange={(v) => updateWali('tanggalLahir', v)} type="date" />
              <FormInput label="No. Telepon" value={formData.wali.noTelepon} onChange={(v) => updateWali('noTelepon', v)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hubungan dengan Pasien <span className="text-red-500">*</span></label>
                <select
                  value={formData.wali.hubunganDenganPasien}
                  onChange={(e) => updateWali('hubunganDenganPasien', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Pilih...</option>
                  <option value="suami">Suami</option>
                  <option value="istri">Istri</option>
                  <option value="ayah">Ayah</option>
                  <option value="ibu">Ibu</option>
                  <option value="anak">Anak</option>
                  <option value="saudara">Saudara</option>
                  <option value="wali">Wali</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <FormInput label="Alamat" value={formData.wali.alamat} onChange={(v) => updateWali('alamat', v)} />
              </div>
            </motion.div>
          )}
        </Section>

        {/* Persetujuan Perawatan */}
        <Section title="Persetujuan untuk Perawatan dan Pengobatan" number="III">
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. Saya menyetujui untuk perawatan dan pengobatan di Rumah Sakit Tk.IV 03.07.04 Guntur sebagai pasien rawat jalan atau rawat inap tergantung kepada kebutuhan medis.</p>
            <p>2. Pengobatan dapat meliputi pemeriksaan radiologi, tes darah, perawatan rutin dan prosedur seperti cairan infus atau suntikan dan evaluasi (contohnya wawancara dan pemeriksaan fisik).</p>
            <p>3. Persetujuan yang saya berikan tidak termasuk untuk prosedur/tindakan invasif (misalnya operasi) atau tindakan yang mempunyai resiko tinggi.</p>
            <p>4. Jika saya memutuskan untuk menghentikan perawatan medis untuk diri saya sendiri (pasien), maka saya memahami dan menyadari bahwa Rumah Sakit Tk.IV 03.07.04 Guntur atau dokter tidak bertanggung jawab atas hasil yang merugikan saya.</p>
          </div>
        </Section>

        {/* Pelepasan Informasi */}
        <Section title="Persetujuan Pelepasan Informasi" number="IV">
          <div className="space-y-3 text-sm text-gray-700 mb-4">
            <p>1. Saya memahami informasi yang ada di dalam diri saya, termasuk diagnosis, hasil laboratorium dan hasil tes diagnostik yang akan digunakan untuk perawatan medis akan dijamin kerahasiaannya oleh Rumah Sakit Tk.IV 03.07.04 Guntur.</p>
            <p>2. Saya memberi wewenang kepada Rumah Sakit Tk.IV 03.07.04 Guntur untuk memberikan informasi tentang diagnosis, hasil pelayanan dan pengobatan bila diperlukan untuk memproses klaim asuransi/perusahaan dan atau lembaga pemerintah serta untuk proses hukum.</p>
            <p>3. Saya memberi wewenang kepada Rumah Sakit Tk.IV 03.07.04 Guntur untuk memberikan informasi tentang diagnosis, hasil pelayanan dan pengobatan kepada anggota keluarga saya yaitu:</p>
          </div>

          <div className="space-y-3 pl-4 border-l-2 border-blue-200">
            {formData.anggotaKeluarga.map((item, index) => (
              <div key={index} className="flex items-end gap-3">
                <div className="flex-1">
                  <FormInput
                    label={`Nama ${index + 1}`}
                    value={item.nama}
                    onChange={(v) => updateAnggotaKeluarga(index, 'nama', v)}
                  />
                </div>
                <div className="flex-1">
                  <FormInput
                    label="Hubungan"
                    value={item.hubungan}
                    onChange={(v) => updateAnggotaKeluarga(index, 'hubungan', v)}
                  />
                </div>
                {formData.anggotaKeluarga.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAnggotaKeluarga(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-0.5"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            {formData.anggotaKeluarga.length < 3 && (
              <button
                type="button"
                onClick={addAnggotaKeluarga}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={16} /> Tambah Anggota Keluarga
              </button>
            )}
          </div>
        </Section>

        {/* Hak dan Kewajiban */}
        <Section title="Hak dan Kewajiban" number="V">
          <div className="space-y-4 text-sm text-gray-700">
            <p>1. Saya memiliki hak untuk mengambil bagian dalam keputusan mengenai penyakit saya/pasien dan dalam hal perawatan medis serta rencana pengobatan.</p>
            <p>2. Saya telah mendapat informasi tentang "Hak dan Kewajiban Pasien" di Rumah Sakit Tk.IV 03.07.04 Guntur.</p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-800 mb-2">A. Hak Pasien:</p>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                <li>Mendapatkan informasi mengenai kesehatan dirinya.</li>
                <li>Mendapatkan penjelasan yang memadai mengenai pelayanan kesehatan yang diterima.</li>
                <li>Mendapatkan pelayanan kesehatan sesuai dengan kebutuhan medis, standar profesi dan pelayanan yang bermutu.</li>
                <li>Menolak atau menyetujui tindakan medis kecuali untuk tindakan medis yang diperlukan dalam rangka pencegahan penyakit menular dan penanggulangan KLB dan wabah.</li>
                <li>Mendapatkan akses terhadap informasi yang terdapat di dalam rekam medis.</li>
                <li>Meminta pendapat tenaga medis atau tenaga kesehatan lain.</li>
                <li>Mendapatkan hak lain sesuai dengan ketentuan peraturan perundang-undangan.</li>
              </ol>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="font-semibold text-amber-800 mb-2">B. Kewajiban Pasien:</p>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                <li>Memberikan informasi yang lengkap dan jujur tentang masalah kesehatannya.</li>
                <li>Mematuhi nasihat dan petunjuk tenaga medis dan tenaga kesehatan.</li>
                <li>Mematuhi ketentuan yang berlaku pada fasilitas pelayanan kesehatan.</li>
                <li>Memberikan imbalan jasa atas pelayanan yang diterima.</li>
              </ol>
            </div>

            <p>3. Saya memahami bahwa Rumah Sakit Tk.IV 03.07.04 Guntur tidak bertanggung jawab atas kehilangan barang-barang pribadi dan barang berharga yang dibawa ke Rumah Sakit.</p>
          </div>
        </Section>

        {/* Informasi Rawat Inap */}
        <Section title="Informasi Rawat Inap" number="VI">
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. Saya tidak diperkenankan untuk membawa barang-barang berharga ke ruang rawat inap, jika ada anggota keluarga atau teman harus diminta untuk membawa pulang uang, perhiasan dan barang-barang berharga lainnya.</p>
            <p>2. Bila tidak ada anggota keluarga, Rumah Sakit menyediakan tempat penitipan barang milik pasien ditempat resmi yang disediakan.</p>
            <p>3. Saya telah menerima informasi tentang peraturan yang berlaku di Rumah Sakit Tk.IV 03.07.04 Guntur dan saya beserta keluarga bersedia untuk mematuhinya, termasuk akan mematuhi jam berkunjung pasien sesuai dengan peraturan Rumah Sakit.</p>
            <p>4. Anggota keluarga saya yang menunggu saya, bersedia untuk selalu memakai tanda pengenal khusus yang diberikan oleh Rumah Sakit.</p>
            <p>5. Demi keamanan seluruh pasien, setiap keluarga dan siapapun yang akan mengunjungi saya di luar jam berkunjung bersedia untuk diminta/diperiksa identitasnya dan memakai kartu pengenal/identitas yang diberikan oleh Rumah Sakit.</p>
          </div>
        </Section>

        {/* Privasi */}
        <Section title="Privasi" number="VII">
          <div className="space-y-4 text-sm text-gray-700">
            <p>1. Pasien ditunggu oleh 1 orang anggota keluarga, apabila dibutuhkan lebih dari 1 penunggu harus ada persetujuan dari petugas ruangan.</p>
            <p>2. Saya:</p>
            <div className="flex gap-4 pl-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="persetujuanPengunjung"
                  value="mengijinkan"
                  checked={formData.persetujuanPengunjung === 'mengijinkan'}
                  onChange={(e) => setFormData(prev => ({ ...prev, persetujuanPengunjung: e.target.value as any }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="font-medium text-green-700">Mengijinkan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="persetujuanPengunjung"
                  value="tidak_mengijinkan"
                  checked={formData.persetujuanPengunjung === 'tidak_mengijinkan'}
                  onChange={(e) => setFormData(prev => ({ ...prev, persetujuanPengunjung: e.target.value as any }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="font-medium text-red-700">Tidak Mengijinkan</span>
              </label>
            </div>
            <p className="text-gray-600">Rumah Sakit Tk.IV 03.07.04 Guntur memberi akses bagi keluarga dan handai taulan serta orang-orang yang akan menengok saya.</p>
            
            {formData.persetujuanPengunjung === 'tidak_mengijinkan' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <FormInput
                  label="Nama yang tidak diijinkan menengok"
                  value={formData.namaTidakDiijinkan}
                  onChange={(v) => setFormData(prev => ({ ...prev, namaTidakDiijinkan: v }))}
                  placeholder="Sebutkan nama..."
                />
              </motion.div>
            )}
          </div>
        </Section>

        {/* Informasi Biaya */}
        <Section title="Informasi Biaya" number="VIII">
          <p className="text-sm text-gray-700">
            Saya memahami tentang informasi biaya pengobatan atau biaya tindakan yang dijelaskan oleh petugas Rumah Sakit Tk.IV 03.07.04 Guntur.
          </p>
        </Section>

        {/* Tanda Tangan */}
        <Section title="Tanda Tangan" number="IX" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              label="Tanggal"
              value={formData.tanggal}
              onChange={(v) => setFormData(prev => ({ ...prev, tanggal: v }))}
              type="date"
            />
            <FormInput
              label="Jam"
              value={formData.jam}
              onChange={(v) => setFormData(prev => ({ ...prev, jam: v }))}
              type="time"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignatureCanvas
              label="Tanda Tangan Pasien / Wali"
              signedData={formData.tandaTanganPasienWali}
              onSign={(dataUrl) => setFormData(prev => ({ ...prev, tandaTanganPasienWali: dataUrl }))}
            />
            <SignatureCanvas
              label="Tanda Tangan Petugas RS"
              signedData={formData.tandaTanganPetugas}
              onSign={(dataUrl) => setFormData(prev => ({ ...prev, tandaTanganPetugas: dataUrl }))}
            />
          </div>
        </Section>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Simpan General Consent
          </button>
        </div>
      </form>
    </div>
  );
}

export default GeneralConsentPage;
