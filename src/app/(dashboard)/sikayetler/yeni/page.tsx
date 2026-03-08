import { ComplaintForm } from '../components/ComplaintForm';

export default function YeniSikayetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Yeni Şikayet</h1>
        <p className="text-slate-500 mt-1">
          Sosyal medyadan gelen yeni bir şikayet kaydı oluşturun.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <ComplaintForm />
      </div>
    </div>
  );
}
