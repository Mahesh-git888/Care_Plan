// Renders a structured CarePlan into a Portea-branded .docx buffer.
//
// This is a faithful TypeScript port of the portea-care-plan skill's
// references/docx_template.md. The AI only fills the structured fields; this
// fixed code does all rendering, so every document is identical in format and
// the model can never break the layout. Server-side only.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  PageNumber,
  TabStopType,
  TabStopPosition,
} from "docx";

import type { CarePlan } from "@/lib/lead-types";

// Portea brand colours (from the skill).
const TEAL = "0D7377";
const TEAL_LIGHT = "E8F5F5";
const TEAL_DARK = "0A5C5F";
const DARK = "1A2332";
const GREY_LIGHT = "F0F0F0";
const WHITE = "FFFFFF";
const BORDER_GREY = "D4D4D4";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_GREY };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const FULL_WIDTH = 9360;

function cell(
  text: string,
  width: number,
  opts: { bold?: boolean; fill?: string; color?: string; span?: number } = {},
): TableCell {
  const { bold = false, fill = WHITE, color = DARK, span = 1 } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR, color: "auto" },
    margins: cellMargins,
    verticalAlign: VerticalAlign.TOP,
    columnSpan: span,
    children: [
      new Paragraph({
        spacing: { line: 276 },
        children: [new TextRun({ text, bold, color, font: "Arial", size: 20 })],
      }),
    ],
  });
}

function hCell(text: string, width: number): TableCell {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: TEAL, type: ShadingType.CLEAR, color: "auto" },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: WHITE, font: "Arial", size: 20 })],
      }),
    ],
  });
}

function sectionHeader(text: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: FULL_WIDTH, type: WidthType.DXA },
        shading: { fill: TEAL, type: ShadingType.CLEAR, color: "auto" },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        columnSpan: 2,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: text.toUpperCase(), bold: true, color: WHITE, font: "Arial", size: 20 }),
            ],
          }),
        ],
      }),
    ],
  });
}

function labelRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [cell(label, 2800, { bold: true, fill: TEAL_LIGHT }), cell(value, 6560)],
  });
}

function spacer(): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: TEAL })],
  });
}

// A 2-column label/value table with a section header.
function labelValueTable(title: string, rows: { label: string; value: string }[]): Table {
  return new Table({
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    rows: [sectionHeader(title), ...rows.map((r) => labelRow(r.label, r.value || "—"))],
  });
}

// A generic grid table with a header row and shaded alternating body rows.
function gridTable(
  title: string,
  headers: string[],
  widths: number[],
  rows: string[][],
): Table {
  const tableRows: TableRow[] = [sectionHeader(title)];
  tableRows.push(new TableRow({ children: headers.map((h, i) => hCell(h, widths[i])) }));
  rows.forEach((cols, idx) => {
    const fill = idx % 2 === 0 ? WHITE : GREY_LIGHT;
    tableRows.push(
      new TableRow({ children: cols.map((c, i) => cell(c || "—", widths[i], { fill })) }),
    );
  });
  return new Table({ width: { size: FULL_WIDTH, type: WidthType.DXA }, rows: tableRows });
}

function bulletTable(title: string, items: string[]): Table {
  return new Table({
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    rows: [
      sectionHeader(title),
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: FULL_WIDTH, type: WidthType.DXA },
            shading: { fill: WHITE, type: ShadingType.CLEAR, color: "auto" },
            margins: cellMargins,
            columnSpan: 2,
            children: items.map(
              (item) =>
                new Paragraph({
                  spacing: { before: 40, after: 40, line: 276 },
                  children: [
                    new TextRun({ text: "•  " + item, font: "Arial", size: 20, color: DARK }),
                  ],
                }),
            ),
          }),
        ],
      }),
    ],
  });
}

function formatDate(): string {
  try {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// Build the file name: {LastName}_{FirstName}_Care_Plan_Portea.docx
export function carePlanFileName(plan: CarePlan): string {
  const nameRow = plan.patient_info.find((r) => /patient name/i.test(r.label));
  const raw = (nameRow?.value || "Patient")
    .replace(/^(mr|mrs|ms|dr|smt|shri)\.?\s+/i, "")
    .trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  const first = parts[0] || "Patient";
  const last = parts.length > 1 ? parts[parts.length - 1] : "Portea";
  const safe = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "");
  return `${safe(last)}_${safe(first)}_Care_Plan_Portea.docx`;
}

export async function renderCarePlanDocx(plan: CarePlan): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Title block
  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: plan.title || "Care Plan", bold: true, font: "Arial", size: 40, color: TEAL_DARK })],
    }),
  );
  if (plan.subtitle) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: plan.subtitle, font: "Arial", size: 24, color: "666666" })],
      }),
    );
  }
  children.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: `Date: ${formatDate()}`, font: "Arial", size: 20, color: "999999" })],
    }),
  );

  // Sections (only render those with content)
  if (plan.patient_info.length) {
    children.push(labelValueTable("Patient Information", plan.patient_info), spacer());
  }
  if (plan.clinical_summary.length) {
    children.push(labelValueTable("Clinical Summary", plan.clinical_summary), spacer());
  }
  if (plan.care_goals.length) {
    children.push(bulletTable("Care Goals", plan.care_goals), spacer());
  }
  if (plan.service_plan.length) {
    children.push(
      gridTable(
        "Care Team and Service Plan",
        ["Service", "Plan", "Details"],
        [2200, 3580, 3580],
        plan.service_plan.map((s) => [s.service, s.plan, s.details]),
      ),
      spacer(),
    );
  }
  if (plan.equipment.length) {
    children.push(
      gridTable(
        "Equipment Details",
        ["Equipment", "Source", "Status"],
        [3120, 3120, 3120],
        plan.equipment.map((e) => [e.equipment, e.source, e.status]),
      ),
      spacer(),
    );
  }
  if (plan.symptom_protocol.length) {
    children.push(
      gridTable(
        "Symptom Management Protocol",
        ["Symptom", "Current Assessment", "Management Approach"],
        [1800, 3780, 3780],
        plan.symptom_protocol.map((s) => [s.symptom, s.assessment, s.management]),
      ),
      spacer(),
    );
  }
  if (plan.escalation_protocol.length) {
    children.push(
      gridTable(
        "Escalation and Emergency Protocol",
        ["Trigger", "Action Plan"],
        [2400, 6960],
        plan.escalation_protocol.map((e) => [e.trigger, e.action]),
      ),
      spacer(),
    );
  }
  if (plan.communication.length) {
    children.push(labelValueTable("Communication and Coordination", plan.communication), spacer());
  }
  if (plan.gaps.length) {
    children.push(
      heading("To be completed at the first visit"),
      bulletTable("Information to confirm", plan.gaps),
      spacer(),
    );
  }

  // Consent + signatures
  children.push(
    heading("Consent and Acknowledgment"),
    new Paragraph({
      spacing: { after: 160, line: 276 },
      children: [
        new TextRun({
          text: "The family acknowledges this care plan, understands the services proposed, and consents to Portea delivering home-based care as described. This plan will be reviewed and updated as the patient's condition and family preferences change.",
          font: "Arial",
          size: 20,
          color: DARK,
        }),
      ],
    }),
    new Table({
      width: { size: FULL_WIDTH, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            cell("Family member / SPOC\n\nName:\nSignature:\nDate:", 4680),
            cell("Portea representative\n\nName:\nSignature:\nDate:", 4680),
          ],
        }),
      ],
    }),
  );

  // Footer disclaimer
  children.push(
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GREY, space: 8 } },
      spacing: { before: 240, line: 276 },
      children: [
        new TextRun({
          text: "This care plan is a living document and will be updated based on clinical assessments, changes in the patient’s condition, and family preferences. It is confidential and intended solely for the patient, their family, and the Portea Medical care team.",
          font: "Arial",
          size: 18,
          color: "999999",
          italics: true,
        }),
      ],
    }),
  );

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22, color: DARK } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1200, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "PORTEA", bold: true, font: "Arial", size: 24, color: TEAL }),
                  new TextRun({ text: "  HEAL AT HOME", font: "Arial", size: 16, color: TEAL_DARK }),
                  new TextRun({ text: "\tConfidential", font: "Arial", size: 16, color: "999999", italics: true }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
                spacing: { after: 200 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Portea Medical  |  India’s Leading Home Healthcare Company", font: "Arial", size: 16, color: "999999" }),
                  new TextRun({ text: "\tPage ", font: "Arial", size: 16, color: "999999" }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "999999" }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_GREY, space: 4 } },
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc) as Promise<Buffer>;
}
