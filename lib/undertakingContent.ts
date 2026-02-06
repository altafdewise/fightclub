/**
 * Client Portal Undertaking Agreement Content
 * Plain-English fitness coaching consent form
 */

export const UNDERTAKING_TEXT = `BRUTAL COACHING UNDERTAKING AGREEMENT

1. WHAT THIS AGREEMENT MEANS

You are about to begin a fitness coaching program with BRUTAL. This agreement clarifies what fitness coaching is, what it isn't, and what we both agree to.

This is important: Fitness coaching is not medical treatment. Nothing in this program replaces medical care, diagnoses, or treatment from a qualified healthcare provider.

2. WHAT FITNESS COACHING IS

Fitness coaching means:
- Personalized exercise programming
- Guidance on training techniques and form
- Nutritional recommendations and education
- Progress tracking and accountability
- Motivation and support

Fitness coaching does NOT include:
- Medical diagnosis or treatment
- Prescription of medication
- Physical therapy or rehabilitation after injury
- Medical advice
- Treatment of medical conditions

3. YOUR HEALTH & MEDICAL CONDITIONS

Before starting:
- You have disclosed all known medical conditions (past and present)
- You have disclosed all current injuries
- You have disclosed all medications and supplements
- You have disclosed any allergies
- You have been honest about your health history

If you have not disclosed something, you must do so now before proceeding.

You understand that your trainer is not a doctor and cannot diagnose or treat medical conditions. If you have questions about your health or medical conditions, you must consult your doctor.

4. RESULTS VARY & DEPEND ON YOU

Fitness results depend on many factors:
- Your effort and consistency
- Your genetics and metabolism
- Your age and current fitness level
- Your nutrition and sleep
- Your health and medical history
- Lifestyle factors outside coaching

Your trainer cannot guarantee results. Results are your responsibility, based on your effort and commitment.

5. YOU TAKE RESPONSIBILITY

By participating in this program, you:
- Voluntarily assume all risks related to fitness training
- Accept responsibility for your own safety
- Take responsibility for your recovery and wellbeing
- Understand that your trainer is providing guidance, not medical care
- Agree to use common sense and listen to your body

6. YOU MUST COMMUNICATE CHANGES

If during the program you experience:
- New pain or injury
- Changes in your health
- New medications or medical conditions
- Any concerns about your wellbeing
- Any reason you feel unsafe

You must immediately inform your trainer. Your trainer cannot help you if you don't communicate.

7. TRAINER'S ROLE & LIMITATIONS

Your trainer will:
- Design exercise programs based on your goals and abilities
- Provide guidance on proper technique
- Offer nutritional recommendations
- Monitor your progress
- Adjust your program as needed

Your trainer will NOT:
- Diagnose injuries or medical conditions
- Prescribe treatment or medication
- Provide medical advice
- Act as a substitute for medical professionals
- Be responsible for your health outcomes

8. YOUR AGREEMENT

By checking the boxes below, you confirm:
- You understand fitness coaching is not medical treatment
- You have disclosed your complete health history
- You understand your trainer cannot diagnose or prescribe
- You accept personal responsibility for your participation
- You will communicate any health changes
- You have read and understood this entire agreement`;

export interface UndertakingCheckbox {
  id: string;
  label: string;
  required: boolean;
}

export const UNDERTAKING_CHECKBOXES: UndertakingCheckbox[] = [
  {
    id: "medical_not_treatment",
    label: "I understand that fitness coaching is not medical treatment.",
    required: true,
  },
  {
    id: "disclosed_health_info",
    label:
      "I confirm I have disclosed all known medical conditions, injuries, and medications.",
    required: true,
  },
  {
    id: "trainer_no_diagnose",
    label: "I understand the trainer does not diagnose or prescribe treatment.",
    required: true,
  },
  {
    id: "accept_responsibility",
    label:
      "I agree to take responsibility for my participation and recovery.",
    required: true,
  },
  {
    id: "inform_trainer",
    label: "I agree to inform the trainer of any changes to my health.",
    required: true,
  },
];

export const FINAL_CHECKBOX: UndertakingCheckbox = {
  id: "final_agreement",
  label:
    "I have read, understood, and agree to the undertaking.",
  required: true,
};

export type UndertakingCheckboxState = Record<string, boolean>;

export function createInitialCheckboxState(): UndertakingCheckboxState {
  const state: UndertakingCheckboxState = {};
  UNDERTAKING_CHECKBOXES.forEach((checkbox) => {
    state[checkbox.id] = false;
  });
  state[FINAL_CHECKBOX.id] = false;
  return state;
}

export function areAllCheckboxesChecked(
  state: UndertakingCheckboxState
): boolean {
  return UNDERTAKING_CHECKBOXES.every((checkbox) => state[checkbox.id]) &&
    state[FINAL_CHECKBOX.id];
}
