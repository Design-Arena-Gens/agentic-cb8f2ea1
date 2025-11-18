'use client';

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { z } from "zod";
import clsx from "clsx";
import {
  channelOptions,
  goalOptions,
  leadRequestSchema,
  toneOptions
} from "@/lib/schemas";
import type { LeadPlan } from "@/lib/types";
import { PlanPreview } from "@/components/PlanPreview";
import { RocketIcon } from "@radix-ui/react-icons";

type LeadFormState = z.infer<typeof leadRequestSchema>;

const defaultState: LeadFormState = {
  businessName: "Lumos Analytics",
  industry: "B2B SaaS • Marketing Analytics",
  productDescription:
    "A RevOps intelligence platform that connects marketing campaigns to pipeline impact and provides automated recommendations.",
  targetCustomer:
    "Heads of Demand Gen or Growth at Series B-D SaaS companies using HubSpot/Salesforce, running multi-channel campaigns, needing clearer ROI.",
  uniqueValue:
    "Real-time attribution without heavy implementation, plus AI suggestions that surface tactics proven to lift opportunity creation.",
  goals: ["Book discovery calls", "Increase demo requests"],
  channels: ["Cold email", "LinkedIn outreach", "Webinars"],
  tone: "Data-driven",
  offer: "Unlock a free pipeline efficiency audit with tailored next steps.",
  notes:
    "We recently partnered with Gong and have a customer story from Segment. We collaborate closely with RevOps teams.",
  budgetLevel: "balanced",
  timeframe: "30 days"
};

const timeframeOptions: LeadFormState["timeframe"][] = [
  "2 weeks",
  "30 days",
  "90 days"
];

interface ErrorMap {
  [key: string]: string;
}

export default function Page() {
  const [form, setForm] = useState<LeadFormState>(defaultState);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LeadPlan | null>(null);
  const [rawPlan, setRawPlan] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const goalSelections = useMemo(() => new Set(form.goals), [form.goals]);
  const channelSelections = useMemo(
    () => new Set(form.channels),
    [form.channels]
  );

  const updateField = <K extends keyof LeadFormState>(
    key: K,
    value: LeadFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSelection = <T extends string>(
    value: T,
    selected: Set<T>,
    key: keyof Pick<LeadFormState, "goals" | "channels">
  ) => {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }

    updateField(key, Array.from(next) as LeadFormState[typeof key]);
  };

  const resetForm = () => {
    setForm(defaultState);
    setErrors({});
    setPlan(null);
    setRawPlan(null);
    setStatusMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrors({});

    let payload: LeadFormState;

    try {
      payload = leadRequestSchema.parse(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: ErrorMap = {};
        for (const [field, messages] of Object.entries(
          error.flatten().fieldErrors
        )) {
          if (messages && messages.length) {
            fieldErrors[field] = messages[0];
          }
        }
        setErrors(fieldErrors);
        return;
      }
      setStatusMessage("Something went wrong validating your inputs.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        setStatusMessage(
          data?.error ??
            "Unexpected error from the lead generation agent. Try again."
        );
        setPlan(null);
        setRawPlan(null);
        return;
      }

      const data = await response.json();
      setPlan(data.plan);
      setRawPlan(data.raw);
      if (data.warning) {
        setStatusMessage(data.warning);
      } else if (data.notice) {
        setStatusMessage(data.notice);
      } else {
        setStatusMessage("Campaign blueprint generated!");
      }
    } catch (error) {
      console.error(error);
      setStatusMessage(
        "Network error. Check your connection and try generating again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:gap-10 md:py-20">
      <section className="w-full md:w-[46%]">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300">
            <RocketIcon className="h-4 w-4" />
            Lead Generation AI Agent
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ship a channel-ready pipeline plan in minutes
          </h1>
          <p className="text-base text-slate-400">
            Answer a few strategy prompts and Pipeline Pilot will craft a
            multi-channel lead engine with copy, cadences, workflows, and
            experiments tuned to your goals.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur"
        >
          <Field
            label="Business name"
            error={errors.businessName}
            children={
              <input
                value={form.businessName}
                onChange={(event) => updateField("businessName", event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                placeholder="Acme Growth Labs"
              />
            }
          />
          <Field
            label="Industry / segment"
            error={errors.industry}
            children={
              <input
                value={form.industry}
                onChange={(event) => updateField("industry", event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                placeholder="B2B SaaS • Manufacturing • Fintech"
              />
            }
          />
          <Field
            label="Product snapshot"
            error={errors.productDescription}
            hint="What do you deliver and why does it matter?"
            children={
              <textarea
                value={form.productDescription}
                onChange={(event) =>
                  updateField("productDescription", event.target.value)
                }
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            }
          />
          <Field
            label="Target customer & pain"
            error={errors.targetCustomer}
            hint="Titles, company traits, existing tools, daily frustrations."
            children={
              <textarea
                value={form.targetCustomer}
                onChange={(event) =>
                  updateField("targetCustomer", event.target.value)
                }
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            }
          />
          <Field
            label="Why you win"
            error={errors.uniqueValue}
            hint="Differentiators, social proof, performance guarantees."
            children={
              <textarea
                value={form.uniqueValue}
                onChange={(event) => updateField("uniqueValue", event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            }
          />

          <fieldset>
            <legend className="text-sm font-medium text-slate-200">
              Pipeline goals
            </legend>
            <p className="mt-1 text-xs text-slate-500">
              Select all outcomes you need this campaign to drive.
            </p>
            <div className="mt-3 grid gap-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() =>
                    toggleSelection(goal, goalSelections, "goals")
                  }
                  className={clsx(
                    "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                    goalSelections.has(goal)
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-200"
                      : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-indigo-400/40 hover:bg-slate-900/80"
                  )}
                >
                  {goal}
                </button>
              ))}
            </div>
            {errors.goals && (
              <p className="mt-1 text-xs text-rose-300">{errors.goals}</p>
            )}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-slate-200">
              Channels to emphasize
            </legend>
            <p className="mt-1 text-xs text-slate-500">
              The agent will orchestrate plays and copy for each selection.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {channelOptions.map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() =>
                    toggleSelection(channel, channelSelections, "channels")
                  }
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-left text-sm transition",
                    channelSelections.has(channel)
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-emerald-400/40 hover:bg-slate-900/80"
                  )}
                >
                  {channel}
                </button>
              ))}
            </div>
            {errors.channels && (
              <p className="mt-1 text-xs text-rose-300">{errors.channels}</p>
            )}
          </fieldset>

          <Field
            label="Offer / CTA"
            error={errors.offer}
            children={
              <input
                value={form.offer}
                onChange={(event) => updateField("offer", event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            }
          />

          <Field
            label="Preferred tone"
            error={errors.tone}
            children={
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => updateField("tone", tone)}
                    className={clsx(
                      "rounded-lg border px-3 py-2 text-sm transition",
                      form.tone === tone
                        ? "border-blue-500 bg-blue-500/10 text-blue-200"
                        : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-blue-400/40 hover:bg-slate-900/80"
                    )}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            }
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Budget posture"
              error={errors.budgetLevel}
              children={
                <select
                  value={form.budgetLevel}
                  onChange={(event) =>
                    updateField(
                      "budgetLevel",
                      event.target.value as LeadFormState["budgetLevel"]
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                >
                  <option value="lean">Lean</option>
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              }
            />

            <Field
              label="Activation window"
              error={errors.timeframe}
              children={
                <select
                  value={form.timeframe}
                  onChange={(event) =>
                    updateField(
                      "timeframe",
                      event.target.value as LeadFormState["timeframe"]
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                >
                  {timeframeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              }
            />
          </div>

          <Field
            label="Notes for the agent"
            error={errors.notes}
            hint="Partnerships, existing automations, growth constraints, etc."
            children={
              <textarea
                value={form.notes ?? ""}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            }
          />

          {statusMessage && (
            <p className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">
              {statusMessage}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50",
                loading && "cursor-not-allowed opacity-70"
              )}
            >
              {loading ? "Orchestrating..." : "Generate pipeline plan"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              Reset to sample
            </button>
          </div>
        </form>
      </section>

      <section className="w-full md:w-[54%]">
        <PlanPreview plan={plan} raw={rawPlan} />
      </section>
    </main>
  );
}

function Field({
  label,
  hint,
  error,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
      {children}
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </label>
  );
}
