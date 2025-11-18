import { NextResponse } from "next/server";
import { buildLeadPlanPrompt } from "@/lib/prompt";
import { leadRequestSchema, type LeadRequest } from "@/lib/schemas";
import { getOpenAIClient } from "@/lib/openai";
import { tryParsePlan } from "@/lib/types";

function buildFallbackPlan(payload: LeadRequest) {
  return {
    campaignSummary: {
      northStar: `Generate qualified pipeline for ${payload.businessName} within ${payload.timeframe}.`,
      successMetrics: [
        "Meetings booked per week",
        "Reply rate %",
        "Pipeline value influenced"
      ],
      positioningTheme: `Position as the ${payload.uniqueValue.toLowerCase()}`
    },
    idealCustomerProfile: {
      companyTraits: [
        `Operates in ${payload.industry}`,
        "Mid-market to enterprise accounts",
        "Teams with urgent need for modernization"
      ],
      buyerPersona: [
        "Economic buyer: VP / Director level stakeholder",
        "Technical champion: hands-on practitioner",
        "Influencer: adjacent department peer"
      ],
      painPoints: [
        "Manual workflows causing wasted spend",
        "Pressure to show ROI quickly",
        "Need to differentiate in competitive market"
      ]
    },
    messagingPillars: [
      {
        title: "Value driver",
        angle: `Highlight how ${payload.productDescription.toLowerCase()} unlocks measurable ROI.`,
        proofPoints: [
          "Quantify time or cost savings",
          "Reference a key customer win",
          "Mention implementation support"
        ]
      },
      {
        title: "Risk reducer",
        angle:
          "Show how the offer reduces risk compared to current status quo.",
        proofPoints: [
          "Share guarantee or SLA",
          "Provide social proof snippet",
          "Emphasize ease-of-adoption"
        ]
      }
    ],
    channelStrategy: payload.channels.map((channel) => ({
      channel,
      objective: `Drive ${payload.offer.toLowerCase()} conversions.`,
      play: `Run a ${payload.budgetLevel} budget program combining intent data and manual research.`,
      cadence: payload.timeframe === "2 weeks" ? "3x weekly" : "Weekly",
      sampleCopy: `Hi {{first_name}}, ${payload.offer}`
    })),
    automationWorkflow: [
      {
        name: "Prompt follow-up sequence",
        trigger: "Form submission or positive reply",
        steps: [
          "Send tailored follow-up within 4 hours",
          "Share relevant asset on day 3",
          "Escalate to call invite on day 5 if no response"
        ]
      }
    ],
    experiments: [
      {
        hypothesis:
          "Referencing a mutual connection increases cold outreach replies.",
        experiment: "Test LinkedIn InMail templates with social proof block.",
        metric: "Positive reply rate"
      },
      {
        hypothesis: "Offering a quick teardown boosts meeting bookings.",
        experiment: "Cold email variant offering 15-min audit.",
        metric: "Meetings booked"
      }
    ],
    nextSteps: [
      "Finalize lead list with top 200 accounts",
      "Draft channel-specific outreach scripts",
      "Enable experiment tracking dashboard",
      "Launch in waves and optimize weekly"
    ]
  };
}

export async function POST(request: Request) {
  const raw = await request.json();
  const parsed = leadRequestSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        plan: buildFallbackPlan(payload),
        raw: null,
        warning:
          "OPENAI_API_KEY is not configured. Responding with a heuristic fallback plan."
      },
      { status: 200 }
    );
  }

  try {
    const client = getOpenAIClient();
    const prompt = buildLeadPlanPrompt(payload);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are Pipeline Pilot, a senior demand generation strategist. Always respond with strictly valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const responseText =
      completion.choices?.[0]?.message?.content ?? "";
    const { plan, raw: rawPlan, message } = tryParsePlan(responseText);

    return NextResponse.json(
      {
        plan: plan ?? null,
        raw: plan ? null : rawPlan,
        notice: message ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        plan: buildFallbackPlan(payload),
        raw: null,
        warning:
          "Failed to generate plan with OpenAI. Provided a fallback strategy instead."
      },
      { status: 200 }
    );
  }
}
