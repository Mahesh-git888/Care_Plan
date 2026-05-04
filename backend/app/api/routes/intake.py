from uuid import uuid4

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.intake_session import IntakeSession
from backend.app.models.patient import Patient
from backend.app.schemas.intake import IntakeCreateRequest, IntakeCreateResponse

router = APIRouter(prefix="/api/v1", tags=["intake"])


@router.post(
    "/intake",
    response_model=IntakeCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_intake(
    payload: IntakeCreateRequest,
    db: Session = Depends(get_db),
) -> IntakeCreateResponse:
    patient = Patient(
        full_name=payload.full_name,
        phone=payload.phone,
        city=payload.city,
        situation=payload.situation,
        vertical=payload.vertical,
        pipeline_substate="PENDING_CM_ASSIGNMENT",
        ab_variant=payload.ab_variant,
    )

    intake_session = IntakeSession(
        patient_id=patient.id,
        vertical=payload.vertical,
        ab_variant=payload.ab_variant,
        raw_payload=payload.model_dump(mode="json"),
        submitted=True,
        session_token=str(uuid4()),
    )

    with db.begin():
        db.add(patient)
        db.flush()
        intake_session.patient_id = patient.id
        db.add(intake_session)

    return IntakeCreateResponse(
        patient_id=patient.id,
        status="PENDING_CM_ASSIGNMENT",
    )
