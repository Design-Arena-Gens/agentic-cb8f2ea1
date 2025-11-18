'use client';

import { LeadPlan } from "@/lib/types";
import { CheckIcon, ClipboardCopyIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface PlanPreviewProps {
  plan: LeadPlan | null;
  raw: string | null;
}

export function PlanPreview({ plan, raw }: PlanPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        plan ? JSON.stringify(plan, null, 2) : raw ?? ""
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!plan && !raw) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">
        The generated plan will appear here once you submit the form.
      </div>
    );
  }

  if (!plan && raw) {
    return (
      <div className="space-y-3 rounded-xl border border-yellow-600/40 bg-yellow-950/20 p-6">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-yellow-200">
            Raw AI Response
          </h2>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md bg-yellow-700 px-3 py-1 text-sm font-medium text-yellow-50 transition hover:bg-yellow-600"
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4" /> Copied
              </>
            ) : (
              <>
                <ClipboardCopyIcon className="h-4 w-4" /> Copy
              </>
            )}
          </button>
        </header>
        <pre className="whitespace-pre-wrap text-sm text-yellow-100/90">
          {raw}
        </pre>
      </div>
    );
  }

  if (!plan) return null;

  const sections = [
    {
      title: "Campaign Summary",
      content: (
        <div className="space-y-4">
          <p className="text-base text-slate-200">{plan.campaignSummary.northStar}</p>
          <div>
            <p className="font-medium text-slate-300">Success metrics</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-400">
              {plan.campaignSummary.successMetrics.map((metric) => (
                <li key={metric}>{metric}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-300">Positioning theme</p>
            <p className="mt-1 text-sm text-slate-400">
              {plan.campaignSummary.positioningTheme}
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Ideal Customer Profile",
      content: (
        <div className="grid gap-4 sm:grid-cols-3">
          <Column title="Company traits" items={plan.idealCustomerProfile.companyTraits} />
          <Column title="Buyer persona" items={plan.idealCustomerProfile.buyerPersona} />
          <Column title="Pain points" items={plan.idealCustomerProfile.painPoints} />
        </div>
      )
    },
    {
      title: "Messaging Pillars",
      content: (
        <div className="space-y-4">
          {plan.messagingPillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
            >
              <h3 className="text-base font-semibold text-slate-200">
                {pillar.title}
              </h3>
              <p className="mt-1 text-sm text-slate-400">{pillar.angle}</p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-400">
                {pillar.proofPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Channel Strategy",
      content: (
        <div className="space-y-4">
          {plan.channelStrategy.map((item) => (
            <div
              key={`${item.channel}-${item.objective}`}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-200">
                  {item.channel}
                </h3>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-wide text-indigo-200">
                  {item.cadence}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.objective}</p>
              <p className="mt-2 text-sm text-slate-300">{item.play}</p>
              <div className="mt-3 rounded-md bg-slate-950/50 p-3 text-sm text-slate-400">
                <p className="font-medium text-slate-300">Sample copy</p>
                <p className="mt-1 whitespace-pre-wrap">{item.sampleCopy}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Automation Workflow",
      content: (
        <div className="space-y-4">
          {plan.automationWorkflow.map((flow) => (
            <div
              key={flow.name}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
            >
              <h3 className="text-base font-semibold text-slate-200">
                {flow.name}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                <span className="font-medium text-slate-300">Trigger:</span>{" "}
                {flow.trigger}
              </p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-400">
                {flow.steps.map((step, index) => (
                  <li key={`${flow.name}-${index}`}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Experiments",
      content: (
        <div className="space-y-4">
          {plan.experiments.map((experiment, index) => (
            <div
              key={`${experiment.hypothesis}-${index}`}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
            >
              <h3 className="text-base font-semibold text-slate-200">
                {experiment.hypothesis}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                <span className="font-medium text-slate-300">Experiment:</span>{" "}
                {experiment.experiment}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                <span className="font-medium text-slate-300">Metric:</span>{" "}
                {experiment.metric}
              </p>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Next Steps",
      content: (
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
          {plan.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      )
    }
  ];

  return (
    <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Lead Generation Blueprint
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Copy this JSON to feed downstream playbooks or CRM automation.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <ClipboardCopyIcon className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-lg font-semibold text-slate-200">
              {section.title}
            </h3>
            <div className="mt-3 text-sm text-slate-400">{section.content}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

interface ColumnProps {
  title: string;
  items: string[];
}

function Column({ title, items }: ColumnProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
        {title}
      </p>
      <ul className="mt-2 space-y-2 text-sm text-slate-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
