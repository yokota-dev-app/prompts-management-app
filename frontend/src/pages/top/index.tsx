import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import step1Image from "../../assets/images/step1_create_prompt.png";
import step2Image from "../../assets/images/step2_copy_prompt_and_jump_to_link.png";

const buttonClasses =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-lg border border-solid border-transparent text-sm font-bold transition duration-200 hover:-translate-y-px";
const primaryButtonClasses =
  "bg-(--top-purple) text-white [box-shadow:0_8px_20px_rgba(104,84,217,0.2)] hover:bg-(--top-purple-dark) hover:[box-shadow:0_10px_24px_rgba(104,84,217,0.28)] focus:outline-[#005fcc]";

const highlights = [
  {
    icon: "⌕",
    iconClasses: "bg-[#f0edff] text-[#6c58d7]",
    title: "簡単な管理・検索",
    description: "メモ帳やチャットに散らばったプロンプトを、一か所に集約。名前やキーワードからすぐ見つけられます。",
  },
  {
    icon: "↻",
    iconClasses: "bg-[#e6f7ef] text-[#3e9b79]",
    title: "すぐに使える",
    description: "ワンクリックでコピーして、すぐにAIツールにジャンプ。操作最小限でプロンプトを使い回せます。",
  },
  {
    icon: "✳",
    iconClasses: "bg-[#fff1e3] text-[#d28b4b]",
    title: "柔軟な変数入力",
    description: "変数の設定はフォームで簡単入力。毎回プロンプトを書き直す手間を減らします。",
  },
];

const usageSteps = [
  {
    step: "Step1.",
    title: "プロンプトを作成",
    image: step1Image,
    alt: "プロンプト作成画面",
  },
  {
    step: "Step2.",
    title: "プロンプトコピー＆AIツールにジャンプ",
    image: step2Image,
    alt: "プロンプトをコピーしてAIツールにジャンプする画面",
  },
];

function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <Link
      className={`${buttonClasses} ${primaryButtonClasses} min-h-13 px-5 sm:px-6`}
      to="/signup"
    >
      {children}
    </Link>
  );
}

function TopView() {
  return (
    <div className="overflow-hidden bg-white">
      <main>
        <section
          className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-9 px-5 pt-14 pb-16 md:grid-cols-2 md:gap-2 md:px-8 md:pt-18 md:pb-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-2 lg:px-12 lg:pt-24"
          aria-labelledby="top-hero-title"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-solid border-[#e9e4ff] bg-[#f8f6ff] px-3 py-2 text-base font-bold text-[#6552c5]">
              <span className="h-2 w-2 rounded-full bg-[#8d7be9] [box-shadow:0_0_0_4px_#e9e4ff]" />
              プロンプトを、使い捨てにしない。
            </div>
            <h1
              className="m-0 mt-6 mb-5 text-2xl leading-relaxed tracking-tight font-extrabold md:text-3xl lg:text-4xl xl:text-5xl"
              id="top-hero-title"
            >
              いつもの仕事を、
              <br />
              <span className="whitespace-nowrap"><span className="text-(--top-purple)">いつものプロンプト</span>で。</span>
            </h1>
            <p className="m-0 text-base leading-loose text-[#777686] md:text-base">
              お気に入りのプロンプトをひとつに整理。
              <br />
              変数設定とワンクリックコピーで必要なときにすぐ使えます。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-5">
              <PrimaryButton>
                無料で始める
                <span aria-hidden="true">→</span>
              </PrimaryButton>
              <a className="text-sm font-bold text-[#5e5a70]" href="#how-to-use">
                使い方を見る <span className="pl-1 text-(--top-purple)" aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="mt-5 mb-0 flex items-center gap-2 text-base text-[#8a8997]">
              <svg className="h-4 w-4 fill-none stroke-[#58a887] stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 20 20" aria-hidden="true">
                <path d="m4 10 4 4 8-9" />
              </svg>
              まずは、よく使うプロンプトを1つ登録するだけ。
            </p>
          </div>

          <div className="w-full" aria-label="プロンプト管理画面のイメージ">
            <img
              src="/src/assets/images/top_hero.jpg"
              alt="Promptsのマイプロンプト画面"
              width={1280}
              height={760}
              className="block h-auto w-full"
            />
          </div>
        </section>

        <section
          className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-5 pb-16 md:grid-cols-3 md:gap-3 md:px-8 md:pb-20 lg:gap-6 lg:px-20 lg:pb-24"
          aria-label="サービスの特徴"
        >
          {highlights.map((highlight) => (
            <div
              className="flex items-start gap-3 rounded-xl border border-solid border-[#efedf5] bg-white p-4 lg:gap-4 lg:px-5 lg:py-6"
              key={highlight.title}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-2xl font-medium lg:h-11 lg:w-11 ${highlight.iconClasses}`}>
                {highlight.icon}
              </span>
              <div>
                <h2 className="mt-px mb-1.5 text-lg">{highlight.title}</h2>
                <p className="m-0 text-sm leading-relaxed text-[#858292]">{highlight.description}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-[#f9f8fc] px-5 py-16 md:px-8 md:py-20 lg:px-20 lg:py-24" aria-labelledby="top-usage-title"  id="how-to-use">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-7 max-w-2xl text-center md:mb-10">
              <span className="text-base font-extrabold tracking-widest text-[#7564d7]">HOW IT WORKS</span>
              <h2 className="mt-3 mb-0 text-2xl leading-normal tracking-tight md:text-3xl" id="top-usage-title">使い方</h2>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8">
              {usageSteps.map((step) => (
                <article key={step.step}>
                  <h3 className="mb-3 mt-0 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl md:text-lg">
                    <span className="text-xl font-bold text-[#7564d7]">{step.step}</span>
                    {step.title}
                  </h3>
                  <img className="block h-auto w-full rounded-lg border border-solid border-[#e9e7ef]" src={step.image} alt={step.alt} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-4 my-12 overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#f4f1ff,#faf8ff_55%,#f0f8f5)] px-5 py-12 text-center md:mx-auto md:my-20 md:max-w-6xl md:px-6 md:py-16">
          <div className="absolute -top-8 right-8 text-9xl text-[rgba(126,107,222,0.12)]" aria-hidden="true">✳</div>
          <span className="text-base font-extrabold tracking-widest text-[#7564d7]">LESS SEARCHING, MORE CREATING</span>
          <h2 className="mt-4 mb-3 text-3xl leading-relaxed tracking-tight md:text-4xl">探す時間を減らして、<br />いい仕事に集中しよう。</h2>
          <p className="mt-0 mb-6 text-base text-[#858292]">あなたのプロンプトを、頼れる仕事道具に。</p>
          <PrimaryButton>無料で始める <span aria-hidden="true">→</span></PrimaryButton>
        </section>
      </main>
    </div>
  );
}

export default function TopPage() {
  return <TopView />;
}
