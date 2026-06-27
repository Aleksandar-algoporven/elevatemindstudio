from anthropic import Anthropic

from app.models import DraftRequest, GeneratedDraft
from app.settings import settings


class DraftGenerationError(RuntimeError):
    pass


def build_draft_prompt(request: DraftRequest) -> str:
    return f"""
You are the AI engine inside ElevateMindStudio.

Create one social media draft for review.

Rules:
- Do not invent unsupported performance claims.
- Keep the copy concrete and source-backed.
- Include a concise asset brief.
- Output plain text sections with these labels:
  TITLE:
  COPY:
  ASSET_BRIEF:
  RISK_LEVEL:
  REVIEW_NOTES:

Brand: {request.brand_name}
Pillar: {request.pillar}
Channel: {request.channel}
Goal: {request.goal}
Source summary: {request.source_summary}
""".strip()


def fallback_draft(request: DraftRequest) -> GeneratedDraft:
    return GeneratedDraft(
        title=f"{request.pillar} for {request.channel}",
        channel=request.channel,
        pillar=request.pillar,
        copy_text=(
            "Draft generation is wired, but ANTHROPIC_API_KEY is not configured. "
            "This placeholder keeps the approval workflow testable without calling the model."
        ),
        asset_brief="Use a clean product-ops visual with source references and one clear takeaway.",
        risk_level="low",
        review_notes=["Configure ANTHROPIC_API_KEY to enable live Claude generation."],
    )


def parse_generated_text(request: DraftRequest, text: str) -> GeneratedDraft:
    sections = {"TITLE": "", "COPY": "", "ASSET_BRIEF": "", "RISK_LEVEL": "medium", "REVIEW_NOTES": ""}
    current = None
    for raw_line in text.splitlines():
        line = raw_line.strip()
        label = line.rstrip(":")
        if label in sections:
            current = label
            continue
        if current and line:
            sections[current] = f"{sections[current]} {line}".strip()

    risk = sections["RISK_LEVEL"].lower()
    if risk not in {"low", "medium", "high"}:
        risk = "medium"

    notes = [note.strip("- ").strip() for note in sections["REVIEW_NOTES"].split(";") if note.strip()]
    return GeneratedDraft(
        title=sections["TITLE"] or f"{request.pillar} for {request.channel}",
        channel=request.channel,
        pillar=request.pillar,
        copy_text=sections["COPY"] or text.strip(),
        asset_brief=sections["ASSET_BRIEF"] or "Create a simple brand-aligned visual brief.",
        risk_level=risk,  # type: ignore[arg-type]
        review_notes=notes or ["Human approval required before publishing."],
    )


def generate_draft(request: DraftRequest) -> GeneratedDraft:
    if not settings.anthropic_api_key:
        return fallback_draft(request)

    client = Anthropic(api_key=settings.anthropic_api_key)
    try:
        message = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=900,
            messages=[{"role": "user", "content": build_draft_prompt(request)}],
        )
    except Exception as exc:
        raise DraftGenerationError(str(exc)) from exc

    text = "\n".join(block.text for block in message.content if getattr(block, "type", "") == "text")
    return parse_generated_text(request, text)
