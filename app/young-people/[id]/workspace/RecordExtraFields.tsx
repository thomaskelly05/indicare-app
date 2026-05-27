"use client";

type FieldDefinition = {
  name: string;
  label: string;
  helper?: string;
  type?: "text" | "textarea" | "datetime-local" | "date" | "number";
};

const fieldTemplates: Record<string, FieldDefinition[]> = {
  "daily note": [
    { name: "shift_type", label: "Shift type", helper: "For example: early, late, night." },
    { name: "mood", label: "Presentation / mood" },
    { name: "young_person_voice", label: "Young person voice", type: "textarea" },
    { name: "positives", label: "Strengths / positives", type: "textarea" },
  ],
  incident: [
    { name: "incident_type", label: "Incident type" },
    { name: "antecedent", label: "What happened before?", type: "textarea" },
    { name: "staff_response", label: "What did adults do?", type: "textarea" },
    { name: "child_response", label: "How did the child respond?", type: "textarea" },
    { name: "outcome", label: "Outcome", type: "textarea" },
    { name: "trauma_informed_formulation", label: "Therapeutic understanding", type: "textarea" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
    { name: "restorative_follow_up", label: "Restorative follow-up", type: "textarea" },
  ],
  "missing episode": [
    { name: "trigger_factors", label: "Trigger factors", type: "textarea" },
    { name: "push_pull_factors", label: "Push / pull factors", type: "textarea" },
    { name: "outcome", label: "Outcome", type: "textarea" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
    { name: "contextual_risk_notes", label: "Contextual risk notes", type: "textarea" },
  ],
  "safeguarding concern": [
    { name: "safeguarding_category", label: "Safeguarding category" },
    { name: "disclosure_details", label: "Disclosure details", type: "textarea" },
    { name: "referral_details", label: "Referral details", type: "textarea" },
    { name: "outcome", label: "Outcome", type: "textarea" },
  ],
  keywork: [
    { name: "purpose", label: "Purpose of session", type: "textarea" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
    { name: "reflective_analysis", label: "Reflective analysis", type: "textarea" },
  ],
  "direct work": [
    { name: "purpose", label: "Purpose", type: "textarea" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
    { name: "emotional_response", label: "Emotional response", type: "textarea" },
    { name: "reflective_note", label: "Reflective note", type: "textarea" },
    { name: "next_step", label: "Next step", type: "textarea" },
  ],
  "health update": [
    { name: "record_type", label: "Health record type" },
    { name: "professional_name", label: "Professional name" },
    { name: "outcome", label: "Outcome", type: "textarea" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
  ],
  "education update": [
    { name: "attendance_status", label: "Attendance status" },
    { name: "provision_name", label: "School / provision" },
    { name: "behaviour_summary", label: "Behaviour / presentation", type: "textarea" },
    { name: "learning_engagement", label: "Learning engagement", type: "textarea" },
    { name: "professional_involved", label: "Professional involved" },
    { name: "achievement_note", label: "Achievement / progress", type: "textarea" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
  ],
  "family contact": [
    { name: "contact_type", label: "Contact type" },
    { name: "contact_person", label: "Contact person" },
    { name: "supervision_level", label: "Supervision level" },
    { name: "location", label: "Location" },
    { name: "pre_contact_presentation", label: "Before contact", type: "textarea" },
    { name: "post_contact_presentation", label: "After contact", type: "textarea" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
    { name: "relationship_impact", label: "Impact on relationship / wellbeing", type: "textarea" },
  ],
  appointment: [
    { name: "appointment_type", label: "Appointment type", helper: "For example: dental, health, CAMHS, review." },
    { name: "appointment_date", label: "Appointment date/time", type: "datetime-local" },
    { name: "end_datetime", label: "End date/time", type: "datetime-local" },
    { name: "location", label: "Location" },
    { name: "professional_name", label: "Professional name" },
    { name: "professional_role", label: "Professional role" },
    { name: "purpose", label: "Purpose", type: "textarea" },
    { name: "preparation_notes", label: "Preparation notes", type: "textarea" },
    { name: "outcome_notes", label: "Outcome notes", type: "textarea" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
  ],
  "lifeecho memory": [
    { name: "entry_type", label: "Life story entry type" },
    { name: "child_voice", label: "Child voice", type: "textarea" },
    { name: "is_private", label: "Private? type true or false" },
  ],
  "child voice": [
    { name: "context", label: "Context" },
    { name: "how_voice_influenced_care", label: "How this influenced care", type: "textarea" },
  ],
  handover: [
    { name: "shift_type", label: "Shift type" },
  ],
};

function normaliseType(type: string) {
  return String(type || "").toLowerCase().trim();
}

export function defaultRecordDetails(type: string): Record<string, string> {
  const fields = fieldTemplates[normaliseType(type)] || [];
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});
}

export function RecordExtraFields({
  type,
  values,
  onChange,
}: {
  type: string;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  const fields = fieldTemplates[normaliseType(type)] || [];

  if (!fields.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">
        {type} specific details
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        These fields are sent to the correct database columns for this record type.
      </p>
      <div className="mt-4 grid gap-4">
        {fields.map((field) => (
          <label
            key={field.name}
            className="grid gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500"
          >
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                value={values[field.name] || ""}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="min-h-24 rounded-2xl border border-blue-100 bg-white p-4 text-base normal-case tracking-normal text-slate-900"
              />
            ) : (
              <input
                type={field.type || "text"}
                value={values[field.name] || ""}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="rounded-2xl border border-blue-100 bg-white p-4 text-base normal-case tracking-normal text-slate-900"
              />
            )}
            {field.helper ? <span className="text-xs font-semibold normal-case tracking-normal text-slate-500">{field.helper}</span> : null}
          </label>
        ))}
      </div>
    </section>
  );
}
