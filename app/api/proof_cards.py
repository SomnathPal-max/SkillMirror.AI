from fastapi import APIRouter, HTTPException
from app.core.database import db

router = APIRouter(prefix="/proof-cards", tags=["Proof Cards"])

@router.get("")
async def list_proof_cards():
    cards = list(db.proof_cards.values())
    return {"success": True, "proof_cards": cards}

@router.get("/{card_id}")
async def get_proof_card(card_id: str):
    card = db.proof_cards.get(card_id)
    if not card:
        # Check by token
        for c in db.proof_cards.values():
            if c.get("token") == card_id:
                return {"success": True, "proof_card": c}
        raise HTTPException(status_code=404, detail="Proof Card not found")
    return {"success": True, "proof_card": card}

@router.delete("/{card_id}")
async def delete_proof_card(card_id: str):
    if card_id in db.proof_cards:
        del db.proof_cards[card_id]
        return {"success": True, "message": "Proof card deleted"}
    raise HTTPException(status_code=404, detail="Proof Card not found")
