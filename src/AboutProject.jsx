import React, { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  DollarSign,
  FileCheck2,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import HubLogo from "./shared/HubLogo";

export default function AboutProject() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);

    setTimeout(() => {
      setSent(false);
    }, 3500);
  };

  return (
    <div className="about-page">
      {/* Header */}
      <header className="about-header">
        <div className="about-header-inner">
          <HubLogo showText subtitle="Freelance Platform" />

          <a href="/" className="back-home">
            Back to Home
            <ArrowRight size={17} />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-glow glow-one"></div>
        <div className="about-hero-glow glow-two"></div>

        <div className="about-hero-content">
          <div className="about-logo-large">
            <HubLogo size="lg" />
          </div>

          <span className="about-kicker">
            
            University Freelance Platform
          </span>

          <h1>
            Welcome to <span>Hub Freelance</span>
          </h1>

          <p>
            منصة رقمية تجمع أصحاب المشاريع والفريلانس في مساحة واحدة للعمل
            والتعاون وإدارة المشاريع بطريقة منظمة، واضحة وآمنة.
          </p>

          <div className="hero-actions">
            <a href="/" className="primary-about-btn">
              Explore the Platform
              <ArrowRight size={18} />
            </a>

            <a href="#contact" className="secondary-about-btn">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* About Project */}
      <section className="about-section">
        <div className="section-heading">
          <span>01 — ABOUT THE PROJECT</span>
          <h2>ما هو مشروع Hub Freelance؟</h2>
          <p>
            Hub Freelance هو مشروع منصة عمل حر تهدف إلى تسهيل العلاقة بين
            العميل والفريلانس من بداية إنشاء المشروع وحتى تسليمه وإدارته.
          </p>
        </div>

        <div className="about-description-grid">
          <div className="description-card featured">
            <div className="description-icon">
              <BriefcaseBusiness size={27} />
            </div>

            <h3>بيئة عمل متكاملة</h3>

            <p>
              يستطيع العميل إنشاء المشاريع، استعراض الفريلانس، استقبال العروض
              ومتابعة مراحل العمل، بينما يستطيع الفريلانس استعراض المشاريع,
              تقديم العروض وإدارة أعماله ومشاريعه من مساحة خاصة به.
            </p>
          </div>

          <div className="description-card">
            <div className="description-icon">
              <Users size={27} />
            </div>

            <h3>ثلاث مساحات واضحة</h3>

            <p>
              تم تقسيم النظام إلى Client و Freelancer و Admin، بحيث يمتلك كل
              مستخدم واجهة وأدوات مناسبة لدوره داخل المنصة.
            </p>
          </div>

          <div className="description-card">
            <div className="description-icon">د
              <ShieldCheck size={27} />
            </div>

            <h3>إدارة ومتابعة</h3>

            <p>
              يوفر المشروع أدوات لإدارة المشاريع والمدفوعات والتقييمات
              والبلاغات والاشتراكات والمتابعة الإدارية.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="about-section soft-section">
        <div className="section-heading">
          <span>02 — HOW IT WORKS</span>
          <h2>كيف تعمل المنصة؟</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>إنشاء المشروع</h3>
            <p>
              يحدد العميل فكرة المشروع والمتطلبات والميزانية والمدة المطلوبة.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>استقبال العروض</h3>
            <p>
              يستطيع الفريلانس الاطلاع على المشاريع المناسبة لمهاراتهم
              وإرسال عروضهم.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>اختيار الفريلانس</h3>
            <p>
              يراجع العميل العروض ويختار الفريلانس المناسب لتنفيذ المشروع.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <h3>تنفيذ وتسليم</h3>
            <p>
              تتم متابعة العمل والمهام والتغييرات والتسليم والتقييم من خلال
              مساحة العمل.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="about-section">
        <div className="section-heading">
          <span>03 — PROJECT FEATURES</span>
          <h2>مميزات Hub Freelance</h2>
          <p>
            تم تصميم المنصة لتجمع الأدوات الأساسية التي يحتاجها العميل
            والفريلانس والإدارة في نظام واحد.
          </p>
        </div>

        <div className="features-grid">
          <Feature
            icon={<BriefcaseBusiness />}
            title="Project Management"
            text="إنشاء المشاريع ومتابعة حالتها ومراحل تنفيذها."
          />

          <Feature
            icon={<Users />}
            title="Freelancers Directory"
            text="استعراض الفريلانس ومهاراتهم وخدماتهم وتقييماتهم."
          />

          <Feature
            icon={<FileCheck2 />}
            title="Proposal Management"
            text="إرسال العروض ومراجعتها وقبول العرض المناسب."
          />

          <Feature
            icon={<DollarSign />}
            title="Budget Analysis"
            text="مساعدة الفريلانس على فهم مدى ملاءمة الميزانية للمشروع."
          />

          <Feature
            icon={<Code2 />}
            title="AI Project Assistant"
            text="مقارنة متطلبات المشروع مع مهارات الفريلانس وإظهار نقاط القوة والفجوات والمخاطر."
          />

          <Feature
            icon={<MessageSquareText />}
            title="Scope Change Detection"
            text="متابعة تغييرات نطاق المشروع أثناء التنفيذ وتنظيم طلبات التغيير."
          />

          <Feature
            icon={<WalletCards />}
            title="Wallet & Payments"
            text="متابعة المدفوعات والمحفظة والعمولات والعمليات المالية."
          />

          <Feature
            icon={<ShieldCheck />}
            title="Admin Control"
            text="إدارة المستخدمين والمشاريع والخدمات والمدفوعات والبلاغات والتقييمات."
          />
        </div>
      </section>

      {/* Difference */}
      <section className="difference-section">
        <div className="difference-inner">
          <div className="section-heading light-heading">
            <span>04 — WHAT MAKES IT DIFFERENT</span>
            <h2>ما الذي يميز المشروع عن التطبيقات المشابهة؟</h2>
            <p>
              يركز Hub Freelance على دمج إدارة المشروع وتحليل القرار والمتابعة
              داخل تجربة واحدة بدل الاعتماد على أدوات منفصلة.
            </p>
          </div>

          <div className="difference-grid">
            <Difference
              number="01"
              title="تحليل ملاءمة المشروع"
              text="الفريلانس لا يكتفي برؤية المشروع، بل يمكن أن يحصل على تصور عن مدى توافقه مع مهاراته وخبرته ووقته ومتطلبات المشروع."
            />

            <Difference
              number="02"
              title="تحليل الميزانية"
              text="وجود فكرة تحليلية تساعد الفريلانس على فهم العلاقة بين المتطلبات والوقت والميزانية قبل اتخاذ قرار التقديم."
            />

            <Difference
              number="03"
              title="متابعة تغييرات النطاق"
              text="تسجيل تغييرات العمل أثناء التنفيذ وإظهارها بشكل واضح بدل أن تضيع التعديلات داخل المحادثات."
            />

            <Difference
              number="04"
              title="تجربة منفصلة لكل دور"
              text="العميل والفريلانس والإدارة لكل منهم مساحة وأدوات مختلفة حسب المسؤوليات والصلاحيات."
            />

            <Difference
              number="05"
              title="AI Assistant"
              text="استخدام المساعد الذكي كمفهوم داخل المنصة لمقارنة متطلبات المشروع مع ملف الفريلانس وتوضيح نقاط القوة والفجوات والمخاطر."
            />

            <Difference
              number="06"
              title="نظام متكامل"
              text="المشروع يجمع المشاريع والعروض والخدمات والمحفظة والتقييمات والنزاعات والاشتراكات ضمن منصة واحدة."
            />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="about-section">
        <div className="section-heading">
          <span>05 — PLATFORM ROLES</span>
          <h2>مساحات المستخدمين</h2>
        </div>

        <div className="roles-grid">
          <div className="role-card">
            <span className="role-tag">CLIENT</span>
            <h3>العميل</h3>
            <p>
              ينشئ المشاريع، يراجع العروض، يختار الفريلانس، يتابع التنفيذ
              والمدفوعات والتقييمات.
            </p>
          </div>

          <div className="role-card freelancer-role">
            <span className="role-tag">FREELANCER</span>
            <h3>الفريلانس</h3>
            <p>
              يستعرض المشاريع والخدمات، يقدم العروض، يدير المشاريع ويتابع
              المحفظة والتقييمات والاشتراكات.
            </p>
          </div>

          <div className="role-card admin-role">
            <span className="role-tag">ADMIN</span>
            <h3>الإدارة</h3>
            <p>
              تتابع المستخدمين والمشاريع والخدمات والطلبات والمدفوعات
              والتقارير والإحصائيات والتقييمات.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <div className="team-card">
          <span className="team-label">PROJECT TEAM</span>

          <h2>prepared by</h2>

          <div className="team-members">
            <div>Eng:Zahraa Ali </div>
            <div>Aya Ziad</div>
            <div>Ruqayya Riad</div>
          </div>

          <div className="team-line"></div>

          <p>
            Hub Freelance — A university project designed to connect
            clients and freelancers through a structured digital workspace.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="contact-info">
            <span className="section-small-title">06 — CONTACT US</span>

            <h2>contact us</h2>

            <p>
              If you have any Notes or suggestions about the project, you can contact us using the information below.
            </p>

            <div className="contact-item">
              <div className="contact-icon">
                <Mail size={20} />
              </div>

              <div>
                <span>Email</span>
                <strong>freelancehub.project@gmail.com</strong>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <Phone size={20} />
              </div>

              <div>
                <span>Mobile</span>
                <strong>07XX XXX XXXX</strong>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h3>Send Us Your Feedback</h3>

            <label>
              Name
              <input type="text" placeholder="Enter your name" required />
            </label>

            <label>
              Email
              <input
                type="email"
                placeholder="example@email.com"
                required
              />
            </label>

            <label>
              Note
              <textarea
                placeholder="your note..."
                rows="5"
                required
              ></textarea>
            </label>

            <button type="submit">
              إرسال الملاحظات
              <ArrowRight size={17} />
            </button>

            {sent && (
              <div className="success-message">
                <CheckCircle2 size={17} />
                 your Notes has been sent successfully!
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <HubLogo showText subtitle="Connect • Work • Grow" />

        <p>
          © {new Date().getFullYear()} Hub Freelance. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Difference({ number, title, text }) {
  return (
    <div className="difference-card">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}