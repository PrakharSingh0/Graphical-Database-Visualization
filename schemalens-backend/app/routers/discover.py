from fastapi import APIRouter
router=APIRouter()

@router.get("/")
def ping():
    return {"status":"discover-ok"}
