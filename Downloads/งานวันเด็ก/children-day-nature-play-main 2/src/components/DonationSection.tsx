import { Copy, Heart, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import qrCode from '@/assets/qr-donate.jpg';

const DonationSection = () => {
  const accountNumber = '000-0-00000-0';

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber.replace(/-/g, ''));
    toast.success('คัดลอกเลขบัญชีแล้ว!', {
      description: 'สามารถนำไปวางในแอปธนาคารได้เลย',
    });
  };

  const openLineContact = () => {
    window.open('https://line.me/ti/p/@childrensday2026', '_blank');
  };

  return (
    <section id="donate" className="section-padding bg-primary/10 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 px-2">
          <span className="inline-block text-primary font-medium mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">
            ร่วมสนับสนุน
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            ช่องทางการบริจาค
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground italic">
            "ทุกการแบ่งปันของคุณ คือทักษะที่จะติดตัวเด็กๆ ไปตลอดชีวิต"
          </p>
        </div>

        {/* Bank Details Box */}
        <div className="max-w-2xl mx-auto px-2">
          <div className="bank-box text-center p-4 sm:p-6 md:p-8">
            {/* QR Code */}
            <div className="mb-4 sm:mb-6">
              <img
                src={qrCode}
                alt="QR Code สำหรับบริจาค"
                className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 mx-auto rounded-xl shadow-md object-contain"
              />
            </div>

            {/* Bank Info */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div>
                <span className="text-xs sm:text-sm text-muted-foreground block mb-1">ธนาคาร</span>
                <span className="text-lg sm:text-xl font-semibold text-foreground">ธนาคารกสิกรไทย</span>
              </div>

              <div>
                <span className="text-xs sm:text-sm text-muted-foreground block mb-1">ชื่อบัญชี</span>
                <span className="text-lg sm:text-xl font-semibold text-foreground">Children's Day 2026</span>
              </div>

              <div>
                <span className="text-xs sm:text-sm text-muted-foreground block mb-2">เลขที่บัญชี</span>
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <span className="text-xl sm:text-2xl md:text-4xl font-bold text-primary tracking-wider">
                    {accountNumber}
                  </span>
                  <button
                    onClick={copyAccountNumber}
                    className="p-2 sm:p-3 bg-primary/10 hover:bg-primary/20 rounded-lg sm:rounded-xl transition-colors group"
                    title="คัดลอกเลขบัญชี"
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-6 sm:my-8" />

            {/* LINE Contact Button */}
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                หลังโอนเงินแล้ว กรุณาแจ้งสลิปเพื่อรับใบเสร็จและติดตามโครงการ
              </p>
              <button
                onClick={openLineContact}
                className="btn-line text-base sm:text-lg w-full justify-center py-3 sm:py-4"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                <span className="flex-1 text-center">แจ้งสลิปโอนเงิน / ทักแอดมิน</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>ปลอดภัย 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>มีใบเสร็จรับเงิน</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>โปร่งใส ตรวจสอบได้</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;
